# 📚 GIT & PROJECT MANAGEMENT GUIDE

## Complete Guide to Organizing Your Project for Git

This guide explains how to properly structure your neurocare-ai project so that when you push to git, all necessary files are included and organized.

---

## 📋 PROJECT ORGANIZATION CHECKLIST

### ✅ Directory Structure (Already Done)

```
neurocare-ai/
├── .git/                          # Git repository
├── .github/                        # GitHub workflows (create later)
├── frontend/                       # React app
├── backend/                        # Flask API
├── chatbot/agentic-rag/           # RAG system
├── diagnosis/                      # EEG analysis
├── shared/                         # Shared code (if needed)
├── tests/                          # Test files
├── docs/                           # Project documentation
│   ├── ARCHITECTURE.md            # ✅ Created
│   ├── API.md                     # Create this
│   ├── DATABASE.md                # Create this
│   ├── DEPLOYMENT.md              # Create this
│   └── CONTRIBUTING.md            # Create this
├── scripts/                        # Setup scripts (create later)
├── .gitignore                      # ✅ Updated
├── .env.example                    # ✅ Created
├── .editorconfig                   # Standardize editors
├── README.md                       # ✅ Updated
├── STRUCTURE.md                    # ✅ Created
├── ARCHITECTURE.md                 # ✅ Created
├── pyproject.toml                  # Python config (optional)
├── docker-compose.yml              # Docker setup (create later)
└── Dockerfile                      # Docker image (create later)
```

---

## 🔑 GIT CONFIGURATION

### 1️⃣ Global Git Config

```bash
# Set your Git identity
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Configure Git to remember credentials (choose one)
# Option A: Cache credentials for 15 minutes
git config --global credential.helper cache
git config --global credential.helper 'cache --timeout=900'

# Option B: Store credentials permanently (Windows)
git config --global credential.helper wincred

# Option C: Store credentials permanently (macOS)
git config --global credential.helper osxkeychain
```

### 2️⃣ Project-Level Config

```bash
cd neurocare-ai
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

---

## 📁 WHAT TO COMMIT TO GIT

### ✅ DO COMMIT
- `.gitignore` - Ignore rules
- `.env.example` - Template for env vars
- `.editorconfig` - Editor settings
- `README.md` - Project overview
- `STRUCTURE.md` - Project structure
- `ARCHITECTURE.md` - System design
- `CONTRIBUTING.md` - Contribution guidelines
- `LICENSE` - License file
- `package.json` / `package-lock.json` - Frontend deps
- `pyproject.toml` / `poetry.lock` - Python deps (optional)
- `requirements.txt` - Python deps
- Source code - All `.js`, `.py` files
- Configuration files - `config.py`, etc.
- Documentation - All markdown files
- GitHub workflows - `.github/workflows/`

### ❌ DO NOT COMMIT
- `.env` - Environment variables (use .env.example)
- `node_modules/` - Frontend dependencies
- `venv/` or `env/` - Python virtual environments
- `.DS_Store` - macOS system files
- `.vscode/` - IDE personal settings
- `.idea/` - IDE personal settings
- `__pycache__/` - Python cache
- `*.pyc` - Python compiled files
- `coverage/` - Test coverage reports
- `.chroma/` - Vector database
- `uploads/` - User uploads
- `build/` - Build output
- `dist/` - Distribution
- `.egg-info/` - Package info
- `*.log` - Log files
- Database files - `.db`, `.sqlite`

---

## 🔄 GITHUB WORKFLOW

### Initial Setup (One Time)

```bash
# Clone your repo
git clone https://github.com/yourusername/neurocare-ai.git
cd neurocare-ai

# Create initial commit
git add .
git commit -m "chore: Initial project setup with structure and documentation"
git push origin main
```

### Regular Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make changes
# (edit files)

# 3. Check what changed
git status
git diff

# 4. Stage changes
git add .
# Or specific files:
git add backend/app/routes/chat.py

# 5. Commit with clear message
git commit -m "feat: Implement chat endpoint"
# Or multiple related commits:
git commit -m "feat: Add document retrieval"
git commit -m "feat: Add answer generation"
git commit -m "test: Add tests for chat system"

# 6. Push to GitHub
git push origin feature/your-feature-name

# 7. Create Pull Request on GitHub
# Go to https://github.com/yourusername/neurocare-ai
# Click "Create Pull Request"

# 8. After PR is approved and merged, clean up
git checkout main
git pull origin main
git branch -d feature/your-feature-name
```

---

## 💭 COMMIT MESSAGE FORMAT

