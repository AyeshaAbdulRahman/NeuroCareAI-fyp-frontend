from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request
from app.models import User
from app.utils.jwt_utils import get_current_user_id


def jwt_required_custom(fn):
    """Custom JWT required decorator with additional checks"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_current_user_id()
            user = User.query.get(user_id)
            if not user:
                return jsonify({
                    'success': False,
                    'message': 'User not found',
                    'error': 'USER_NOT_FOUND'
                }), 404
            if not user.is_active:
                return jsonify({
                    'success': False,
                    'message': 'Account is deactivated',
                    'error': 'ACCOUNT_INACTIVE'
                }), 403
            return fn(*args, **kwargs)
        except Exception as e:
            return jsonify({
                'success': False,
                'message': 'Invalid or missing token',
                'error': 'TOKEN_INVALID'
            }), 401
    return wrapper


def admin_required(fn):
    """Decorator to require admin privileges"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_current_user_id()
            user = User.query.get(user_id)
            if not user:
                return jsonify({
                    'success': False,
                    'message': 'User not found',
                    'error': 'USER_NOT_FOUND'
                }), 404
            if not user.is_admin:
                return jsonify({
                    'success': False,
                    'message': 'Admin privileges required',
                    'error': 'ADMIN_REQUIRED'
                }), 403
            return fn(*args, **kwargs)
        except Exception as e:
            return jsonify({
                'success': False,
                'message': 'Invalid or missing token',
                'error': 'TOKEN_INVALID'
            }), 401
    return wrapper


def diagnosis_access_required(fn):
    """Decorator to block patient accounts from diagnosis/report features."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_current_user_id()
            user = User.query.get(user_id)
            if not user:
                return jsonify({
                    'success': False,
                    'message': 'User not found',
                    'error': 'USER_NOT_FOUND'
                }), 404
            if not user.is_active:
                return jsonify({
                    'success': False,
                    'message': 'Account is deactivated',
                    'error': 'ACCOUNT_INACTIVE'
                }), 403
            if (user.category or '').strip().lower() == 'patient' and not user.is_admin:
                return jsonify({
                    'success': False,
                    'message': 'Diagnosis access is not available for patient accounts',
                    'error': 'DIAGNOSIS_ACCESS_DENIED'
                }), 403
            return fn(*args, **kwargs)
        except Exception:
            return jsonify({
                'success': False,
                'message': 'Invalid or missing token',
                'error': 'TOKEN_INVALID'
            }), 401
    return wrapper


def validate_email(email):
    """Validate email format"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_username(username):
    """Validate username format"""
    import re
    pattern = r'^[a-zA-Z0-9_]{3,20}$'
    return re.match(pattern, username) is not None
