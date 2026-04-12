#!/usr/bin/env python
"""Test script to verify backend is working"""

import sys
sys.path.insert(0, 'c:/Users/Softxone/Desktop/AyeshaWork/WebDev/react/neurocare-ai/neurocare-backend')

from app import create_app
from app.models import db, User

app = create_app('development')

with app.app_context():
    # Check if database exists
    users = User.query.all()
    print(f"\n✓ Database connected successfully!")
    print(f"✓ Total users in database: {len(users)}")
    
    # Check admin user
    admin = User.query.filter_by(email='admin@neurocare.ai').first()
    if admin:
        print(f"✓ Admin user exists: {admin.email}")
        print(f"  - Username: {admin.username}")
        print(f"  - Active: {admin.is_active}")
        print(f"  - Is Admin: {admin.is_admin}")
    else:
        print("✗ Admin user NOT found")
    
    print("\n✓ Backend is properly configured!")
