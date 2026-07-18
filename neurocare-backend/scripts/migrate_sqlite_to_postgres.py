#!/usr/bin/env python
"""
Migrate NeuroCare backend data from SQLite to PostgreSQL.

Usage:
  python scripts/migrate_sqlite_to_postgres.py \
    --postgres-uri "postgresql+pg8000://postgres:password@localhost:5432/neurocare" \
    --force
"""

from __future__ import annotations

import argparse
import os
import shutil
import sqlite3
import sys
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import text

# Allow running this script from the backend root via:
# python scripts/migrate_sqlite_to_postgres.py ...
ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
load_dotenv(ROOT_DIR / ".env")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Migrate data from SQLite (instance/neurocare.db) to PostgreSQL."
    )
    parser.add_argument(
        "--sqlite-path",
        default="instance/neurocare.db",
        help="Path to SQLite database file. Relative paths are resolved from backend root.",
    )
    parser.add_argument(
        "--postgres-uri",
        default="",
        help="PostgreSQL SQLAlchemy URI. Example: postgresql+pg8000://user:pass@host:5432/dbname",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Truncate PostgreSQL tables before migration.",
    )
    parser.add_argument(
        "--skip-backup",
        action="store_true",
        help="Skip making a timestamped backup of the SQLite file before migration.",
    )
    return parser.parse_args()


def get_sqlite_rows(sqlite_path: Path, table_name: str) -> list[dict]:
    with sqlite3.connect(sqlite_path) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(f"SELECT * FROM {table_name} ORDER BY id ASC").fetchall()
    return [dict(row) for row in rows]


def backup_sqlite(sqlite_path: Path) -> Path:
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = sqlite_path.with_name(f"{sqlite_path.stem}.backup.{timestamp}{sqlite_path.suffix}")
    shutil.copy2(sqlite_path, backup_path)
    return backup_path


def load_backend_objects():
    from app import create_app
    from app.models import db

    return create_app, db


def print_counts(session, label: str) -> None:
    users_count = session.execute(text("SELECT COUNT(*) FROM users")).scalar_one()
    feedback_count = session.execute(text("SELECT COUNT(*) FROM feedbacks")).scalar_one()
    activity_count = session.execute(text("SELECT COUNT(*) FROM user_activities")).scalar_one()
    reports_count = session.execute(text("SELECT COUNT(*) FROM diagnosis_reports")).scalar_one()
    print(
        f"{label} users={users_count}, feedbacks={feedback_count}, "
        f"user_activities={activity_count}, diagnosis_reports={reports_count}"
    )


def reset_sequences(session) -> None:
    session.execute(
        text(
            "SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) FROM users"
        )
    )
    session.execute(
        text(
            "SELECT setval(pg_get_serial_sequence('feedbacks', 'id'), COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) FROM feedbacks"
        )
    )
    session.execute(
        text(
            "SELECT setval(pg_get_serial_sequence('user_activities', 'id'), COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) FROM user_activities"
        )
    )
    session.execute(
        text(
            "SELECT setval(pg_get_serial_sequence('diagnosis_reports', 'id'), COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) FROM diagnosis_reports"
        )
    )


def migrate(sqlite_path: Path, postgres_uri: str, force: bool) -> None:
    create_app, db = load_backend_objects()
    os.environ["DATABASE_URI"] = postgres_uri
    app = create_app(os.environ.get("FLASK_ENV", "development"))

    users_rows = get_sqlite_rows(sqlite_path, "users")
    feedback_rows = get_sqlite_rows(sqlite_path, "feedbacks")
    activity_rows = get_sqlite_rows(sqlite_path, "user_activities")

    with app.app_context():
        db.create_all()
        print_counts(db.session, "PostgreSQL before migration:")

        existing_users = db.session.execute(text("SELECT COUNT(*) FROM users")).scalar_one()
        existing_feedbacks = db.session.execute(text("SELECT COUNT(*) FROM feedbacks")).scalar_one()
        existing_activities = db.session.execute(text("SELECT COUNT(*) FROM user_activities")).scalar_one()
        existing_reports = db.session.execute(text("SELECT COUNT(*) FROM diagnosis_reports")).scalar_one()

        if (existing_users or existing_feedbacks or existing_activities or existing_reports) and not force:
            raise RuntimeError(
                "PostgreSQL target has existing data. Re-run with --force to truncate and continue."
            )

        if force:
            db.session.execute(
                text("TRUNCATE TABLE feedbacks, user_activities, diagnosis_reports, users RESTART IDENTITY CASCADE")
            )
            db.session.commit()

        if users_rows:
            db.session.execute(
                text(
                    """
                    INSERT INTO users (
                        id, username, email, password_hash, firstname, lastname, age, gender,
                        category, country, city, profile_picture, is_admin, is_active, created_at, updated_at
                    ) VALUES (
                        :id, :username, :email, :password_hash, :firstname, :lastname, :age, :gender,
                        :category, :country, :city, :profile_picture, :is_admin, :is_active, :created_at, :updated_at
                    )
                    """
                ),
                [
                    {
                        **row,
                        "is_admin": bool(row["is_admin"]) if row.get("is_admin") is not None else False,
                        "is_active": bool(row["is_active"]) if row.get("is_active") is not None else True,
                    }
                    for row in users_rows
                ],
            )

        if feedback_rows:
            db.session.execute(
                text(
                    """
                    INSERT INTO feedbacks (
                        id, user_id, feedback_text, status, created_at, updated_at
                    ) VALUES (
                        :id, :user_id, :feedback_text, :status, :created_at, :updated_at
                    )
                    """
                ),
                feedback_rows,
            )

        if activity_rows:
            db.session.execute(
                text(
                    """
                    INSERT INTO user_activities (
                        id, user_id, activity_type, description, created_at
                    ) VALUES (
                        :id, :user_id, :activity_type, :description, :created_at
                    )
                    """
                ),
                activity_rows,
            )

        # Diagnosis reports are user-generated at runtime and are not present
        # in the legacy SQLite export, so we only ensure the table exists.

        reset_sequences(db.session)
        db.session.commit()
        print_counts(db.session, "PostgreSQL after migration:")


def main() -> int:
    args = parse_args()
    sqlite_input = Path(args.sqlite_path)
    if sqlite_input.is_absolute():
        sqlite_path = sqlite_input
    else:
        candidate_root = (ROOT_DIR / sqlite_input).resolve()
        candidate_cwd = sqlite_input.resolve()
        sqlite_path = candidate_root if candidate_root.exists() else candidate_cwd

    if not sqlite_path.exists():
        print(f"ERROR: SQLite file not found: {sqlite_path}")
        return 1

    postgres_uri = (
        args.postgres_uri.strip()
        or os.environ.get("POSTGRES_URI", "").strip()
        or os.environ.get("DATABASE_URI", "").strip()
    )
    if not postgres_uri:
        print(
            "ERROR: PostgreSQL URI is required. Pass --postgres-uri "
            "or set POSTGRES_URI/DATABASE_URI in .env"
        )
        return 1

    if not postgres_uri.startswith("postgresql"):
        print("ERROR: --postgres-uri must start with 'postgresql'.")
        return 1

    if not args.skip_backup:
        backup_path = backup_sqlite(sqlite_path)
        print(f"SQLite backup created: {backup_path}")

    try:
        migrate(sqlite_path=sqlite_path, postgres_uri=postgres_uri, force=args.force)
    except Exception as exc:
        print(f"Migration failed: {exc}")
        return 1

    print("Migration completed successfully.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
