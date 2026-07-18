# Routes package initialization
from app.routes.auth import auth_bp
from app.routes.users import users_bp
from app.routes.feedback import feedback_bp
from app.routes.admin import admin_bp
from app.routes.chatbot import chatbot_bp
from app.routes.reports import reports_bp

__all__ = ['auth_bp', 'users_bp', 'feedback_bp', 'admin_bp', 'chatbot_bp', 'reports_bp']
