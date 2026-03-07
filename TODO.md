# NeuroCare AI - Complete Project Summary

## Project Overview
- **Project Name**: NeuroCare AI
- **Frontend**: React.js
- **Backend**: Python Flask with SQLAlchemy
- **Database**: SQLite
- **Authentication**: JWT (JSON Web Tokens)

---

## ✅ COMPLETED COMPONENTS

### Backend (neurocare-backend/)
```
neurocare-backend/
├── app/
│   ├── __init__.py          # Flask app factory
│   ├── config.py            # Configuration
│   ├── models.py            # Database models (User, Feedback, UserActivity)
│   ├── routes/
│   │   ├── auth.py         # Login, Signup, Logout, Refresh
│   │   ├── users.py        # Profile CRUD, profile picture
│   │   ├── feedback.py     # Feedback management
│   │   ├── admin.py        # Admin panel APIs
│   │   └── chatbot.py      # Stub for AI team
│   └── utils/
│       └── decorators.py   # JWT decorators
├── .env                     # Environment variables
├── requirements.txt         # Python dependencies
├── run.py                   # Entry point
└── README.md              # Documentation
```

### Frontend Pages
- **Login.js** - Connected to backend with JWT
- **Signup.js** - User registration
- **Dashboard.js** - User profile & activity
- **UpdateProfile.js** - Profile editing
- **Feedback.js** - Submit & view feedback
- **Admin/AdminDashboard.js** - Admin statistics
- **Admin/AdminUsers.js** - User management
- **Admin/AdminFeedback.js** - Feedback management

### API Services (src/api/)
- **axiosConfig.js** - JWT interceptors
- **authService.js** - Authentication
- **userService.js** - User management
- **feedbackService.js** - Feedback system
- **adminService.js** - Admin panel

### Features Implemented
1. ✅ User Registration & Login
2. ✅ JWT Authentication
3. ✅ Role-based Access Control (Admin vs User)
4. ✅ Profile Management with picture upload
5. ✅ Feedback System
6. ✅ Admin Panel with:
   - Dashboard statistics
   - User management (CRUD)
   - Feedback management (CRUD)
7. ✅ Protected Routes
8. ✅ Chatbot stub endpoint (for AI team)
9. ✅ Diagnosis stub (for AI team)

---

## How to Run

### 1. Backend Setup
```
bash
cd neurocare-backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
pip install -r requirements.txt
python run.py
```

**Backend runs at:** http://127.0.0.1:5000

### 2. Frontend Setup
```
bash
npm start
```

**Frontend runs at:** http://localhost:3000

---

## Default Admin Account
| Field | Value |
|-------|-------|
| Email | admin@neurocare.ai |
| Password | admin123 |
| Username | admin |

---

## API Endpoints

### Authentication
- POST `/api/auth/signup` - Register
- POST `/api/auth/login` - Login
- POST `/api/auth/logout` - Logout

### Users
- GET `/api/users/profile` - Get profile
- PUT `/api/users/profile` - Update profile
- POST `/api/users/profile-picture` - Upload picture
- GET `/api/users/activity` - Get activity

### Feedback
- POST `/api/feedback` - Submit feedback
- GET `/api/feedback` - Get my feedback
- GET `/api/feedback/all` - Admin only

### Admin
- GET `/api/admin/users` - All users
- GET `/api/admin/stats` - Dashboard stats
- DELETE `/api/admin/users/<id>` - Delete user

### Chatbot (Stub)
- POST `/api/chatbot/chat` - For AI team integration

---

## Role-Based Access
- **Regular Users**: Access to dashboard, profile, feedback, chatbot, diagnosis
- **Admin Users**: Access to all above + /admin routes with full user & feedback management

---

## Notes
- Chatbot and Diagnosis endpoints are stubs - AI/DLP team will integrate their models
- All passwords are hashed using bcrypt
- JWT tokens expire in 24 hours
- Profile pictures stored in `neurocare-backend/uploads/`
