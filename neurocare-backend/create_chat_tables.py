"""
Create Chat-Related Tables in PostgreSQL

This script creates only the chat tables:
- chat_sessions
- chat_messages
- chat_archives

Run this to initialize chat tables in your PostgreSQL database.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# Add parent directory to path
sys.path.insert(0, str(BASE_DIR))

from app import create_app
from app.models import db, ChatSession, ChatMessage, ChatArchive


def create_chat_tables():
    """Create chat-related tables in the database"""
    print("\n" + "="*70)
    print("  Creating Chat-Related Tables in PostgreSQL")
    print("="*70 + "\n")
    
    app = create_app('development')
    
    with app.app_context():
        db_uri = app.config['SQLALCHEMY_DATABASE_URI']
        print(f"📊 Database: {db_uri}\n")
        
        try:
            # Create only chat-related tables
            print("⏳ Creating chat tables...\n")
            
            # Create tables
            db.create_all()
            
            # Check what was created
            print("✅ Tables created successfully!\n")
            
            # Display table info
            print("📋 Chat Tables Created:")
            print("   ┌─ chat_sessions")
            print("   │  ├─ id (INT, Primary Key)")
            print("   │  ├─ user_id (INT, Foreign Key → users)")
            print("   │  ├─ title (VARCHAR)")
            print("   │  ├─ created_at (TIMESTAMP)")
            print("   │  └─ updated_at (TIMESTAMP)")
            print("   │")
            print("   ├─ chat_messages")
            print("   │  ├─ id (INT, Primary Key)")
            print("   │  ├─ session_id (INT, Foreign Key → chat_sessions)")
            print("   │  ├─ sender (VARCHAR) - 'user' or 'bot'")
            print("   │  ├─ message_text (TEXT)")
            print("   │  ├─ references_json (TEXT) - JSON array")
            print("   │  └─ created_at (TIMESTAMP)")
            print("   │")
            print("   └─ chat_archives")
            print("      ├─ id (INT, Primary Key)")
            print("      ├─ session_id (INT, Foreign Key → chat_sessions)")
            print("      ├─ messages_json (TEXT) - JSON array of archived messages")
            print("      ├─ message_count (INT)")
            print("      └─ archived_at (TIMESTAMP)")
            
            print("\n" + "="*70)
            print("  ✨ Chat Tables Ready!")
            print("="*70 + "\n")
            
            print("📊 How it works:")
            print("   • chat_sessions: Stores user conversations")
            print("   • chat_messages: Stores active messages (max 50 per session)")
            print("   • chat_archives: Stores archived messages when exceeds 50")
            print("\n🚀 Next Steps:")
            print("   1. Start backend: python run.py")
            print("   2. Login as admin@neurocare.ai / admin123")
            print("   3. Send a chat message")
            print("   4. Messages will be saved to chat_sessions table\n")
            
            return True
            
        except Exception as e:
            print(f"\n❌ Error creating tables: {str(e)}\n")
            return False


if __name__ == '__main__':
    success = create_chat_tables()
    sys.exit(0 if success else 1)
