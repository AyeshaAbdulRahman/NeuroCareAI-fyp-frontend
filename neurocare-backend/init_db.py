"""
Database Initialization Script for NeuroCare AI

This script helps set up the database (SQLite or PostgreSQL) with all required tables.

Usage:
    python init_db.py              # Initialize with default SQLite
    python init_db.py --postgres   # Initialize with PostgreSQL
"""

import os
import sys
import argparse
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

# Add parent directory to path
sys.path.insert(0, str(BASE_DIR))

from app import create_app
from app.models import db, User, ChatSession, ChatMessage, ChatArchive


def initialize_database(config_name='development'):
    """Initialize the database with all tables"""
    print("\n" + "="*60)
    print("  NeuroCare AI - Database Initialization")
    print("="*60 + "\n")
    
    app = create_app(config_name)
    
    with app.app_context():
        print(f"📊 Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
        print("\n⏳ Creating database tables...\n")
        
        try:
            # Create all tables
            db.create_all()
            print("✅ Database tables created successfully!")
            
            # List created tables
            print("\n📋 Created tables:")
            print("   • users")
            print("   • feedbacks")
            print("   • user_activities")
            print("   • chat_sessions")
            print("   • chat_messages")
            print("   • chat_archives")
            
            # Create default admin if doesn't exist
            admin = User.query.filter_by(email='admin@neurocare.ai').first()
            if not admin:
                print("\n👤 Creating default admin account...")
                admin = User(
                    username='admin',
                    email='admin@neurocare.ai',
                    firstname='Admin',
                    lastname='User',
                    age=30,
                    gender='Other',
                    category='Other',
                    country='Pakistan',
                    city='Karachi',
                    is_admin=True,
                    is_active=True
                )
                admin.set_password('admin123')
                db.session.add(admin)
                db.session.commit()
                print("✅ Admin account created!")
                print("\n   Email: admin@neurocare.ai")
                print("   Password: admin123")
            else:
                print("\n✅ Admin account already exists!")
            
            print("\n" + "="*60)
            print("  ✨ Database initialization complete!")
            print("="*60 + "\n")
            
            # Show connection info
            db_uri = app.config['SQLALCHEMY_DATABASE_URI']
            if 'postgresql' in db_uri:
                print("🗄️  Using PostgreSQL database")
            elif 'sqlite' in db_uri:
                print("🗄️  Using SQLite database")
            else:
                print(f"🗄️  Using {db_uri.split('://')[0]} database")
            
            print("\n🚀 Ready to run: python run.py\n")
            
        except Exception as e:
            print(f"\n❌ Error during initialization: {str(e)}\n")
            sys.exit(1)


def migrate_sqlite_to_postgres():
    """Helper function to migrate from SQLite to PostgreSQL"""
    print("\n" + "="*60)
    print("  SQLite to PostgreSQL Migration Helper")
    print("="*60 + "\n")
    
    print("📝 Steps to migrate from SQLite to PostgreSQL:\n")
    print("1. Setup PostgreSQL:")
    print("   • Install PostgreSQL if not already installed")
    print("   • Create a new database: createdb neurocare_ai")
    print("   • Update .env with PostgreSQL connection:\n")
    print("      DATABASE_URI=postgresql://username:password@localhost:5432/neurocare_ai\n")
    
    print("2. Update requirements:")
    print("   • pip install psycopg2-binary\n")
    
    print("3. Run initialization:")
    print("   • python init_db.py --postgres\n")
    
    print("4. Verify connection in run.py output\n")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description='Initialize NeuroCare AI Database'
    )
    parser.add_argument(
        '--postgres',
        action='store_true',
        help='Use PostgreSQL (requires DATABASE_URI in .env)'
    )
    parser.add_argument(
        '--migrate-help',
        action='store_true',
        help='Show SQLite to PostgreSQL migration instructions'
    )
    
    args = parser.parse_args()
    
    if args.migrate_help:
        migrate_sqlite_to_postgres()
    else:
        try:
            initialize_database()
        except Exception as e:
            print(f"\n❌ Initialization failed: {str(e)}\n")
            sys.exit(1)
