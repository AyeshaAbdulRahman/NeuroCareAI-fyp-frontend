from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models import db, Feedback, User
from app.utils.jwt_utils import get_current_user_id

feedback_bp = Blueprint('feedback', __name__)


@feedback_bp.route('', methods=['POST'])
@jwt_required()
def submit_feedback():
    """Submit feedback"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()
        
        if not data.get('feedback_text'):
            return jsonify({
                'success': False,
                'message': 'Feedback text is required'
            }), 400
        
        # Create new feedback
        new_feedback = Feedback(
            user_id=user_id,
            feedback_text=data['feedback_text'],
            status='pending'
        )
        
        db.session.add(new_feedback)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Feedback submitted successfully',
            'feedback': new_feedback.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Failed to submit feedback',
            'error': str(e)
        }), 500


@feedback_bp.route('', methods=['GET'])
@jwt_required()
def get_my_feedback():
    """Get current user's feedback"""
    try:
        user_id = get_current_user_id()
        
        feedbacks = Feedback.query.filter_by(user_id=user_id)\
            .order_by(Feedback.created_at.desc())\
            .all()
        
        return jsonify({
            'success': True,
            'feedbacks': [feedback.to_dict() for feedback in feedbacks]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Failed to get feedback',
            'error': str(e)
        }), 500


@feedback_bp.route('/all', methods=['GET'])
@jwt_required()
def get_all_feedback():
    """Get all feedback (Admin only)"""
    try:
        user_id = get_current_user_id()
        user = User.query.get(user_id)
        
        if not user or not user.is_admin:
            return jsonify({
                'success': False,
                'message': 'Admin privileges required'
            }), 403
        
        # Get all feedbacks with user info
        feedbacks = Feedback.query.order_by(Feedback.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'feedbacks': [feedback.to_dict() for feedback in feedbacks]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Failed to get feedback',
            'error': str(e)
        }), 500


@feedback_bp.route('/<int:feedback_id>', methods=['PUT'])
@jwt_required()
def update_feedback(feedback_id):
    """Update feedback (Admin only)"""
    try:
        user_id = get_current_user_id()
        user = User.query.get(user_id)
        
        if not user or not user.is_admin:
            return jsonify({
                'success': False,
                'message': 'Admin privileges required'
            }), 403
        
        feedback = Feedback.query.get(feedback_id)
        
        if not feedback:
            return jsonify({
                'success': False,
                'message': 'Feedback not found'
            }), 404
        
        data = request.get_json()
        
        if 'status' in data:
            if data['status'] in ['pending', 'reviewed', 'resolved']:
                feedback.status = data['status']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Feedback updated successfully',
            'feedback': feedback.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Failed to update feedback',
            'error': str(e)
        }), 500


@feedback_bp.route('/<int:feedback_id>', methods=['DELETE'])
@jwt_required()
def delete_feedback(feedback_id):
    """Delete feedback"""
    try:
        user_id = get_current_user_id()
        user = User.query.get(user_id)
        
        feedback = Feedback.query.get(feedback_id)
        
        if not feedback:
            return jsonify({
                'success': False,
                'message': 'Feedback not found'
            }), 404
        
        # User can delete their own feedback, or admin can delete any
        if feedback.user_id != user_id and (not user or not user.is_admin):
            return jsonify({
                'success': False,
                'message': 'Permission denied'
            }), 403
        
        db.session.delete(feedback)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Feedback deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Failed to delete feedback',
            'error': str(e)
        }), 500
