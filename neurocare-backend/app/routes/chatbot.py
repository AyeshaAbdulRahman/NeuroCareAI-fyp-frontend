from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.utils.jwt_utils import get_current_user_id

chatbot_bp = Blueprint('chatbot', __name__)


@chatbot_bp.route('/chat', methods=['POST'])
@jwt_required()
def send_message():
    """
    Chatbot endpoint - STUB
    
    This is a placeholder endpoint. The actual AI chatbot integration
    is handled by the AI/DLP team.
    
    For now, it returns a simple response.
    """
    try:
        user_id = get_current_user_id()
        data = request.get_json()
        
        if not data.get('message'):
            return jsonify({
                'success': False,
                'message': 'Message is required'
            }), 400
        
        user_message = data['message']
        
        # STUB RESPONSE - Replace with actual AI integration
        # This is where your AI/DLP team will integrate the chatbot
        response = {
            'reply': 'Thank you for your message. This is a placeholder response from the NeuroCare AI chatbot. Please contact the AI/DLP team to integrate the actual chatbot functionality.',
            'references': []
        }
        
        # Example of how the real implementation might work:
        # from your_chatbot_module import get_chatbot_response
        # response = get_chatbot_response(user_message)
        
        return jsonify({
            'success': True,
            'message': user_message,
            'reply': response['reply'],
            'references': response['references']
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Failed to process chat message',
            'error': str(e)
        }), 500


@chatbot_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for chatbot service"""
    return jsonify({
        'success': True,
        'message': 'Chatbot service is running',
        'status': 'stub'
    }), 200
