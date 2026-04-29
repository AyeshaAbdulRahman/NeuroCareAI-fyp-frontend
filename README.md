# 🧠 NeurocarEAI - Dementia Care Intelligence Platform

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.13.3](https://img.shields.io/badge/Python-3.13.3-green.svg)](https://www.python.org/)
[![React 19.2.0](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-green.svg)](#)

## 📋 Overview

**NeurocarEAI** is an integrated healthcare platform for dementia care with:
- 💬 Smart chatbot with persistent chat history
- 👥 Multi-role authentication (Patient, Caregiver, Admin)
- 🔐 Secure JWT-based backend with Flask
- 📊 EEG data analysis and ML models
- 💾 PostgreSQL database integration

---

## 🚀 QUICK START

### Prerequisites
- Python 3.8+ 
- Node.js 18+
- PostgreSQL 12+
- Git

### 1️⃣ Setup Backend

```bash
cd neurocare-backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo FLASK_APP=run.py > .env
echo FLASK_ENV=development >> .env
echo DATABASE_URL=postgresql://user:password@localhost:5432/neurocare_db >> .env
echo JWT_SECRET_KEY=your_secret_key >> .env

# Initialize database
python init_db.py

# Run backend
python run.py  # Runs on http://localhost:5000
```

### 2️⃣ Setup Frontend

```bash
cd ..

# Install dependencies
npm install

# Create .env file (root directory)
echo REACT_APP_API_URL=http://localhost:5000 > .env

# Start React app
npm start  # Runs on http://localhost:3000
```

### 3️⃣ Database Setup

```bash
# PostgreSQL - Create database
createdb neurocare_db

# Or using psql
psql -U postgres
CREATE DATABASE neurocare_db;
```

---

## 📁 PROJECT STRUCTURE

```
neurocare-ai/
├── src/                      # React components & pages
├── neurocare-backend/        # Flask REST API
│   ├── app/
│   │   ├── routes/          # Auth, Users, Chatbot, Admin
│   │   ├── models.py        # Database models
│   │   └── config.py        # Configuration
│   └── requirements.txt
├── neurocare-diagnosis/      # EEG analysis & datasets
├── public/                   # Static assets
└── package.json
```

---

## 🔑 Key Features

| Feature | Location |
|---------|----------|
| Authentication & Users | `/neurocare-backend/app/routes/auth.py` |
| Chatbot API | `/neurocare-backend/app/routes/chatbot.py` |
| Admin Panel | `/neurocare-backend/app/routes/admin.py` |
| React Components | `/src/Components/` |
| EEG Analysis | `/neurocare-diagnosis/src/` |

---

## 🧪 Testing

```bash
# Backend tests
cd neurocare-backend
python test_backend.py

# Frontend tests
npm test
```

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5000 already in use | Change `FLASK_PORT` in `.env` |
| Database connection failed | Check PostgreSQL is running & .env DATABASE_URL |
| React app won't start | Delete `node_modules`, run `npm install` again |
| JWT errors | Regenerate `JWT_SECRET_KEY` in .env |

---

## 📞 Support

For issues, check [STRUCTURE.md](STRUCTURE.md) for detailed documentation.
cd neurocare-ai
```

### 2️⃣ Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env  # or use your editor
```

### 3️⃣ Install Dependencies - Frontend

```bash
cd frontend
npm install
npm start
# Opens http://localhost:3000
```

### 4️⃣ Install Dependencies - Backend

```bash
cd ../backend
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install packages
pip install -r requirements.txt

# Setup database
flask db upgrade
python run.py
# Server runs on http://localhost:5000
```

#
## 🏗️ ARCHITECTURE

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend (3000)                │
│              Login • Dashboard • Chat • Analysis         │
└────────────────────────┬────────────────────────────────┘
                         │ (Axios)
┌────────────────────────▼────────────────────────────────┐
│                  Flask Backend (5000)                    │
│            Auth • API • Database • Webhooks              │
└────────────────────────┬────────────────────────────────┘
              ┌──────────┼──────────┐
              ▼          ▼          ▼
        ┌─────────┐ ┌────────┐ ┌──────────┐
        │  RAG    │ │  EEG   │ │Database  │
        │  (5001) │ │ Models │ │PostgreSQL│
        └─────────┘ └────────┘ └──────────┘
              ▼
        ┌─────────────────────┐
        │  Mistral AI + Web   │
        │  Search (Tavily)    │
        └─────────────────────┘
```

---

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Chat/RAG
- `POST /api/chat/ask` - Ask a question
- `GET /api/chat/history` - Get chat history
- `DELETE /api/chat/{id}` - Delete chat

### Diagnosis
- `POST /api/diagnosis/analyze` - Analyze EEG
- `GET /api/diagnosis/results` - Get results
- `GET /api/diagnosis/reports` - Get reports

---

## 🧪 Testing

### Run All Tests
```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && pytest tests/


```

---

## 🚢 Deployment

### Docker Deployment
```bash
docker-compose up -d
```

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Branch Naming
- `feature/feature-name` - New features
- `bugfix/bug-name` - Bug fixes
- `docs/doc-name` - Documentation
- `chore/task-name` - Maintenance

### Commit Messages
```bash
git commit -m "feat: Add new feature"
git commit -m "fix: Resolve issue #123"
git commit -m "docs: Update README"
```


## 📞 Contact

- Email: team@neurocare-ai.com
- GitHub: https://github.com/yourusername/neurocare-ai

---

**Last Updated**: April 26, 2026  
**Version**: 0.1.0  
**Status**: 🟡 Active Development

---

### Quick Commands Reference

```bash
# Development
npm start                           # Frontend
python run.py                       # Backend
python flask_api.py                 # RAG API

# Testing
npm test                            # Frontend tests
pytest tests/                       # Backend tests
python test_system.py               # RAG tests

# Database
flask db migrate                    # Create migration
flask db upgrade                    # Apply migration

# Deployment
docker-compose up -d                # Deploy with Docker
git push origin main                # Deploy to production
```

---

**❤️ Built for Dementia Care Support**

*If this project helped you, please consider giving it a star! ⭐*

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
