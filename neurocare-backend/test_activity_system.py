import os
import sys
import tempfile
import unittest
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT_DIR))


class ActivitySystemTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
        cls.temp_db.close()
        os.environ["DATABASE_URI"] = f"sqlite:///{cls.temp_db.name}"

        from app import create_app
        from app.models import db, Feedback, User, UserActivity

        cls.db = db
        cls.User = User
        cls.UserActivity = UserActivity
        cls.Feedback = Feedback
        cls.app = create_app("development")
        cls.client = cls.app.test_client()

    @classmethod
    def tearDownClass(cls):
        with cls.app.app_context():
            cls.db.session.remove()
            cls.db.engine.dispose()
        try:
            os.unlink(cls.temp_db.name)
        except FileNotFoundError:
            pass
        except PermissionError:
            pass

    def setUp(self):
        with self.app.app_context():
            self.db.drop_all()
            self.db.create_all()

            admin = self.User(
                username="admin",
                email="admin@neurocare.ai",
                firstname="Admin",
                lastname="User",
                age=30,
                gender="Other",
                category="Other",
                country="Pakistan",
                city="Karachi",
                is_admin=True,
                is_active=True,
            )
            admin.set_password("admin123")
            self.db.session.add(admin)
            self.db.session.commit()

    def login(self, email, password):
        response = self.client.post(
            "/api/auth/login",
            json={"email": email, "password": password},
        )
        data = response.get_json()
        self.assertEqual(response.status_code, 200, data)
        return data["token"]

    def auth_headers(self, token):
        return {"Authorization": f"Bearer {token}"}

    def test_activity_logging_and_admin_feed(self):
        signup_payload = {
            "firstname": "Test",
            "lastname": "User",
            "username": "test_user",
            "email": "test.user@example.com",
            "password": "password123",
            "age": 29,
            "gender": "Female",
            "category": "Doctor",
            "country": "Pakistan",
            "city": "Karachi",
        }

        signup_response = self.client.post("/api/auth/signup", json=signup_payload)
        signup_data = signup_response.get_json()
        self.assertEqual(signup_response.status_code, 201, signup_data)
        self.assertFalse(signup_data["user"]["is_admin"])

        user_token = self.login(signup_payload["email"], signup_payload["password"])

        activity_response = self.client.get(
            "/api/users/activity",
            headers=self.auth_headers(user_token),
        )
        activity_data = activity_response.get_json()
        self.assertEqual(activity_response.status_code, 200, activity_data)
        activity_types = [item["activity_type"] for item in activity_data["activities"]]
        self.assertIn("signup", activity_types)
        self.assertIn("login", activity_types)

        feedback_response = self.client.post(
            "/api/feedback",
            json={"feedback_text": "This is a test feedback entry."},
            headers=self.auth_headers(user_token),
        )
        feedback_data = feedback_response.get_json()
        self.assertEqual(feedback_response.status_code, 201, feedback_data)
        feedback_id = feedback_data["feedback"]["id"]

        activity_response = self.client.get(
            "/api/users/activity",
            query_string={"all": "true", "limit": 20},
            headers=self.auth_headers(user_token),
        )
        activity_data = activity_response.get_json()
        activity_types = [item["activity_type"] for item in activity_data["activities"]]
        self.assertIn("feedback_submitted", activity_types)
        self.assertGreaterEqual(activity_data["total"], 3)

        admin_token = self.login("admin@neurocare.ai", "admin123")

        admin_feed_response = self.client.get(
            "/api/admin/activity",
            query_string={"all": "true", "limit": 20},
            headers=self.auth_headers(admin_token),
        )
        admin_feed_data = admin_feed_response.get_json()
        self.assertEqual(admin_feed_response.status_code, 200, admin_feed_data)
        self.assertTrue(
            any(
                entry["activity_type"] == "feedback_submitted"
                and entry.get("user", {}).get("email") == signup_payload["email"]
                for entry in admin_feed_data["activities"]
            )
        )

        update_feedback_response = self.client.put(
            f"/api/feedback/{feedback_id}",
            json={"status": "reviewed"},
            headers=self.auth_headers(admin_token),
        )
        update_feedback_data = update_feedback_response.get_json()
        self.assertEqual(update_feedback_response.status_code, 200, update_feedback_data)

        admin_feed_response = self.client.get(
            "/api/admin/activity",
            query_string={"all": "true", "limit": 50},
            headers=self.auth_headers(admin_token),
        )
        admin_feed_data = admin_feed_response.get_json()
        self.assertTrue(
            any(entry["activity_type"] == "feedback_status_updated" for entry in admin_feed_data["activities"])
        )

    def test_admin_activity_requires_admin_role(self):
        signup_payload = {
            "firstname": "Basic",
            "lastname": "User",
            "username": "basic_user",
            "email": "basic.user@example.com",
            "password": "password123",
            "age": 27,
            "gender": "Male",
            "category": "Patient",
            "country": "Pakistan",
            "city": "Karachi",
        }

        self.client.post("/api/auth/signup", json=signup_payload)
        user_token = self.login(signup_payload["email"], signup_payload["password"])

        forbidden_response = self.client.get(
            "/api/admin/activity",
            headers=self.auth_headers(user_token),
        )
        forbidden_data = forbidden_response.get_json()
        self.assertEqual(forbidden_response.status_code, 403, forbidden_data)


if __name__ == "__main__":
    unittest.main()
