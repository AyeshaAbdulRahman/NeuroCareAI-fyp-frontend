import os
from datetime import timedelta
from pathlib import Path
from dotenv import load_dotenv

# Ensure .env values are available when running `python run.py`
BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")

class Config:
    """Base configuration"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'neurocare-secret-key-2024'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'neurocare-jwt-secret-2024'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI') or 'sqlite:///neurocare.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # External chatbot service
    CHATBOT_SERVICE_URL = os.environ.get('CHATBOT_SERVICE_URL') or 'http://127.0.0.1:5001/chat'
    CHATBOT_TIMEOUT_SECONDS = int(os.environ.get('CHATBOT_TIMEOUT_SECONDS') or 90)
    
    # File uploads
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
