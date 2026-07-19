import re

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from app.models import db, ContactMessage, User
from app.utils.jwt_utils import get_current_user_id

contact_bp = Blueprint('contact', __name__)

EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')


@contact_bp.route('', methods=['POST'])
def submit_contact_message():
    """Public endpoint: anyone visiting the homepage can submit the Contact Us form."""
    try:
        data = request.get_json(silent=True) or {}

        name = (data.get('name') or '').strip()
        email = (data.get('email') or '').strip()
        message = (data.get('message') or '').strip()

        if not name or not email or not message:
            return jsonify({
                'success': False,
                'message': 'Name, email and message are all required'
            }), 400

        if not EMAIL_RE.match(email):
            return jsonify({
                'success': False,
                'message': 'Please provide a valid email address'
            }), 400

        if len(message) > 5000:
            return jsonify({
                'success': False,
                'message': 'Message is too long (max 5000 characters)'
            }), 400

        new_message = ContactMessage(
            name=name[:100],
            email=email[:120],
            message=message
        )

        db.session.add(new_message)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Your message has been sent successfully. We will get back to you soon.',
            'contact_message': new_message.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Failed to send message',
            'error': str(e)
        }), 500


@contact_bp.route('', methods=['GET'])
@jwt_required()
def get_contact_messages():
    """Admin only: list all submitted contact messages."""
    try:
        user_id = get_current_user_id()
        user = User.query.get(user_id)

        if not user or not user.is_admin:
            return jsonify({
                'success': False,
                'message': 'Admin privileges required'
            }), 403

        messages = ContactMessage.query.order_by(ContactMessage.created_at.desc()).all()

        return jsonify({
            'success': True,
            'contact_messages': [m.to_dict() for m in messages]
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Failed to get contact messages',
            'error': str(e)
        }), 500


@contact_bp.route('/<int:message_id>', methods=['PUT'])
@jwt_required()
def update_contact_message(message_id):
    """Admin only: update status of a contact message (new/read/replied)."""
    try:
        user_id = get_current_user_id()
        user = User.query.get(user_id)

        if not user or not user.is_admin:
            return jsonify({
                'success': False,
                'message': 'Admin privileges required'
            }), 403

        contact_message = ContactMessage.query.get(message_id)
        if not contact_message:
            return jsonify({
                'success': False,
                'message': 'Message not found'
            }), 404

        data = request.get_json(silent=True) or {}
        if data.get('status') in ['new', 'read', 'replied']:
            contact_message.status = data['status']

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Message updated successfully',
            'contact_message': contact_message.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Failed to update message',
            'error': str(e)
        }), 500


@contact_bp.route('/<int:message_id>', methods=['DELETE'])
@jwt_required()
def delete_contact_message(message_id):
    """Admin only: delete a contact message."""
    try:
        user_id = get_current_user_id()
        user = User.query.get(user_id)

        if not user or not user.is_admin:
            return jsonify({
                'success': False,
                'message': 'Admin privileges required'
            }), 403

        contact_message = ContactMessage.query.get(message_id)
        if not contact_message:
            return jsonify({
                'success': False,
                'message': 'Message not found'
            }), 404

        db.session.delete(contact_message)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Message deleted successfully'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Failed to delete message',
            'error': str(e)
        }), 500
