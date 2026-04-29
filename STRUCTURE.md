# NeurocarEAI - Complete Project Structure

## 📋 PROJECT OVERVIEW

**NeurocarEAI** is a comprehensive healthcare platform for dementia care using:
- **Frontend**: React 19.2.0
- **Backend**: Flask + PostgreSQL
- **AI/ML**: Agentic RAG with Mistral AI
- **Data**: EEG Analysis (fNIRS dataset)

---

## 🏗️ PROJECT STRUCTURE

```
neurocare-ai/
│
├── 📁 frontend/                          # React Application
│   ├── public/
│   ├── src/
│   │   ├── api/                          # API services
│   │   │   ├── adminService.js
│   │   │   ├── authService.js
│   │   │   ├── axiosConfig.js
│   │   │   ├── chatService.js
│   │   │   └── ...
│   │   ├── Components/                   # React Components
│   │   ├── pages/                        # Pages
│   │   ├── App.js
│   │   ├── index.js
│   │   └── ...
│   ├── package.json
│   └── README.md
│
├── 📁 backend/                           # Flask Backend
│   ├── app/
│   │   ├── __init__.py                   # App initialization
│   │   ├── config.py                     # Configuration
│   │   ├── models.py                     # Database models
│   │   ├── routes/                       # API routes
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── diagnosis.py
│   │   │   ├── chat.py
│   │   │   └── admin.py
│   │   └── utils/                        # Utility functions
│   │       ├── helpers.py
│   │       └── validators.py
│   ├── migrations/                       # Database migrations
│   ├── uploads/                          # User uploads
│   ├── run.py                            # Entry point
│   ├── requirements.txt                  # Python dependencies
│   ├── .env                              # Environment variables
│   ├── .env.example                      # Example env
│   └── README.md
│
├── 📁 chatbot/                           # Agentic RAG System (NEW)
│   ├── agentic-rag/
│   │   ├── .env                          # Mistral API keys
│   │   ├── config.py                     # Configuration
│   │   ├── llm_mistral.py               # Mistral wrapper
│   │   ├── ingestion_dementia.py        # Knowledge base
│   │   ├── test_system.py                # System tests
│   │   ├── requirements.txt              # Dependencies
│   │   ├── pyproject.toml                # Poetry config
│   │   ├── main.py                       # Test entry point
│   │   ├── flask_api.py                  # Flask API server
│   │   │
│   │   └── agentic_rag/
│   │       ├── __init__.py
│   │       ├── main.py                   # Main system
│   │       ├── ingestion.py
│   │       ├── graph/
│   │       │   ├── __init__.py
│   │       │   ├── graph.py              # LangGraph workflow
│   │       │   ├── state.py              # State definition
│   │       │   ├── consts.py
│   │       │   ├── chains/
│   │       │   │   ├── __init__.py
│   │       │   │   ├── generation.py
│   │       │   │   ├── retrieval_grader.py
│   │       │   │   ├── hallucination_grader.py
│   │       │   │   ├── answer_grader.py
│   │       │   │   └── router.py
│   │       │   └── nodes/
│   │       │       ├── __init__.py
│   │       │       ├── retrieve.py
│   │       │       ├── grade.py
│   │       │       ├── generate.py
│   │       │       └── web_search.py
│   │       ├── data/                     # Custom documents
│   │       └── .chroma/                  # Vector database
│   │
│   └── docs/
│       ├── START_HERE.md
│       ├── QUICK_START.md
│       ├── COMPLETE_GUIDE_ROMAN_URDU.md
│       ├── GUIDE_URDU.md
│       ├── SETUP_GUIDE.md
│       ├── SUMMARY_URDU.md
│       └── TROUBLESHOOTING_URDU.md
│
├── 📁 diagnosis/                         # EEG Analysis
│   ├── ds004504/                         # Dataset
│   ├── src/
│   │   ├── data_loader.py
│   │   ├── dataset.py
│   │   ├── preprocessing_eeg.py
│   │   ├── visualize_proprocessing.py
│   │   └── ml_results/
│   ├── scripts/
│   │   └── load_eeg_test.py
│   └── README.md
│
├── 📁 shared/                            # Shared utilities
│   ├── __init__.py
│   ├── constants.py
│   ├── helpers.py
│   ├── decorators.py
│   ├── middleware.py
│   └── config.py
│
├── 📁 tests/                             # Project tests
│   ├── __init__.py
│   ├── test_backend.py
│   ├── test_chatbot.py
│   ├── test_integration.py
│   └── conftest.py                       # Pytest config
│
├── 📁 docs/                              # Documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   ├── DATABASE.md
│   └── CONTRIBUTING.md
│
├── 📁 scripts/                           # Deployment scripts
│   ├── setup.sh
│   ├── migrate.py
│   ├── seed_db.py
│   └── backup.sh
│
├── 📁 .github/                           # GitHub workflows
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── deploy.yml
│   │   └── tests.yml
│   └── ISSUE_TEMPLATE/
│
├── 📝 .env.example                       # Example environment variables
├── 📝 .env.local                         # Local overrides (not in git)
├── 📝 .gitignore                         # Git ignore rules
├── 📝 .gitattributes                     # Git attributes
├── 📝 docker-compose.yml                 # Docker configuration
├── 📝 Dockerfile                         # Docker setup
├── 📝 README.md                          # Main README
├── 📝 ARCHITECTURE.md                    # Architecture docs
├── 📝 CONTRIBUTING.md                    # Contribution guide
├── 📝 LICENSE                            # License
├── 📝 .editorconfig                      # Editor configuration
├── 📝 pyproject.toml                     # Python project config
└── 📝 package.json                       # Node project config (if using node tools)

```