### Good Commit Messages

```bash
# Feature commit
git commit -m "feat: Add user authentication with JWT"

# Bug fix
git commit -m "fix: Resolve token expiration issue"

# Documentation
git commit -m "docs: Update API documentation"

# Testing
git commit -m "test: Add unit tests for auth service"

# Refactoring
git commit -m "refactor: Simplify error handling"

# Chore/maintenance
git commit -m "chore: Update dependencies"

# Performance
git commit -m "perf: Optimize vector database queries"
```

### Commit Types
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `test:` - Tests
- `refactor:` - Code refactoring
- `chore:` - Maintenance/build
- `perf:` - Performance improvement
- `style:` - Code style (formatting)
- `ci:` - CI/CD changes

---

## 🌿 BRANCH STRATEGY

### Branch Naming Convention

```bash
# Feature branches
feature/user-authentication
feature/add-chat-system
feature/eeg-analysis

# Bug fix branches
bugfix/token-expiration
bugfix/vector-search-issue

# Documentation branches
docs/api-documentation
docs/deployment-guide

# Release branches
release/v0.1.0
release/v0.2.0

# Hotfix branches (for production issues)
hotfix/critical-auth-bug
```

### Branch Lifecycle

```
main (production)
  ↑
  ├── develop (integration)
  │   ├── feature/feature1
  │   ├── feature/feature2
  │   └── bugfix/bugfix1
  │
  ↑
  └── Pull Requests → Review → Merge
```

---

## 🔍 IMPORTANT FILES CHECKLIST

### Required Files (Must Have)

- [ ] `.gitignore` - Exclude unnecessary files
- [ ] `.env.example` - Environment template
- [ ] `README.md` - Project overview
- [ ] `LICENSE` - License (MIT recommended)
- [ ] `CONTRIBUTING.md` - Contribution guidelines
- [ ] `requirements.txt` - Python dependencies
- [ ] `package.json` - JavaScript dependencies

### Recommended Files

- [ ] `.editorconfig` - Editor standardization
- [ ] `.github/workflows/` - CI/CD pipelines
- [ ] `docker-compose.yml` - Docker setup
- [ ] `Dockerfile` - Container image
- [ ] `STRUCTURE.md` - Project structure
- [ ] `ARCHITECTURE.md` - System design
- [ ] `docs/` - Detailed documentation

### Project-Specific Files

- [ ] `backend/requirements.txt` - Backend deps
- [ ] `frontend/package.json` - Frontend deps
- [ ] `chatbot/agentic-rag/pyproject.toml` - Poetry config
- [ ] `chatbot/agentic-rag/requirements.txt` - RAG deps

---

## 🚀 PUSHING YOUR PROJECT

### Before Your First Push

```bash
# 1. Ensure .gitignore is correct
cat .gitignore

# 2. Check what will be committed
git status

# 3. Make sure sensitive files are NOT listed
git ls-files | grep -E "(\.env$|\.db$|venv/|node_modules/)"

# 4. Remove accidentally added files
git rm --cached unwanted-file

# 5. Commit .gitignore change
git add .gitignore
git commit -m "chore: Update gitignore"
```

### Push Commands

```bash
# Push specific branch
git push origin main

# Push feature branch
git push origin feature/your-feature

# Force push (careful!)
git push -f origin feature/your-feature

# Push all branches
git push --all

# Push with tags
git push --tags
```

---

## 📊 FOLDER-BY-FOLDER TRACKING

### Frontend (`frontend/`)
**Commit:**
- `public/` - HTML templates
- `src/` - React components
- `package.json` - Dependencies
- `README.md` - Frontend docs

**Ignore:**
- `node_modules/`
- `build/`
- `.env.local`

### Backend (`backend/`)
**Commit:**
- `app/` - Flask application
- `migrations/` - Database migrations
- `requirements.txt` - Python deps
- `.env.example` - Environment template
- `README.md` - Backend docs

**Ignore:**
- `venv/` or `.venv/`
- `instance/`
- `__pycache__/`
- `.env`
- `*.db`

### Chatbot (`chatbot/agentic-rag/`)
**Commit:**
- `agentic_rag/` - Main code
- `docs/` - Documentation
- `pyproject.toml` - Poetry config
- `requirements.txt` - Dependencies
- `.env.example` - Environment template

**Ignore:**
- `.venv/` or `venv/`
- `__pycache__/`
- `.chroma/` - Vector database
- `poetry.lock` - Dependency lock (optional)
- `.env`

