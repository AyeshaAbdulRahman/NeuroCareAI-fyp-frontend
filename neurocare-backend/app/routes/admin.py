from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy import func
from sqlalchemy.orm import joinedload
from app.models import db, User, Feedback, UserActivity
from app.utils.activity import log_user_activity
from app.utils.decorators import validate_email, validate_username
from app.utils.jwt_utils import get_current_user_id

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    """Get all users (Admin only)"""
    try:
        user_id = get_current_user_id()
        user = User.query.get(user_id)
        
        if not user or not user.is_admin:
            return jsonify({
                'success': False,
                'message': 'Admin privileges required'
            }), 403
        
        # Pagination
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Filter options
        category = request.args.get('category')
        is_active = request.args.get('is_active')
        
        query = User.query
        
        if category:
            query = query.filter_by(category=category)
        if is_active is not None:
            query = query.filter_by(is_active=is_active.lower() == 'true')
        
        users = query.order_by(User.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'success': True,
            'users': [u.to_dict() for u in users.items],
            'total': users.total,
            'page': users.page,
            'pages': users.pages
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Failed to get users',
            'error': str(e)
        }), 500


@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    """Get specific user (Admin only)"""
    try:
        current_user_id = get_current_user_id()
        current_user = User.query.get(current_user_id)
        
        if not current_user or not current_user.is_admin:
            return jsonify({
                'success': False,
                'message': 'Admin privileges required'
            }), 403
        
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        return jsonify({
            'success': True,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Failed to get user',
            'error': str(e)
        }), 500


@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    """Update user (Admin only)"""
    try:
        current_user_id = get_current_user_id()
        current_user = User.query.get(current_user_id)
        
        if not current_user or not current_user.is_admin:
            return jsonify({
                'success': False,
                'message': 'Admin privileges required'
            }), 403
        
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        data = request.get_json()
        
        # Admin can update any field
        if 'firstname' in data:
            user.firstname = data['firstname']
        if 'lastname' in data:
            user.lastname = data['lastname']
        if 'username' in data:
            existing = User.query.filter_by(username=data['username']).first()
            if existing and existing.id != user.id:
                return jsonify({
                    'success': False,
                    'message': 'Username already taken'
                }), 409
            user.username = data['username']
        if 'age' in data:
            user.age = data['age']
        if 'gender' in data:
            user.gender = data['gender']
        if 'category' in data:
            user.category = data['category']
        if 'country' in data:
            user.country = data['country']
        if 'city' in data:
            user.city = data['city']
        if 'is_active' in data:
            user.is_active = data['is_active']
        if 'is_admin' in data:
            user.is_admin = data['is_admin']
        if 'password' in data and data['password']:
            user.set_password(data['password'])
        
        log_user_activity(
            current_user.id,
            'admin_user_updated',
            f'Updated user {user.username} (ID {user.id})'
        )
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'User updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Failed to update user',
            'error': str(e)
        }), 500


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """Delete user (Admin only)"""
    try:
        current_user_id = get_current_user_id()
        current_user = User.query.get(current_user_id)
        
        if not current_user or not current_user.is_admin:
            return jsonify({
                'success': False,
                'message': 'Admin privileges required'
            }), 403
        
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        # Prevent admin from deleting themselves
        if user.id == current_user_id:
            return jsonify({
                'success': False,
                'message': 'Cannot delete your own account'
            }), 400
        
        # Soft delete
        user.is_active = False
        log_user_activity(
            current_user.id,
            'admin_user_deactivated',
            f'Deactivated user {user.username} (ID {user.id})'
        )
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'User deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Failed to delete user',
            'error': str(e)
        }), 500


@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    """Get dashboard statistics (Admin only)"""
    try:
        user_id = get_current_user_id()
        user = User.query.get(user_id)
        
        if not user or not user.is_admin:
            return jsonify({
                'success': False,
                'message': 'Admin privileges required'
            }), 403
        
        # Total users
        total_users = User.query.count()
        
        # Total feedback
        total_feedback = Feedback.query.count()
        
        # Pending feedback
        pending_feedback = Feedback.query.filter_by(status='pending').count()
        
        # Users by category
        users_by_category = db.session.query(
            User.category,
            func.count(User.id)
        ).group_by(User.category).all()
        
        users_by_category_dict = {category: count for category, count in users_by_category if category}
        
        # Recent registrations (last 7 days)
        from datetime import datetime, timedelta
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        recent_registrations = User.query.filter(User.created_at >= seven_days_ago).count()
        
        # Active users
        active_users = User.query.filter_by(is_active=True).count()
        
        # Feedback by status
        feedback_by_status = db.session.query(
            Feedback.status,
            func.count(Feedback.id)
        ).group_by(Feedback.status).all()
        
        feedback_by_status_dict = {status: count for status, count in feedback_by_status}
        
        return jsonify({
            'success': True,
            'stats': {
                'total_users': total_users,
                'active_users': active_users,
                'total_feedback': total_feedback,
                'pending_feedback': pending_feedback,
                'users_by_category': users_by_category_dict,
                'feedback_by_status': feedback_by_status_dict,
                'recent_registrations': recent_registrations
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Failed to get statistics',
            'error': str(e)
        }), 500


@admin_bp.route('/activity', methods=['GET'])
@jwt_required()
def get_activity_logs():
    """Get recent activity across all users (Admin only)."""
    try:
        current_user_id = get_current_user_id()
        current_user = User.query.get(current_user_id)
        
        if not current_user or not current_user.is_admin:
            return jsonify({
                'success': False,
                'message': 'Admin privileges required'
            }), 403

        fetch_all = request.args.get('all', 'false').lower() == 'true'
        activity_type = request.args.get('activity_type')
        actor_role = request.args.get('role')
        actor_user_id = request.args.get('user_id', type=int)
        limit = request.args.get('limit', 50, type=int)
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', limit if limit and limit > 0 else 50, type=int)
        safe_per_page = 50 if not per_page or per_page < 1 else min(per_page, 200)

        query = UserActivity.query.options(joinedload(UserActivity.user))

        if activity_type:
            query = query.filter(UserActivity.activity_type == activity_type)

        if actor_user_id:
            query = query.filter(UserActivity.user_id == actor_user_id)

        if actor_role in {'admin', 'user'}:
            query = query.join(UserActivity.user)
            query = query.filter(User.is_admin.is_(actor_role == 'admin'))

        query = query.order_by(UserActivity.created_at.desc(), UserActivity.id.desc())
        total = query.order_by(None).count()

        if fetch_all:
            activities = query.limit(safe_per_page).all()
            total_pages = 1
            current_page = 1
        else:
            pagination = query.paginate(page=page, per_page=safe_per_page, error_out=False)
            activities = pagination.items
            total_pages = pagination.pages
            current_page = pagination.page

        return jsonify({
            'success': True,
            'activities': [activity.to_dict(include_user=True) for activity in activities],
            'total': total,
            'page': current_page,
            'pages': total_pages,
            'per_page': safe_per_page
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Failed to get activity logs',
            'error': str(e)
        }), 500
