# NeuroCare AI Backend

A Flask REST API backend for the NeuroCare AI application with JWT authentication, user management, feedback system, and admin panel.

## Features

- 🔐 **JWT Authentication** - Secure login/signup with access and refresh tokens
- 👤 **User Management** - Profile CRUD operations, profile picture upload
- 📝 **Feedback System** - Submit and manage user feedback
- ⚙️ **Admin Panel** - User management, statistics, feedback moderation
- 🤖 **Chatbot API** - Stub endpoint for AI chatbot integration

## Tech Stack

- **Python 3.8+**
- **Flask 3.0** - Web framework
- **SQLAlchemy** - Database ORM
- **JWT** - Authentication
- **Flask-CORS** - Cross-origin support
- **Bcrypt** - Password hashing

## Project Structure

```
neurocare-backend/
├── app/
│   ├── __init__.py       # Flask app factory
│   ├── config.py         # Configuration
│   ├── models.py         # Database models
│   ├── routes/
│   │   ├── auth.py       # Login, Signup, Logout
│   │   ├── users.py      # User profile management
│   │   ├── feedback.py   # Feedback system
│   │   ├── admin.py      # Admin panel APIs
│   │   └── chatbot.py    # Chatbot API (stub)
│   └── utils/
│       ├── decorators.py # Auth decorators
│       └── __init__.py
├── uploads/              # Profile pictures
├── instance/             # SQLite database
├── requirements.txt      # Python dependencies
├── run.py              # Application entry point
└── README.md
```

---

## Installation & Setup Guide

### Step 1: Install Python

Make sure you have **Python 3.8 or higher** installed:

```
bash
python --version
```

### Step 2: Navigate to Backend Directory

```
bash
cd neurocare-backend
```

### Step 3: Create Virtual Environment (Recommended)

**Windows:**
```
bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```
bash
python3 -m venv venv
source venv/bin/activate
```

### Step 4: Install Dependencies

```
bash
pip install -r requirements.txt
```

Expected packages:
- Flask==3.0.0
- Flask-SQLAlchemy==3.1.1
- Flask-JWT-Extended==4.6.0
- Flask-CORS==4.0.0
- Werkzeug==3.0.1
- python-dotenv==1.0.0
- bcrypt==4.1.2

### Step 5: Run the Server

```
bash
python run.py
```

---

## Running the Backend

### Development Mode
```
bash
python run.py
```

The server will start at: **http://127.0.0.1:5000**

---

## API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/refresh` | Refresh JWT token |

### User (`/api/users`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get user profile |
| PUT | `/api/users/profile` | Update profile |
| POST | `/api/users/profile-picture` | Upload profile picture |
| DELETE | `/api/users/account` | Delete account |
| GET | `/api/users/activity` | Get activity history |

### Feedback (`/api/feedback`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/feedback` | Submit feedback |
| GET | `/api/feedback` | Get my feedback |
| GET | `/api/feedback/all` | Get all feedback (Admin) |

### Admin (`/api/admin`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Get all users |
| GET | `/api/admin/users/<id>` | Get user by ID |
| PUT | `/api/admin/users/<id>` | Update user |
| DELETE | `/api/admin/users/<id>` | Delete user |
| GET | `/api/admin/stats` | Dashboard statistics |

### Chatbot (`/api/chatbot`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chatbot/chat` | Send message (Stub) |

---

## Testing with Postman/cURL

### Health Check
```
bash
curl http://127.0.0.1:5000/api/health
```

### Sign Up
```
bash
curl -X POST http://127.0.0.1:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "John",
    "lastname": "Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "age": 30,
    "gender": "Male",
    "category": "Doctor",
    "country": "USA",
    "city": "New York"
  }'
```

### Login
```
bash
curl -X POST http://127.0.0.1:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

---

## Default Admin Account

The backend automatically creates a default admin account:

| Field | Value |
|-------|-------|
| Email | admin@neurocare.ai |
| Password | admin123 |
| Username | admin |

---

## Running Frontend & Backend Together

### Terminal 1 - Backend
```
bash
cd neurocare-backend
python run.py
```

### Terminal 2 - Frontend
```
bash
cd neurocare-ai
npm start
```

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

---

## Notes

1. **Chatbot & Diagnosis**: These are stub endpoints. The AI/DLP team will integrate the actual functionality.
2. **Database**: Uses SQLite for development. Can be changed to PostgreSQL for production.
3. **CORS**: Enabled for all origins in development.
4. **JWT Tokens**: Access tokens expire in 24 hours.

---

## Troubleshooting

### Port Already in Use
If port 5000 is busy, modify `run.py`:
```
python
app.run(host='0.0.0.0', port=5001, debug=True)
```

### Database Issues
Delete the database file and restart:
```
bash
del instance\neurocare.db
python run.py
```

---

## License

This project is developed for NeuroCare AI.
