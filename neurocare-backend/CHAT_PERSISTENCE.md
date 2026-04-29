# Chat Persistence & History Management

## 🎯 Overview

This document explains how the NeuroCare AI chat system handles message persistence, archiving, and history management.

## 📊 Database Schema

### Chat Tables

```
chat_sessions (Parent Table)
├── id (Primary Key)
├── user_id (Foreign Key → users)
├── title (Chat session title)
├── created_at
└── updated_at

chat_messages (Active Messages)
├── id (Primary Key)
├── session_id (Foreign Key → chat_sessions)
├── sender (user | bot)
├── message_text
├── references_json
└── created_at

chat_archives (Archived Messages)
├── id (Primary Key)
├── session_id (Foreign Key → chat_sessions)
├── messages_json (Array of old messages)
├── message_count
└── archived_at
```

## 🔄 How It Works

### 1. Chat Session Creation
- When a user starts a new chat, a `ChatSession` record is created
- Session title is auto-generated from first user message (e.g., "Memory Loss" from "I'm worried about my patient's memory loss")
- Session stores metadata like creation time, last update time

### 2. Message Storage
- User and bot messages are stored in `chat_messages` table
- Each message includes:
  - `sender`: "user" or "bot"
  - `message_text`: The actual message content
  - `references_json`: Sources cited by the bot (for RAG)
  - `created_at`: Timestamp for ordering

### 3. Message Archiving (NEW)
- **Default Limit**: 50 active messages per session
- **Automatic Archiving**: When a session exceeds 50 messages:
  1. Old messages are moved to `chat_archives` table
  2. Archived as JSON array with full message content
  3. Archived messages remain queryable via API

### 4. RAG Context Building
- Only **last 20 messages** are used for LLM context
- This ensures fast responses and cost-effective API calls
- Older messages are still available in chat history view

## 💾 Database Setup

### Option 1: SQLite (Default)
Perfect for development and single-user scenarios.

```bash
# Edit .env
FLASK_ENV=development
DATABASE_URI=sqlite:///neurocare.db

# Initialize
python neurocare-backend/init_db.py

# Run backend
python neurocare-backend/run.py
```

**Advantages:**
- ✅ No server needed
- ✅ Easy setup
- ✅ Good for testing

**Disadvantages:**
- ❌ Single connection only
- ❌ Not suitable for production
- ❌ Performance issues with large datasets

---

### Option 2: PostgreSQL (Recommended)
Production-ready, supports multiple connections and advanced features.

#### Step 1: Install PostgreSQL

**Windows:**
```bash
# Download from: https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql
```

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE neurocare_ai;

# Create user with password
CREATE USER neurocare_user WITH PASSWORD 'secure_password_here';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE neurocare_ai TO neurocare_user;

# Exit psql
\q
```

#### Step 3: Update .env

```bash
# Edit .env file
FLASK_ENV=development
DATABASE_URI=postgresql://neurocare_user:secure_password_here@localhost:5432/neurocare_ai
CHAT_MAX_MESSAGES_PER_SESSION=50
```

#### Step 4: Install Python Dependencies

```bash
cd neurocare-backend
pip install psycopg2-binary
pip install -r requirements.txt
```

#### Step 5: Initialize Database

```bash
python init_db.py
```

**Output should show:**
```
✅ Database tables created successfully!
📋 Created tables:
   • users
   • feedbacks
   • user_activities
   • chat_sessions
   • chat_messages
   • chat_archives
```

#### Step 6: Run Backend

```bash
python run.py
```

## 🔍 API Endpoints

### Session Management

#### List Sessions
```http
GET /api/chatbot/sessions
Authorization: Bearer {token}

Response:
{
  "success": true,
  "sessions": [
    {
      "id": 1,
      "user_id": 5,
      "title": "Memory Loss",
      "message_count": 12,
      "last_message_preview": "Thank you for the guidance...",
      "created_at": "2024-01-15T10:30:00",
      "updated_at": "2024-01-15T10:45:00"
    }
  ]
}
```

#### Create New Session
```http
POST /api/chatbot/sessions
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
  "title": "New Chat"
}

Response:
{
  "success": true,
  "session": { /* session object */ }
}
```

#### Get Session Messages
```http
GET /api/chatbot/sessions/{sessionId}/messages
Authorization: Bearer {token}

Response:
{
  "success": true,
  "session": { /* session object */ },
  "messages": [
    {
      "id": 1,
      "session_id": 1,
      "sender": "user",
      "message_text": "Hello, I need help with dementia care",
      "references": [],
      "created_at": "2024-01-15T10:30:00"
    },
    {
      "id": 2,
      "session_id": 1,
      "sender": "bot",
      "message_text": "I'd be happy to help...",
      "references": [
        {
          "chunk_id": 1,
          "page": 5,
          "source": "dementia-care-guide.pdf"
        }
      ],
      "created_at": "2024-01-15T10:31:00"
    }
  ]
}
```

### Message Handling

#### Send Message
```http
POST /api/chatbot/chat
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
  "message": "What are early signs of memory loss?",
  "session_id": 1
}

