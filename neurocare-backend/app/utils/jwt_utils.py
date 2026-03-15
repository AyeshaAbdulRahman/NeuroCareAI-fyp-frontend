from flask_jwt_extended import get_jwt_identity


def get_current_user_id():
    """Return current JWT identity as integer user id."""
    identity = get_jwt_identity()
    try:
        return int(identity)
    except (TypeError, ValueError) as exc:
        raise ValueError("Invalid token identity") from exc
