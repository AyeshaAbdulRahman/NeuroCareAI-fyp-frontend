from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, 
    create_refresh_token, 
    jwt_required
)
from app.models import db, User
from app.utils.activity import log_user_activity
from app.utils.decorators import validate_email, validate_username
from app.utils.jwt_utils import get_current_user_id

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/signup', methods=['POST'])
def signup():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Required fields
        required_fields = ['firstname', 'lastname', 'username', 'email', 'password', 'age', 'gender', 'category', 'country', 'city']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'{field} is required'
                }), 400
        
        # Validate email format
        if not validate_email(data['email']):
            return jsonify({
                'success': False,
                'message': 'Invalid email format'
            }), 400
        
        # Validate username format
        if not validate_username(data['username']):
            return jsonify({
                'success': False,
                'message': 'Username must be 3-20 characters and contain only letters, numbers, and underscores'
            }), 400
        
        # Check if email already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({
                'success': False,
                'message': 'Email already registered'
            }), 409
        
        # Check if username already exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({
                'success': False,
                'message': 'Username already taken'
            }), 409
        
        # Validate category
        valid_categories = ['Doctor', 'Caregiver', 'Patient', 'Other']
        if data['category'] not in valid_categories:
            return jsonify({
                'success': False,
                'message': 'Invalid category'
            }), 400
        
        # Validate gender
        valid_genders = ['Male', 'Female', 'Other']
        if data['gender'] not in valid_genders:
            return jsonify({
                'success': False,
                'message': 'Invalid gender'
            }), 400
        
        # Create new user
        new_user = User(
            username=data['username'],
            email=data['email'],
            firstname=data['firstname'],
            lastname=data['lastname'],
            age=data['age'],
            gender=data['gender'],
            category=data['category'],
            country=data['country'],
            city=data['city'],
            is_admin=False,
            is_active=True
        )
        new_user.set_password(data['password'])
        
        db.session.add(new_user)
        db.session.flush()
        log_user_activity(new_user.id, 'signup', 'User registered an account')
        db.session.commit()
        
        # Generate tokens
        access_token = create_access_token(identity=str(new_user.id))
        refresh_token = create_refresh_token(identity=str(new_user.id))
        
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'token': access_token,
            'refresh_token': refresh_token,
            'user': new_user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Registration failed',
            'error': str(e)
        }), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """User login"""
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({
                'success': False,
                'message': 'Email and password are required'
            }), 400
        
        # Find user by email
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({
                'success': False,
                'message': 'Invalid email or password'
            }), 401
        
        if not user.is_active:
            return jsonify({
                'success': False,
                'message': 'Account is deactivated'
            }), 403
        
        # Generate tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        log_user_activity(user.id, 'login', 'User logged in')
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Login failed',
            'error': str(e)
        }), 500


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """User logout"""
    try:
        user_id = get_current_user_id()
        
        log_user_activity(user_id, 'logout', 'User logged out')
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Logout successful'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Logout failed',
            'error': str(e)
        }), 500


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    try:
        user_id = get_current_user_id()
        user = User.query.get(user_id)
        
        if not user or not user.is_active:
            return jsonify({
                'success': False,
                'message': 'Invalid user'
            }), 401
        
        access_token = create_access_token(identity=str(user_id))
        
        return jsonify({
            'success': True,
            'token': access_token
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Token refresh failed',
            'error': str(e)
        }), 500
