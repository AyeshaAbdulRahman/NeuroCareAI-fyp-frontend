# PostgreSQL Setup Guide - NeurocarEAI Chat Persistence Fix

## 🎯 Quick Start (5 Minutes)

This guide will help you set up PostgreSQL for persistent chat history that survives backend restarts.

### Step 1: Install PostgreSQL

**Windows:**
1. Download from: https://www.postgresql.org/download/windows/
2. Run installer
3. Set password for postgres user (e.g., `postgres123`)
4. Default port: 5432

**macOS (Homebrew):**
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

### Step 2: Create Database & User (2 minutes)

**On Windows (with pgAdmin GUI):**
1. Open pgAdmin (installed with PostgreSQL)
2. Right-click "Databases" → "Create" → "Database"
3. Name: `neurocare_ai`
4. Click Create

**Or via Command Line:**

```bash
# Connect to PostgreSQL
psql -U postgres

# Paste these commands:
CREATE DATABASE neurocare_ai;
CREATE USER neurocare_user WITH PASSWORD 'neurocare_secure_123';
GRANT ALL PRIVILEGES ON DATABASE neurocare_ai TO neurocare_user;
\q
```

### Step 3: Update .env (1 minute)

```bash
# Open neurocare-backend/.env (or create from .env.example)
FLASK_ENV=development
DATABASE_URI=postgresql://neurocare_user:neurocare_secure_123@localhost:5432/neurocare_ai
CHAT_MAX_MESSAGES_PER_SESSION=50
```

### Step 4: Install Dependencies (1 minute)

```bash
cd neurocare-backend
pip install psycopg2-binary
```

### Step 5: Initialize Database (1 minute)

```bash
cd neurocare-backend
python init_db.py
```

**Expected output:**
```
✅ Database tables created successfully!
📋 Created tables:
   • users
   • feedbacks
   • user_activities
   • chat_sessions
   • chat_messages
   • chat_archives
✅ Admin account created!
   Email: admin@neurocare.ai
   Password: admin123
```

### Step 6: Run Backend

```bash
python run.py
```

**Expected output:**
```
==================================================
  NeuroCare AI Backend
  ====================

  Starting server...
  API URL: http://127.0.0.1:5000
  Health Check: http://127.0.0.1:5000/api/health
  ...
==================================================
```

✅ **Done! Your chat history now persists across backend restarts!**

---

## 🔍 Verify Setup

### Test 1: Check Database Connection

```bash
psql -U neurocare_user -d neurocare_ai
# Should connect successfully
\q
```

### Test 2: Check Tables

```bash
psql -U neurocare_user -d neurocare_ai
\dt  # List tables - should show chat_sessions, chat_messages, etc.
\q
```

### Test 3: Test Chat in Frontend

1. Start backend: `python run.py`
2. Start frontend: `npm start`
3. Login with admin account
4. Send a chat message
5. Stop backend (Ctrl+C)
6. Check database still has messages:
   ```bash
   psql -U neurocare_user -d neurocare_ai
   SELECT * FROM chat_messages LIMIT 5;
   \q
   ```
7. Restart backend: `python run.py`
8. Reload frontend - message history should appear!

---

## 🆘 Troubleshooting

### Error: "can't connect to server"
**Solution:**
```bash
# Make sure PostgreSQL is running
# Windows: Check Services (services.msc) → PostgreSQL
# macOS: brew services start postgresql@15
# Linux: sudo systemctl start postgresql
```

### Error: "database does not exist"
**Solution:**
```bash
psql -U postgres
CREATE DATABASE neurocare_ai;
\q
```

### Error: "user does not have CONNECT privilege"
**Solution:**
```bash
psql -U postgres
GRANT CONNECT ON DATABASE neurocare_ai TO neurocare_user;
\q
```

### Chat still not persisting after restart

**Step 1:** Check which database you're using
```bash
python -c "from app.config import Config; print(Config.SQLALCHEMY_DATABASE_URI)"
```

**Step 2:** If it shows `sqlite:///`, you're still using SQLite. Update .env:
```
DATABASE_URI=postgresql://neurocare_user:neurocare_secure_123@localhost:5432/neurocare_ai
```

**Step 3:** Reinitialize database:
```bash
python init_db.py
python run.py
```

---

## 📊 What Changed?

### Before (Issue):
- Chat stored only in browser (localStorage)
- Chat history lost when backend restarts
- Only visible after login/logout refresh

### After (Fixed):
- Chat stored in PostgreSQL database
- Chat history persists across:
  - ✅ Backend restarts
  - ✅ Browser refreshes
  - ✅ System reboots
  - ✅ Multiple devices (same user)
- Auto-archiving when exceeds 50 messages
- Full message history searchable

---

## 🎯 New Features

| Feature | Description |
|---------|-------------|
| **Persistent Storage** | All chats saved to PostgreSQL |
| **Auto-Archiving** | Messages archived after 50 per session |
| **Search History** | Find old conversations by title |
| **Multiple Sessions** | User can have unlimited chat sessions |
| **Message Recovery** | Access archived messages anytime |

---

## 🚀 Next Steps

1. **For Development:**
   - Follow this guide → use PostgreSQL locally
   - All chat history persists

2. **For Deployment:**
   - Use managed PostgreSQL (AWS RDS, Heroku, etc.)
   - Update DATABASE_URI accordingly
   - Enable automatic backups

3. **For Caregiver RAG Backend:**
   - The caregiver-rag-chatbot folder also needs setup
   - It uses its own service on port 5001
   - Reference the main CHAT_PERSISTENCE.md for details

---

## 📁 Files Modified

- ✅ `models.py` - Added ChatArchive table
- ✅ `routes/chatbot.py` - Added archiving logic & endpoints
- ✅ `.env.example` - Added PostgreSQL examples
- ✅ `init_db.py` - New database initialization script
- ✅ `CHAT_PERSISTENCE.md` - Comprehensive documentation

---

## 💡 Tips

- **Save this guide** - Screenshot or bookmark for future reference
- **Backup database** - Use `pg_dump` regularly
- **Monitor storage** - Check archive sizes if chat grows large
- **Connection string** - Format: `postgresql://user:password@host:port/database`

---

**Questions?** Check CHAT_PERSISTENCE.md in neurocare-backend folder for detailed API documentation.

**Created**: April 28, 2024
**Updated**: April 28, 2024