Response:
{
  "success": true,
  "session_id": 1,
  "user_message": { /* message object */ },
  "bot_message": { /* message object */ }
}
```

### Archive Management

#### Get Session Archives
```http
GET /api/chatbot/sessions/{sessionId}/archives
Authorization: Bearer {token}

Response:
{
  "success": true,
  "archives": [
    {
      "id": 1,
      "session_id": 1,
      "message_count": 15,
      "archived_at": "2024-01-15T10:50:00",
      "first_message_preview": "Hello, I need help..."
    }
  ]
}
```

#### Get Archive Messages
```http
GET /api/chatbot/sessions/{sessionId}/archives/{archiveId}/messages
Authorization: Bearer {token}

Response:
{
  "success": true,
  "archive": { /* archive object */ },
  "messages": [ /* archived message array */ ]
}
```

## 🧹 Archiving Strategy

### When Does Archiving Happen?

1. **Automatically After Each Message**
   - If session has > 50 messages
   - Oldest messages are moved to archive

2. **Archive Contents**
   - Full message history (text, sender, timestamp, references)
   - Preserved as JSON for easy retrieval
   - Searchable and viewable

3. **Active Chat Behavior**
   - Users see all 50 current messages
   - Can view archived messages separately
   - RAG uses only last 20 messages for context

### Example Flow

```
Message Count: 1-50     → All in chat_messages (active)
Message Count: 51       → First 1 message archived, 50 remain active
Message Count: 52-100   → Messages 1-50 archived, 51-100 active
Message Count: 101      → Messages 51-100 archived, 1-100 active (with archive 2)
```

## 🐛 Troubleshooting

### Chat history not persisting after backend restart

**Problem**: Messages disappear when backend is restarted

**Solutions**:

1. **Check Database Configuration**
   ```bash
   # View current database
   python -c "from app.config import Config; print(Config.SQLALCHEMY_DATABASE_URI)"
   ```

2. **Verify Database Connection**
   ```bash
   # Test PostgreSQL connection
   psql -U neurocare_user -d neurocare_ai -h localhost
   # Should connect without error
   ```

3. **Check if Tables Exist**
   ```bash
   psql -U postgres -d neurocare_ai
   \dt  # List all tables
   ```

4. **Reinitialize Database**
   ```bash
   cd neurocare-backend
   python init_db.py
   ```

### Database migration errors

**Solution**: For existing SQLite databases, manually export and reimport data:

```bash
# Export from SQLite
sqlite3 neurocare.db ".dump chat_sessions" > sessions_backup.sql

# Create PostgreSQL backup
pg_dump -U postgres neurocare_ai > backup.sql

# Restore if needed
psql -U postgres neurocare_ai < backup.sql
```

### Performance issues with large chat histories

**Solution**: Check archive sizes

```python
from app import create_app
from app.models import db, ChatArchive

app = create_app()
with app.app_context():
    archives = ChatArchive.query.all()
    for archive in archives:
        print(f"Archive {archive.id}: {archive.message_count} messages")
```

## 🚀 Production Deployment

### Recommendations

1. **Use PostgreSQL**
   - Better performance with concurrent users
   - ACID compliance
   - Advanced indexing

2. **Regular Backups**
   ```bash
   # Daily backup
   pg_dump -U postgres neurocare_ai > /backups/neurocare_$(date +%Y%m%d).sql
   ```

3. **Monitor Archive Growth**
   - Set up alerts if archives grow too large
   - Consider increasing MAX_MESSAGES_PER_SESSION if needed

4. **Enable Connection Pooling**
   ```python
   # In config.py
   SQLALCHEMY_ENGINE_OPTIONS = {
       'pool_size': 10,
       'pool_recycle': 3600,
       'pool_pre_ping': True,
   }
   ```

## 📝 Configuration Options

| Setting | Default | Description |
|---------|---------|-------------|
| `DATABASE_URI` | `sqlite:///neurocare.db` | Database connection string |
| `CHAT_MAX_MESSAGES_PER_SESSION` | `50` | Messages before archiving |
| `CHAT_ARCHIVE_ENABLED` | `True` | Enable automatic archiving |
| `CHATBOT_TIMEOUT_SECONDS` | `90` | Timeout for LLM service |

## ✅ Checklist for Setup

- [ ] PostgreSQL installed and running
- [ ] Database `neurocare_ai` created
- [ ] User `neurocare_user` created with password
- [ ] `.env` file updated with correct DATABASE_URI
- [ ] `psycopg2-binary` installed: `pip install psycopg2-binary`
- [ ] Database initialized: `python init_db.py`
- [ ] Backend started: `python run.py`
- [ ] Frontend API URL points to `http://localhost:5000/api`
- [ ] Test chat creation and message sending
- [ ] Verify messages persist after backend restart

## 🎓 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [SQLAlchemy ORM Documentation](https://docs.sqlalchemy.org/)
- [Flask-SQLAlchemy Guide](https://flask-sqlalchemy.palletsprojects.com/)

---

**Last Updated**: April 28, 2024
**Version**: 1.0.0
