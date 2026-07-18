from __future__ import annotations

import io
import json
import re
import zipfile
from datetime import datetime

from flask import Blueprint, jsonify, request, send_file
from flask_jwt_extended import jwt_required

from app.models import DiagnosisReport, UserActivity, db
from app.utils.jwt_utils import get_current_user_id


reports_bp = Blueprint('reports', __name__)


def _safe_filename(value: str) -> str:
    value = re.sub(r'[^A-Za-z0-9._-]+', '_', value or 'report')
    return value.strip('_') or 'report'


def _extract_payload(data: dict) -> dict:
    payload = data.get('results')
    if isinstance(payload, dict):
        return payload
    payload = data.get('report')
    if isinstance(payload, dict):
        return payload
    return data if isinstance(data, dict) else {}


def _build_metadata(payload: dict, data: dict) -> dict:
    report_type = (data.get('report_type') or payload.get('mode') or 'single').strip().lower()
    source_files = data.get('source_files')
    if not isinstance(source_files, list):
        source_file = data.get('source_file')
        source_files = [source_file] if source_file else []
    source_files = [str(item) for item in source_files if str(item).strip()]

    if report_type == 'batch':
        title = data.get('title') or f"Batch EEG Report - {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}"
        summary = data.get('summary') or f"Batch diagnosis saved with {payload.get('n_test_samples', 0)} test samples"
        verdict = data.get('verdict') or f"Accuracy {payload.get('accuracy', 0):.2f}"
        confidence = data.get('confidence')
        if confidence is None:
            confidence = payload.get('accuracy')
    else:
        title = data.get('title') or f"Single EEG Report - {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}"
        ensemble = payload.get('ensemble', {}) if isinstance(payload.get('ensemble'), dict) else {}
        task = payload.get('tasks', {}).get('task2', {}) if isinstance(payload.get('tasks'), dict) else {}
        verdict = data.get('verdict') or ensemble.get('verdict') or 'UNKNOWN'
        confidence = data.get('confidence')
        if confidence is None:
            confidence = ensemble.get('avg_dementia_prob') or task.get('confidence')
        summary = data.get('summary') or ensemble.get('interpretation') or 'Single patient EEG diagnosis report'

    return {
        'report_type': report_type,
        'title': title[:160],
        'source_files': source_files,
        'verdict': verdict[:120] if isinstance(verdict, str) else str(verdict),
        'confidence': confidence,
        'summary': summary[:255] if isinstance(summary, str) else str(summary),
    }


def _render_report_text(report: DiagnosisReport) -> str:
    payload = report.get_report_json()
    source_files = report.get_source_files()
    lines = [
        'NeuroCare AI Diagnosis Report',
        '================================',
        f"Report ID: {report.id}",
        f"Title: {report.title}",
        f"Type: {report.report_type}",
        f"Created At: {report.created_at.isoformat() if report.created_at else ''}",
        f"Source Files: {', '.join(source_files) if source_files else 'N/A'}",
        f"Verdict: {report.verdict or 'N/A'}",
        f"Confidence: {report.confidence if report.confidence is not None else 'N/A'}",
        f"Summary: {report.summary or 'N/A'}",
        '',
        'Payload:',
        json.dumps(payload, indent=2, ensure_ascii=False),
    ]
    return '\n'.join(lines)


@reports_bp.route('', methods=['POST'])
@jwt_required()
def save_report():
    try:
        user_id = get_current_user_id()
        data = request.get_json(silent=True) or {}
        payload = _extract_payload(data)

        if not payload:
            return jsonify({'success': False, 'message': 'results payload is required'}), 400

        meta = _build_metadata(payload, data)
        report = DiagnosisReport(
            user_id=user_id,
            title=meta['title'],
            report_type=meta['report_type'],
            source_files=json.dumps(meta['source_files']),
            verdict=meta['verdict'],
            confidence=meta['confidence'],
            summary=meta['summary'],
            report_json=json.dumps(payload),
        )
        db.session.add(report)
        db.session.add(UserActivity(
            user_id=user_id,
            activity_type='diagnosis_report_saved',
            description=f"Saved diagnosis report: {report.title}"
        ))
        db.session.commit()

        return jsonify({'success': True, 'message': 'Report saved successfully', 'report': report.to_dict()}), 201
    except Exception as exc:
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Failed to save report', 'error': str(exc)}), 500


