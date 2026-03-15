from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename
import os
import uuid
from app.models import db, User, UserActivity
from app.utils.decorators import validate_email, validate_username
from app.utils.jwt_utils import get_current_user_id

users_bp = Blueprint('users', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user profile"""
    try:
        user_id = get_current_user_id()
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
            'message': 'Failed to get profile',
            'error': str(e)
        }), 500


@users_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    try:
        user_id = get_current_user_id()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        data = request.get_json()
        
        # Update fields if provided
        if 'firstname' in data:
            user.firstname = data['firstname']
        if 'lastname' in data:
            user.lastname = data['lastname']
        if 'username' in data:
            # Check if username is taken by another user
            existing_user = User.query.filter_by(username=data['username']).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({
                    'success': False,
                    'message': 'Username already taken'
                }), 409
            if not validate_username(data['username']):
                return jsonify({
                    'success': False,
                    'message': 'Invalid username format'
                }), 400
            user.username = data['username']
        if 'age' in data:
            user.age = data['age']
        if 'gender' in data:
            if data['gender'] in ['Male', 'Female', 'Other']:
                user.gender = data['gender']
        if 'category' in data:
            if data['category'] in ['Doctor', 'Caregiver', 'Patient', 'Other']:
                user.category = data['category']
        if 'country' in data:
            user.country = data['country']
        if 'city' in data:
            user.city = data['city']
        if 'password' in data and data['password']:
            user.set_password(data['password'])
        
        db.session.commit()
        
        # Log activity
        activity = UserActivity(
            user_id=user.id,
            activity_type='profile_update',
            description='User updated their profile'
        )
        db.session.add(activity)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Failed to update profile',
            'error': str(e)
        }), 500


@users_bp.route('/profile-picture', methods=['POST'])
@jwt_required()
def upload_profile_picture():
    """Upload profile picture"""
    try:
        user_id = get_current_user_id()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'message': 'No file provided'
            }), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({
                'success': False,
                'message': 'No file selected'
            }), 400
        
        if file and allowed_file(file.filename):
            # Generate unique filename
            ext = file.filename.rsplit('.', 1)[1].lower()
            filename = f"{uuid.uuid4().hex}.{ext}"
            
            # Create uploads directory if it doesn't exist
            upload_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'uploads')
            os.makedirs(upload_folder, exist_ok=True)
            
            # Save file
            filepath = os.path.join(upload_folder, filename)
            file.save(filepath)
            
            # Delete old profile picture if exists
            if user.profile_picture:
                old_path = os.path.join(upload_folder, user.profile_picture.split('/')[-1])
                if os.path.exists(old_path):
                    os.remove(old_path)
            
            # Update user profile
            user.profile_picture = f"/uploads/{filename}"
            activity = UserActivity(
                user_id=user.id,
                activity_type='profile_picture_update',
                description='User updated their profile picture'
            )
            db.session.add(activity)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Profile picture uploaded successfully',
                'profile_picture': user.profile_picture
            }), 200
        
        return jsonify({
            'success': False,
            'message': 'Invalid file type. Allowed: png, jpg, jpeg, gif'
        }), 400
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Failed to upload profile picture',
            'error': str(e)
        }), 500


@users_bp.route('/account', methods=['DELETE'])
@jwt_required()
def delete_account():
    """Delete user account"""
    try:
        user_id = get_current_user_id()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        # Soft delete - just deactivate
        user.is_active = False
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Account deactivated successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Failed to delete account',
            'error': str(e)
        }), 500


@users_bp.route('/activity', methods=['GET'])
@jwt_required()
def get_activity():
    """Get user activity history"""
    try:
        user_id = get_current_user_id()

        fetch_all = request.args.get('all', 'false').lower() == 'true'
        activity_type = request.args.get('activity_type')
        limit = request.args.get('limit', 20, type=int)

        query = UserActivity.query.filter_by(user_id=user_id)

        if activity_type:
            query = query.filter_by(activity_type=activity_type)

        query = query.order_by(UserActivity.created_at.desc())

        if not fetch_all:
            safe_limit = 20 if not limit or limit < 1 else min(limit, 200)
            query = query.limit(safe_limit)

        activities = query.all()
        
        return jsonify({
            'success': True,
            'activities': [activity.to_dict() for activity in activities]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Failed to get activity',
            'error': str(e)
        }), 500


@users_bp.route('/activity', methods=['POST'])
@jwt_required()
def create_activity():
    """Create a custom user activity entry"""
    try:
        user_id = get_current_user_id()
        data = request.get_json() or {}

        activity_type = (data.get('activity_type') or '').strip()
        description = (data.get('description') or '').strip()

        if not activity_type:
            return jsonify({
                'success': False,
                'message': 'activity_type is required'
            }), 400

        activity = UserActivity(
            user_id=user_id,
            activity_type=activity_type[:50],
            description=description[:200] if description else None
        )
        db.session.add(activity)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Activity logged successfully',
            'activity': activity.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Failed to log activity',
            'error': str(e)
        }), 500
