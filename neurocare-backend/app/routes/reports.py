from __future__ import annotations

import io
import json
import re
import textwrap
import zipfile
from datetime import datetime

from flask import Blueprint, jsonify, request, send_file

from app.models import DiagnosisReport, UserActivity, db
from app.utils.decorators import diagnosis_access_required
from app.utils.jwt_utils import get_current_user_id


reports_bp = Blueprint('reports', __name__)

PDF_MIMETYPE = 'application/pdf'


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


def _pdf_escape(value: str) -> str:
    return value.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')


def _wrap_pdf_lines(text: str, max_chars: int = 95) -> list[str]:
    lines = []
    wrapper = textwrap.TextWrapper(
        width=max_chars,
        break_long_words=True,
        break_on_hyphens=False,
        replace_whitespace=False,
        drop_whitespace=False,
        subsequent_indent='  ',
    )
    for raw_line in text.splitlines():
        lines.extend(wrapper.wrap(raw_line) if raw_line else [''])
    return lines or ['']


def _build_pdf(content: str) -> bytes:
    page_width = 612
    page_height = 792
    margin_x = 54
    margin_top = 58
    line_height = 14
    font_size = 10
    lines_per_page = int((page_height - (margin_top * 2)) / line_height)
    wrapped_lines = _wrap_pdf_lines(content)
    pages = [
        wrapped_lines[index:index + lines_per_page]
        for index in range(0, len(wrapped_lines), lines_per_page)
    ] or [['']]

    objects = [
        (1, b'<< /Type /Catalog /Pages 2 0 R >>'),
        (3, b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'),
    ]
    kids = []

    for page_index, page_lines in enumerate(pages):
        content_id = 4 + (page_index * 2)
        page_id = content_id + 1
        kids.append(f'{page_id} 0 R')

        commands = [
            'BT',
            f'/F1 {font_size} Tf',
            f'{line_height} TL',
            f'{margin_x} {page_height - margin_top} Td',
        ]
        for line in page_lines:
            safe_line = line.encode('latin-1', errors='replace').decode('latin-1')
            commands.append(f'({_pdf_escape(safe_line)}) Tj')
            commands.append('T*')
        commands.append('ET')

        stream = '\n'.join(commands).encode('latin-1')
        objects.append((
            content_id,
            f'<< /Length {len(stream)} >>\nstream\n'.encode('ascii') + stream + b'\nendstream'
        ))
        objects.append((
            page_id,
            (
                f'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {page_width} {page_height}] '
                f'/Resources << /Font << /F1 3 0 R >> >> /Contents {content_id} 0 R >>'
            ).encode('ascii')
        ))

    objects.append((2, f'<< /Type /Pages /Kids [{" ".join(kids)}] /Count {len(kids)} >>'.encode('ascii')))
    objects.sort(key=lambda item: item[0])

    pdf = bytearray(b'%PDF-1.4\n%\xe2\xe3\xcf\xd3\n')
    offsets = [0]
    for object_id, body in objects:
        offsets.append(len(pdf))
        pdf.extend(f'{object_id} 0 obj\n'.encode('ascii'))
        pdf.extend(body)
        pdf.extend(b'\nendobj\n')

    xref_offset = len(pdf)
    pdf.extend(f'xref\n0 {len(objects) + 1}\n'.encode('ascii'))
    pdf.extend(b'0000000000 65535 f \n')
    for offset in offsets[1:]:
        pdf.extend(f'{offset:010d} 00000 n \n'.encode('ascii'))
    pdf.extend(
        f'trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\n'
        f'startxref\n{xref_offset}\n%%EOF\n'.encode('ascii')
    )
    return bytes(pdf)


def _render_report_pdf(report: DiagnosisReport) -> bytes:
    return _build_pdf(_render_report_text(report))


@reports_bp.route('', methods=['POST'])
@diagnosis_access_required
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
@diagnosis_access_required
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
@diagnosis_access_required
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
@diagnosis_access_required
def download_report(report_id: int):
    try:
        user_id = get_current_user_id()
        report = DiagnosisReport.query.filter_by(id=report_id, user_id=user_id).first()
        if not report:
            return jsonify({'success': False, 'message': 'Report not found'}), 404

        file_bytes = _render_report_pdf(report)
        filename = _safe_filename(f"{report.title}-{report.id}.pdf")
        return send_file(
            io.BytesIO(file_bytes),
            mimetype=PDF_MIMETYPE,
            as_attachment=True,
            download_name=filename,
        )
    except Exception as exc:
        return jsonify({'success': False, 'message': 'Failed to download report', 'error': str(exc)}), 500


@reports_bp.route('/download', methods=['GET'])
@diagnosis_access_required
def download_reports():
    try:
        user_id = get_current_user_id()
        ids_param = request.args.get('ids', '')
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
                filename = _safe_filename(f"{report.title}-{report.id}.pdf")
                archive.writestr(filename, _render_report_pdf(report))

        buffer.seek(0)
        return send_file(
            buffer,
            mimetype='application/zip',
            as_attachment=True,
            download_name='diagnosis-reports.zip',
        )
    except Exception as exc:
        return jsonify({'success': False, 'message': 'Failed to download reports', 'error': str(exc)}), 500