@reports_bp.route('', methods=['GET'])
@jwt_required()
def list_reports():
    try:
        user_id = get_current_user_id()
        limit = request.args.get('limit', 50, type=int)
        fetch_all = request.args.get('all', 'false').lower() == 'true'

        query = DiagnosisReport.query.filter_by(user_id=user_id).order_by(DiagnosisReport.created_at.desc())
        if not fetch_all:
            safe_limit = 20 if not limit or limit < 1 else min(limit, 200)
            query = query.limit(safe_limit)

        reports = query.all()
        return jsonify({'success': True, 'reports': [report.to_dict() for report in reports]}), 200
    except Exception as exc:
        return jsonify({'success': False, 'message': 'Failed to get reports', 'error': str(exc)}), 500


@reports_bp.route('/<int:report_id>', methods=['GET'])
@jwt_required()
def get_report(report_id: int):
    try:
        user_id = get_current_user_id()
        report = DiagnosisReport.query.filter_by(id=report_id, user_id=user_id).first()
        if not report:
            return jsonify({'success': False, 'message': 'Report not found'}), 404
        return jsonify({'success': True, 'report': report.to_dict()}), 200
    except Exception as exc:
        return jsonify({'success': False, 'message': 'Failed to get report', 'error': str(exc)}), 500


@reports_bp.route('/<int:report_id>/download', methods=['GET'])
@jwt_required()
def download_report(report_id: int):
    try:
        user_id = get_current_user_id()
        report = DiagnosisReport.query.filter_by(id=report_id, user_id=user_id).first()
        if not report:
            return jsonify({'success': False, 'message': 'Report not found'}), 404

        format_name = (request.args.get('format') or 'txt').strip().lower()
        text = _render_report_text(report)
        if format_name == 'json':
            payload = report.to_dict()
            file_bytes = json.dumps(payload, indent=2, ensure_ascii=False).encode('utf-8')
            mimetype = 'application/json'
            extension = 'json'
        else:
            file_bytes = text.encode('utf-8')
            mimetype = 'text/plain'
            extension = 'txt'

        filename = _safe_filename(f"{report.title}-{report.id}.{extension}")
        return send_file(
            io.BytesIO(file_bytes),
            mimetype=mimetype,
            as_attachment=True,
            download_name=filename,
        )
    except Exception as exc:
        return jsonify({'success': False, 'message': 'Failed to download report', 'error': str(exc)}), 500


@reports_bp.route('/download', methods=['GET'])
@jwt_required()
def download_reports():
    try:
        user_id = get_current_user_id()
        ids_param = request.args.get('ids', '')
        format_name = (request.args.get('format') or 'txt').strip().lower()
        report_ids = [int(item) for item in ids_param.split(',') if item.strip().isdigit()]

        if not report_ids:
            return jsonify({'success': False, 'message': 'ids query parameter is required'}), 400

        reports = DiagnosisReport.query.filter(
            DiagnosisReport.user_id == user_id,
            DiagnosisReport.id.in_(report_ids),
        ).order_by(DiagnosisReport.created_at.desc()).all()

        if not reports:
            return jsonify({'success': False, 'message': 'No matching reports found'}), 404

        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as archive:
            for report in reports:
                extension = 'json' if format_name == 'json' else 'txt'
                filename = _safe_filename(f"{report.title}-{report.id}.{extension}")
                if format_name == 'json':
                    content = json.dumps(report.to_dict(), indent=2, ensure_ascii=False)
                else:
                    content = _render_report_text(report)
                archive.writestr(filename, content)

        buffer.seek(0)
        return send_file(
            buffer,
            mimetype='application/zip',
            as_attachment=True,
            download_name='diagnosis-reports.zip',
        )
    except Exception as exc:
        return jsonify({'success': False, 'message': 'Failed to download reports', 'error': str(exc)}), 500