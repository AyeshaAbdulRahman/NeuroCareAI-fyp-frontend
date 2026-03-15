"""
NeuroCare AI Backend - Main Entry Point

Run this file to start the Flask development server.
"""

import os
from app import create_app

# Get configuration from environment variable
config_name = os.environ.get('FLASK_ENV', 'development')

# Create Flask application
app = create_app(config_name)

if __name__ == '__main__':
    # Run the Flask application
    print("\n" + "="*50)
    print("  NeuroCare AI Backend")
    print("  ====================")
    print("\n  Starting server...")
    print("  API URL: http://127.0.0.1:5000")
    print("  Health Check: http://127.0.0.1:5000/api/health")
    print("\n  Default Admin:")
    print("  Email: admin@neurocare.ai")
    print("  Password: admin123")
    print("\n  Press CTRL+C to stop the server")
    print("="*50 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
