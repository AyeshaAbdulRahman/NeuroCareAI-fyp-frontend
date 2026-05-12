from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import bcrypt
import json

db = SQLAlchemy()


class User(db.Model):
    """User model for authentication and profile management"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    firstname = db.Column(db.String(50), nullable=False)
    lastname = db.Column(db.String(50), nullable=False)
    age = db.Column(db.Integer)
    gender = db.Column(db.String(20))
    category = db.Column(db.String(20))  # Doctor, Caregiver, Patient, Other
    country = db.Column(db.String(50))
    city = db.Column(db.String(50))
    profile_picture = db.Column(db.String(200), default=None)
    is_admin = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    feedbacks = db.relationship('Feedback', backref='user', lazy=True)
    activities = db.relationship('UserActivity', backref='user', lazy=True)
    chat_sessions = db.relationship('ChatSession', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Hash and set the password"""
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password):
        """Verify the password"""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_dict(self):
        """Convert user to dictionary"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'firstname': self.firstname,
            'lastname': self.lastname,
            'age': self.age,
            'gender': self.gender,
            'category': self.category,
            'country': self.country,
            'city': self.city,
            'profile_picture': self.profile_picture,
            'is_admin': self.is_admin,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() + 'Z' if self.created_at else None,
            'updated_at': self.updated_at.isoformat() + 'Z' if self.updated_at else None
        }


class Feedback(db.Model):
    """Feedback model for user submissions"""
    __tablename__ = 'feedbacks'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    feedback_text = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, reviewed, resolved
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert feedback to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'feedback_text': self.feedback_text,
            'status': self.status,
            'created_at': self.created_at.isoformat() + 'Z' if self.created_at else None,
            'updated_at': self.updated_at.isoformat() + 'Z' if self.updated_at else None,
            'user': self.user.to_dict() if self.user else None
        }


class UserActivity(db.Model):
    """User activity tracking for dashboard"""
    __tablename__ = 'user_activities'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    activity_type = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self, include_user=False):
        """Convert activity to dictionary"""
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'activity_type': self.activity_type,
            'description': self.description,
            'created_at': self.created_at.isoformat() + 'Z' if self.created_at else None
        }

        if include_user and self.user:
            data['user'] = {
                'id': self.user.id,
                'username': self.user.username,
                'email': self.user.email,
                'firstname': self.user.firstname,
                'lastname': self.user.lastname,
                'is_admin': self.user.is_admin,
            }

        return data


class ChatSession(db.Model):
    """Per-user chat session for chatbot conversations."""
    __tablename__ = 'chat_sessions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    title = db.Column(db.String(120), nullable=False, default='New Chat')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    messages = db.relationship(
        'ChatMessage',
        backref='session',
        lazy=True,
        cascade='all, delete-orphan'
    )

    def to_dict(self):
        last_message = None
        if self.messages:
            ordered = sorted(self.messages, key=lambda item: item.created_at or datetime.min)
            last_message = ordered[-1]
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'created_at': self.created_at.isoformat() + 'Z' if self.created_at else None,
            'updated_at': self.updated_at.isoformat() + 'Z' if self.updated_at else None,
            'message_count': len(self.messages) if self.messages else 0,
            'last_message_preview': (
                (last_message.message_text[:80] + '...') if last_message and len(last_message.message_text) > 80
                else (last_message.message_text if last_message else '')
            )
        }


class ChatMessage(db.Model):
    """A single user/bot message in a chat session."""
    __tablename__ = 'chat_messages'

    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('chat_sessions.id'), nullable=False, index=True)
    sender = db.Column(db.String(20), nullable=False)  # user | bot
    message_text = db.Column(db.Text, nullable=False)
    references_json = db.Column(db.Text, default='[]')
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    def references(self):
        try:
            parsed = json.loads(self.references_json or '[]')
            return parsed if isinstance(parsed, list) else []
        except Exception:
            return []

    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'sender': self.sender,
            'message_text': self.message_text,
            'references': self.references(),
            'created_at': self.created_at.isoformat() + 'Z' if self.created_at else None
        }


class ChatArchive(db.Model):
    """Archive for chat messages when they exceed max limit per session."""
    __tablename__ = 'chat_archives'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('chat_sessions.id'), nullable=False, index=True)
    messages_json = db.Column(db.Text, nullable=False)  # JSON array of archived messages
    archived_at = db.Column(db.DateTime, default=datetime.utcnow)
    message_count = db.Column(db.Integer, default=0)
    
    def to_dict(self):
        try:
            messages = json.loads(self.messages_json or '[]')
            return {
                'id': self.id,
                'session_id': self.session_id,
                'message_count': self.message_count,
                'archived_at': self.archived_at.isoformat() if self.archived_at else None,
                'first_message_preview': messages[0]['message_text'][:50] if messages else ''
            }
        except Exception:
            return {
                'id': self.id,
                'session_id': self.session_id,
                'message_count': self.message_count,
                'archived_at': self.archived_at.isoformat() if self.archived_at else None
            }
