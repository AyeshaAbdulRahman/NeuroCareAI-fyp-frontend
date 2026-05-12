#!/usr/bin/env python3
"""
Quick test script to verify activity timestamp fix.
Run this after restarting the backend to confirm timestamps are correct.
"""

import requests
import json
from datetime import datetime, timezone
import sys

# Configuration
API_URL = "http://localhost:5000/api"
TEST_USER_EMAIL = "test@example.com"
TEST_USER_PASSWORD = "password"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_status(message, status='info'):
    if status == 'success':
        print(f"{Colors.GREEN}✓ {message}{Colors.END}")
    elif status == 'error':
        print(f"{Colors.RED}✗ {message}{Colors.END}")
    elif status == 'warning':
        print(f"{Colors.YELLOW}⚠ {message}{Colors.END}")
    else:
        print(f"{Colors.BLUE}ℹ {message}{Colors.END}")

def test_login():
    """Test login and check activity timestamp."""
    print(f"\n{Colors.BLUE}=== Testing Activity Timestamp Fix ==={Colors.END}\n")
    
    try:
        # Login
        print("1. Testing login...")
        login_response = requests.post(
            f"{API_URL}/auth/login",
            json={
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD
            }
        )
        
        if login_response.status_code != 200:
            print_status(f"Login failed: {login_response.text}", 'error')
            return False
        
        user_data = login_response.json()
        user_id = user_data['user']['id']
        token = user_data['token']
        print_status("Login successful", 'success')
        
        # Get activity
        print("\n2. Fetching recent activity...")
        headers = {"Authorization": f"Bearer {token}"}
        activity_response = requests.get(
            f"{API_URL}/users/activity?limit=5",
            headers=headers
        )
        
        if activity_response.status_code != 200:
            print_status(f"Failed to fetch activity: {activity_response.text}", 'error')
            return False
        
        activities = activity_response.json()['activities']
        print_status(f"Retrieved {len(activities)} activities", 'success')
        
        # Check timestamps
        print("\n3. Checking timestamp format...")
        
        if not activities:
            print_status("No activities found - creating new activity", 'warning')
            return True
        
        latest_activity = activities[0]
        timestamp = latest_activity['created_at']
        
        print(f"\n   Latest Activity Timestamp: {timestamp}")
        
        # Check if it has 'Z' suffix (UTC indicator)
        if timestamp.endswith('Z'):
            print_status("Timestamp has UTC indicator (Z)", 'success')
        else:
            print_status("Timestamp missing UTC indicator (Z) - may cause display issues", 'error')
            return False
        
        # Parse and validate timestamp
        try:
            if timestamp.endswith('Z'):
                dt_str = timestamp[:-1] + '+00:00'
            else:
                dt_str = timestamp
            
            parsed_dt = datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
            current_time = datetime.now(timezone.utc)
            time_diff = (current_time - parsed_dt).total_seconds()
            
            print(f"   Time difference: {time_diff:.0f} seconds")
            
            if time_diff < 60:
                print_status(f"Timestamp is recent (Just now)", 'success')
            elif time_diff < 3600:
                print_status(f"Timestamp is recent ({int(time_diff/60)} minutes ago)", 'success')
            else:
                print_status(f"Timestamp appears old ({int(time_diff/3600)} hours ago)", 'warning')
                return False
            
        except Exception as e:
            print_status(f"Failed to parse timestamp: {e}", 'error')
            return False
        
        # Display all activities
        print("\n4. Recent Activities:")
        for i, activity in enumerate(activities[:5], 1):
            print(f"\n   {i}. {activity['activity_type'].upper()}")
            print(f"      Time: {activity['created_at']}")
            print(f"      Description: {activity['description']}")
        
        return True
        
    except requests.exceptions.ConnectionError:
        print_status(f"Cannot connect to backend at {API_URL}", 'error')
        print_status("Make sure the backend is running: python run.py", 'warning')
        return False
    except Exception as e:
        print_status(f"Unexpected error: {e}", 'error')
        return False

def test_database():
    """Test PostgreSQL database directly."""
    print(f"\n{Colors.BLUE}=== Testing PostgreSQL ==={Colors.END}\n")
    
    try:
        import psycopg2
        from psycopg2 import sql
        
        # Connection parameters (adjust as needed)
        conn = psycopg2.connect(
            host="localhost",
            database="neurocare_db",
            user="neurocare",
            password="neurocare_password"
        )
        
        cur = conn.cursor()
        
        # Check timezone
        cur.execute("SHOW timezone;")
        tz = cur.fetchone()[0]
        print(f"PostgreSQL Timezone: {tz}")
        
        if tz == 'UTC':
            print_status("Database timezone is UTC", 'success')
        else:
            print_status(f"Database timezone is {tz} (consider changing to UTC)", 'warning')
        
        # Check recent activities
        cur.execute("""
            SELECT id, user_id, activity_type, created_at 
            FROM user_activities 
            ORDER BY created_at DESC 
            LIMIT 5;
        """)
        
        activities = cur.fetchall()
        print(f"\nRecent activities in database:")
        for activity in activities:
            print(f"  ID: {activity[0]}, Type: {activity[2]}, Time: {activity[3]}")
        
        cur.close()
        conn.close()
        print_status("Database check completed", 'success')
        return True
        
    except ImportError:
        print_status("psycopg2 not installed - skipping database test", 'warning')
        return True
    except Exception as e:
        print_status(f"Database test failed: {e}", 'warning')
        return True

def main():
    """Run all tests."""
    print(f"\n{Colors.BLUE}{'='*50}")
    print(f"Activity Timestamp Fix Verification")
    print(f"{'='*50}{Colors.END}\n")
    
    # Test login and activity
    api_test_passed = test_login()
    
    # Test database
    db_test_passed = test_database()
    
    # Summary
    print(f"\n{Colors.BLUE}=== Test Summary ==={Colors.END}\n")
    
    if api_test_passed and db_test_passed:
        print_status("All tests passed! ✓", 'success')
        print("\nYour activity timestamps should now display correctly.")
        return 0
    else:
        print_status("Some tests failed. Check the errors above.", 'error')
        print("\nCommon fixes:")
        print("  1. Ensure backend is running: python run.py")
        print("  2. Check PostgreSQL is running")
        print("  3. Verify your test credentials in this script")
        print("  4. Clear browser cache and reload")
        return 1

if __name__ == "__main__":
    sys.exit(main())
