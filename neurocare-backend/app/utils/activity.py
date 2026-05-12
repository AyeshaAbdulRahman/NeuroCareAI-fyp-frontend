from app.models import db, UserActivity


def log_user_activity(user_id, activity_type, description=None):
    """Create an activity entry in the current database transaction."""
    normalized_type = (activity_type or '').strip()[:50]
    normalized_description = (description or '').strip()[:200] or None

    activity = UserActivity(
        user_id=user_id,
        activity_type=normalized_type,
        description=normalized_description,
    )
    db.session.add(activity)
    return activity
