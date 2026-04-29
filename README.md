# 🧠 NeurocarEAI - Dementia Care Intelligence Platform

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.13.3](https://img.shields.io/badge/Python-3.13.3-green.svg)](https://www.python.org/)
[![React 19.2.0](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://react.dev/)
[![Status](https://img.shields.io/badge/Status-Active%20Development-yellow.svg)](#)

## 🎯 Overview

**NeurocarEAI** is an integrated healthcare platform designed to support dementia care through:

- 🤖 **Agentic RAG System** - Intelligent Q&A with Mistral AI
- 📊 **EEG Analysis** - Neurological data processing and ML models
- 💬 **Smart Chatbot** - Emotion-aware dementia information assistant
- 👥 **Multi-Role Portal** - Patient, Caregiver, Admin dashboards
- 🔐 **Secure Backend** - Flask with PostgreSQL
- ⚡ **Modern Frontend** - React with real-time updates

---

## 📁 PROJECT STRUCTURE

See [STRUCTURE.md](STRUCTURE.md) for complete folder organization.

**Quick Overview:**
```
neurocare-ai/
├── frontend/              # React Application
├── backend/              # Flask REST API
├── chatbot/agentic-rag/  # Mistral AI RAG System
├── diagnosis/            # EEG Analysis & ML
├── shared/               # Shared utilities
├── tests/                # Test suite
└── docs/                 # Documentation
```

---

## 🚀 QUICK START

### Prerequisites
- **Python 3.13.3** or higher
- **Node.js 18.x** or higher
- **PostgreSQL 12+**
- **Git**

### 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/neurocare-ai.git
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