---

## 📚 FOLDER DESCRIPTIONS

### **frontend/** - React Application
- React 19.2.0 with TypeScript
- API service layer for backend calls
- Component-based architecture
- React Router for navigation
- Axios for HTTP requests

### **backend/** - Flask Application
- Flask web framework
- PostgreSQL database
- JWT authentication
- RESTful API endpoints
- Database migrations

### **chatbot/** - Agentic RAG System
- Mistral AI integration
- LangGraph workflow
- Vector database (Chroma)
- Web search (Tavily)
- Spell checking

### **diagnosis/** - EEG Analysis
- Dataset processing
- Machine learning models
- Data visualization
- fNIRS preprocessing

### **shared/** - Shared Code
- Common utilities
- Configuration management
- Constants
- Middleware

### **tests/** - Test Suite
- Unit tests
- Integration tests
- API tests

### **docs/** - Documentation
- API documentation
- Architecture diagrams
- Setup guides
- Contributing guidelines

---

## 🚀 QUICK START

### **1. Clone Repository**
```bash
git clone https://github.com/yourusername/neurocare-ai.git
cd neurocare-ai
```

### **2. Setup Frontend**
```bash
cd frontend
npm install
npm start
```

### **3. Setup Backend**
```bash
cd ../backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

### **4. Setup Chatbot (RAG)**
```bash
cd ../chatbot/agentic-rag
poetry install
python ingestion_dementia.py
python main.py
```

---

## 📦 KEY DEPENDENCIES

### **Frontend** (package.json)
- react@19.2.0
- react-router-dom@7.9.4
- axios@1.13.2

### **Backend** (requirements.txt)
- Flask
- Flask-SQLAlchemy
- Flask-JWT-Extended
- psycopg2-binary (PostgreSQL)
- python-dotenv

### **Chatbot** (pyproject.toml)
- langchain
- langgraph
- langchain-mistralai
- mistralai
- chromadb
- tavily-python

---

## 🔐 ENVIRONMENT VARIABLES

Create `.env` files in each module:

### **Backend (.env)**
```
FLASK_ENV=development
DATABASE_URL=postgresql://user:password@localhost/neurocare
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-key
UPLOAD_FOLDER=./uploads
```

### **Chatbot (.env)**
```
MISTRAL_API_KEY=your-key
TAVILY_API_KEY=your-key
CHROMA_DB_PATH=./.chroma
```

---

## 🗄️ DATABASE

### **PostgreSQL Schema**
```sql
-- Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role ENUM('user', 'admin', 'caregiver'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Diagnosis
CREATE TABLE diagnoses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    eeg_data JSONB,
    result VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat History
CREATE TABLE chat_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    question TEXT,
    answer TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔄 WORKFLOW

```
User (React Frontend)
    ↓
React Components + Redux State
    ↓
API Service Layer (axios)
    ↓
Flask Backend API
    ↓ (Route)
Database / Chatbot / ML Model
    ↓
Response to Frontend
    ↓
Display in React
```

---

## 🧪 TESTING

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd ../backend
pytest tests/

# Chatbot tests
cd ../chatbot/agentic-rag
python test_system.py
```

---

## 📝 GIT WORKFLOW

```bash
# Feature branch
git checkout -b feature/feature-name

# Make changes
git add .
git commit -m "feat: description"

# Push
git push origin feature/feature-name

# Create Pull Request
```

---

## 📚 DOCUMENTATION

- `ARCHITECTURE.md` - System design
- `API.md` - API endpoints
- `DATABASE.md` - Database schema
- `DEPLOYMENT.md` - Deployment guide
- `CONTRIBUTING.md` - Contributing rules

---

## 🤝 TEAM ROLES

- **Frontend Developer** - React components, UI
- **Backend Developer** - API, database, authentication
- **ML Engineer** - EEG analysis, models
- **DevOps** - Deployment, CI/CD
- **Product Manager** - Requirements, roadmap

---

## 📞 SUPPORT

For issues or questions:
1. Check documentation
2. Create GitHub issue
3. Contact team lead

---

**Last Updated**: April 26, 2026
**Python Version**: 3.13.3
**Node Version**: 18.x or higher