### Diagnosis (`diagnosis/`)
**Commit:**
- `src/` - Source code
- `scripts/` - Utility scripts
- `README.md` - Documentation

**Ignore:**
- `ds004504/` - Raw dataset (too large)
- `models/` - Trained models (large files)
- `outputs/` - Generated outputs
- `*.h5` - Model files

### Tests (`tests/`)
**Commit:**
- All test files
- `conftest.py` - Pytest configuration

**Ignore:**
- `.pytest_cache/`
- `coverage/`

### Docs (`docs/`)
**Commit:**
- All markdown files
- `images/` - Documentation images
- `examples/` - Code examples

---

## 🔐 ENVIRONMENT VARIABLES MANAGEMENT

### Best Practice

```bash
# 1. Create .env.example with template values
.env.example:
  DATABASE_URL=postgresql://user:password@localhost/dbname
  MISTRAL_API_KEY=your-mistral-api-key
  SECRET_KEY=your-secret-key

# 2. Each developer creates their own .env
cp .env.example .env

# 3. Edit .env with actual values (NOT committed)

# 4. .gitignore includes .env to prevent accidental commits
```

### If You Accidentally Committed .env

```bash
# Remove from git (but keep local copy)
git rm --cached .env

# Add to .gitignore
echo ".env" >> .gitignore

# Commit the removal
git add .gitignore
git commit -m "chore: Remove .env from tracking"

# Regenerate your API keys (they're compromised!)
```

---

## 📦 DEPENDENCIES MANAGEMENT

### Frontend Dependencies

```bash
# Install dependencies
cd frontend
npm install

# Update dependencies
npm update

# Commit changes
git add package-lock.json
git commit -m "chore: Update frontend dependencies"
```

### Backend Dependencies

```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Add new dependency
pip install new-package
pip freeze > requirements.txt

# Commit changes
git add requirements.txt
git commit -m "chore: Add new-package dependency"
```

### RAG Dependencies

```bash
# Using Poetry
cd chatbot/agentic-rag
poetry add new-package
poetry export > requirements.txt

# Or using pip
pip install new-package
pip freeze > requirements.txt

# Commit changes
git add requirements.txt
git commit -m "chore: Add new-package to RAG"
```

---

## 🚨 COMMON MISTAKES TO AVOID

### ❌ Mistake 1: Committing Large Files
```bash
# Don't do this:
git add large-model.h5  # Too large!
git add large-dataset.csv

# Do this instead:
git lfs install  # Use Git LFS for large files
git lfs track "*.h5"
git add large-model.h5
```

### ❌ Mistake 2: Committing .env File
```bash
# Don't do this:
git add .env
git commit -m "Add environment variables"

# Do this instead:
git add .env.example  # Add template only
git commit -m "Add environment template"
```

### ❌ Mistake 3: Committing node_modules/
```bash
# Don't do this:
git add node_modules/
git add frontend/node_modules/

# These are huge! Use .gitignore:
echo "node_modules/" >> .gitignore
git add .gitignore
```

### ❌ Mistake 4: Committing venv/
```bash
# Don't do this:
git add venv/
git add backend/venv/

# Instead, users recreate it:
# Add to .gitignore:
echo "venv/" >> .gitignore
# Users run:
python -m venv venv
pip install -r requirements.txt
```

---




### Step 1: Verify Git Setup
```bash
cd neurocare-ai
git status  # Should show all your files
git log     # Should show commit history
```

### Step 2: Ensure .gitignore is Complete
```bash
cat .gitignore  # Verify it has all necessary rules
```

### Step 3: Make First Commit
```bash
git add .
git commit -m "chore: Initial project structure and documentation"
```

### Step 4: Create Feature Branch
```bash
git checkout -b feature/initial-setup
```

### Step 5: Push When Ready
```bash
git push origin feature/initial-setup
# Then create Pull Request on GitHub
```

---

## 📞 HELPFUL GIT COMMANDS

```bash
# View changes
git diff                    # See all changes
git diff --staged          # See staged changes
git log --oneline          # See commit history
git show <commit-hash>     # See specific commit

# Undo changes
git checkout -- <file>     # Discard changes
git revert <commit-hash>   # Undo a commit
git reset --hard HEAD~1    # Delete last commit

# Branches
git branch                  # List branches
git branch -D <branch>     # Delete branch
git merge <branch>         # Merge branch

# Remote
git pull                    # Update from remote
git fetch                   # Get remote updates
git remote -v              # List remotes
```

---

**Ready to push? Follow the checklist above and you're good to go!** 🚀

Last Updated: April 26, 2026
