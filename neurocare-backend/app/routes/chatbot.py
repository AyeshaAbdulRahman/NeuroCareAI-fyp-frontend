from datetime import datetime
import json
import urllib.error
import urllib.request

from flask import Blueprint, current_app, request, jsonify
from flask_jwt_extended import jwt_required
from app.models import db, ChatMessage, ChatSession, ChatArchive
from app.utils.jwt_utils import get_current_user_id

chatbot_bp = Blueprint('chatbot', __name__)


def _generate_summary_title(text: str, max_words: int = 2) -> str:
    """Generate a concise title (2 words max) from the bot response"""
    if not text:
        return 'New Chat'
    
    # Remove extra whitespace and clean
    text = ' '.join(text.split())
    
    # Aggressive stop words - remove almost everything except nouns/important words
    stop_words = {
        'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
        'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'or', 'that',
        'the', 'to', 'was', 'will', 'with', 'this', 'but', 'not', 'you',
        'your', 'have', 'do', 'does', 'did', 'can', 'could', 'would', 'about',
        'hello', 'how', 'can', 'i', 'assist', 'help', 'what', 'which', 'when',
        'where', 'why', 'if', 'then', 'than', 'just', 'very', 'more', 'most',
        'some', 'any', 'all', 'each', 'every', 'other', 'such', 'no', 'yes',
        'today', 'right', 'now', 'here', 'there', 'please', 'thank'
    }
    
    # Split into words and filter
    words = [w for w in text.split() if w.lower().strip('.,!?;:') not in stop_words and w.strip('.,!?;:')]
    
    # Take first max_words
    summary_words = words[:max_words]
    
    if not summary_words:
        # If no meaningful words found, take first max_words from original
        summary_words = text.split()[:max_words]
    
    title = ' '.join(summary_words)
    # Remove trailing punctuation
    title = title.rstrip('.,!?;:')
    
    return title[:100] if title else 'New Chat'


def _ensure_session_owner(user_id: int, session_id: int):
    session = ChatSession.query.filter_by(id=session_id, user_id=user_id).first()
    return session


def _safe_references(raw_references):
    if isinstance(raw_references, list):
        return raw_references
    return []


def _build_rag_history(session_id: int, limit: int = 20):
    """Build conversation history for RAG context - uses last N messages"""
    rows = (
        ChatMessage.query.filter_by(session_id=session_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(limit)
        .all()
    )
    rows.reverse()
    history = []
    for row in rows:
        role = 'user' if row.sender == 'user' else 'assistant'
        if row.message_text:
            history.append({'role': role, 'content': row.message_text})
    return history


def _archive_old_messages(session_id: int, keep_messages: int = 50):
    """
    Archive old messages when session exceeds max message count.
    Keeps the most recent 'keep_messages' messages in active chat.
    """
    total_messages = ChatMessage.query.filter_by(session_id=session_id).count()
    
    if total_messages <= keep_messages:
        return False  # No need to archive
    
    messages_to_archive = total_messages - keep_messages
    old_messages = (
        ChatMessage.query.filter_by(session_id=session_id)
        .order_by(ChatMessage.created_at.asc())
        .limit(messages_to_archive)
        .all()
    )
    
    if not old_messages:
        return False
    
    # Convert to JSON for archiving
    archived_data = []
    for msg in old_messages:
        archived_data.append({
            'id': msg.id,
            'sender': msg.sender,
            'message_text': msg.message_text,
            'references': msg.references(),
            'created_at': msg.created_at.isoformat() if msg.created_at else None
        })
    
    # Create archive record
    archive = ChatArchive(
        session_id=session_id,
        messages_json=json.dumps(archived_data),
        message_count=len(archived_data)
    )
    db.session.add(archive)
    
    # Delete archived messages from active table
    for msg in old_messages:
        db.session.delete(msg)
    
    db.session.commit()
    return True


def _call_chatbot_service(message: str, rag_session_key: str, history):
    service_url = current_app.config.get('CHATBOT_SERVICE_URL')
    timeout_seconds = int(current_app.config.get('CHATBOT_TIMEOUT_SECONDS', 90))
    payload = {
        'message': message,
        'session_id': rag_session_key,
        'history': history
    }
    req = urllib.request.Request(
        service_url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    with urllib.request.urlopen(req, timeout=timeout_seconds) as response:
        response_data = response.read().decode('utf-8')
    parsed = json.loads(response_data) if response_data else {}
    return {
        'reply': parsed.get('reply') or 'I could not generate a response at this time.',
        'references': _safe_references(parsed.get('references'))
    }


@chatbot_bp.route('/sessions', methods=['GET'])
@jwt_required()
def list_sessions():
    try:
        user_id = get_current_user_id()
        sessions = (
            ChatSession.query.filter_by(user_id=user_id)
            .order_by(ChatSession.updated_at.desc(), ChatSession.id.desc())
            .all()
        )
        return jsonify({
            'success': True,
            'sessions': [session.to_dict() for session in sessions]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Failed to fetch sessions',
            'error': str(e)
        }), 500


@chatbot_bp.route('/sessions', methods=['POST'])
@jwt_required()
def create_session():
    try:
        user_id = get_current_user_id()
        data = request.get_json() or {}
        title = (data.get('title') or 'New Chat').strip()
        title = title[:120] if title else 'New Chat'

        session = ChatSession(user_id=user_id, title=title)
        db.session.add(session)
        db.session.commit()

        return jsonify({
            'success': True,
            'session': session.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Failed to create session',
            'error': str(e)
        }), 500


@chatbot_bp.route('/sessions/<int:session_id>/messages', methods=['GET'])
@jwt_required()
def get_session_messages(session_id):
    try:
        user_id = get_current_user_id()
        session = _ensure_session_owner(user_id, session_id)
        if not session:
            return jsonify({
                'success': False,
                'message': 'Session not found'
            }), 404

        messages = (
            ChatMessage.query.filter_by(session_id=session.id)
            .order_by(ChatMessage.created_at.asc(), ChatMessage.id.asc())
            .all()
        )
        return jsonify({
            'success': True,
            'session': session.to_dict(),
            'messages': [msg.to_dict() for msg in messages]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Failed to fetch messages',
            'error': str(e)
        }), 500


@chatbot_bp.route('/sessions/<int:session_id>', methods=['DELETE'])
@jwt_required()
def delete_session(session_id):
    try:
        user_id = get_current_user_id()
        session = _ensure_session_owner(user_id, session_id)
        if not session:
            return jsonify({
                'success': False,
                'message': 'Session not found'
            }), 404

        db.session.delete(session)
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'Session deleted successfully'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Failed to delete session',
            'error': str(e)
        }), 500


@chatbot_bp.route('/chat', methods=['POST'])
@jwt_required()
def send_message():
    try:
        user_id = get_current_user_id()
        data = request.get_json() or {}
        user_text = (data.get('message') or '').strip()
        if not user_text:
            return jsonify({
                'success': False,
                'message': 'Message is required'
            }), 400

        session_id_raw = data.get('session_id')
        if session_id_raw is not None:
            try:
                session_id = int(session_id_raw)
            except (TypeError, ValueError):
                return jsonify({
                    'success': False,
                    'message': 'session_id must be a valid integer'
                }), 400

            session = _ensure_session_owner(user_id, session_id)
            if not session:
                return jsonify({
                    'success': False,
                    'message': 'Session not found'
                }), 404
        else:
            session = ChatSession(user_id=user_id, title='New Chat')
            db.session.add(session)
            db.session.commit()

        existing_history = _build_rag_history(session.id)

        user_msg = ChatMessage(
            session_id=session.id,
            sender='user',
            message_text=user_text,
            references_json='[]'
        )
        db.session.add(user_msg)
        session.updated_at = datetime.utcnow()
        db.session.commit()

        rag_session_key = f"user:{user_id}:session:{session.id}"
        try:
            rag_output = _call_chatbot_service(
                message=user_text,
                rag_session_key=rag_session_key,
                history=existing_history
            )
            bot_text = rag_output['reply']
            references = rag_output['references']
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, ValueError):
            bot_text = 'Chatbot service is unavailable right now. Please try again in a moment.'
            references = []

        bot_msg = ChatMessage(
            session_id=session.id,
            sender='bot',
            message_text=bot_text,
            references_json=json.dumps(references)
        )
        db.session.add(bot_msg)
        
        # Update session title based on user's first message if it's the first message
        if session.title == 'New Chat':
            session.title = _generate_summary_title(user_text)
        
        session.updated_at = datetime.utcnow()
        db.session.commit()
        
        # Archive old messages if session exceeds max limit (50 messages)
        _archive_old_messages(session.id, keep_messages=50)

        return jsonify({
            'success': True,
            'session': session.to_dict(),
            'session_id': session.id,
            'user_message': user_msg.to_dict(),
            'bot_message': bot_msg.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Failed to process message',
            'error': str(e)
        }), 500


@chatbot_bp.route('/sessions/<int:session_id>/archives', methods=['GET'])
@jwt_required()
def get_session_archives(session_id):
    """Get archived messages for a session (for viewing older chat history)"""
    try:
        user_id = get_current_user_id()
        session = _ensure_session_owner(user_id, session_id)
        if not session:
            return jsonify({
                'success': False,
                'message': 'Session not found'
            }), 404

        archives = (
            ChatArchive.query.filter_by(session_id=session.id)
            .order_by(ChatArchive.archived_at.desc())
            .all()
        )
        return jsonify({
            'success': True,
            'archives': [archive.to_dict() for archive in archives]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Failed to fetch archives',
            'error': str(e)
        }), 500


@chatbot_bp.route('/sessions/<int:session_id>/archives/<int:archive_id>/messages', methods=['GET'])
@jwt_required()
def get_archive_messages(session_id, archive_id):
    """Get detailed messages from a specific archive"""
    try:
        user_id = get_current_user_id()
        session = _ensure_session_owner(user_id, session_id)
        if not session:
            return jsonify({
                'success': False,
                'message': 'Session not found'
            }), 404

        archive = ChatArchive.query.filter_by(id=archive_id, session_id=session.id).first()
        if not archive:
            return jsonify({
                'success': False,
                'message': 'Archive not found'
            }), 404

        try:
            messages = json.loads(archive.messages_json or '[]')
            return jsonify({
                'success': True,
                'archive': archive.to_dict(),
                'messages': messages
            }), 200
        except json.JSONDecodeError:
            return jsonify({
                'success': False,
                'message': 'Failed to parse archived messages'
            }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Failed to fetch archive messages',
            'error': str(e)
        }), 500


@chatbot_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for chatbot service"""
    return jsonify({
        'success': True,
        'message': 'Chatbot service is running',
        'status': 'active'
    }), 200
