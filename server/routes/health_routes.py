"""
Task: Implement health check and utility routes
- GET /health - Health check endpoint
- GET /health/db - Database connection status
- GET /health/api - API status

Expected functionality:
- Return system status
- Check database connectivity
- Verify API availability
"""

from flask import Blueprint, jsonify
from datetime import datetime

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    """
    Check API health
    Response: { status, timestamp, version }
    """
    # Implementation goes here
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '2.0.0'
    })

@health_bp.route('/health/db', methods=['GET'])
def check_database():
    """
    Check database connection
    Response: { status, database, connected }
    """
    # Implementation goes here
    pass

@health_bp.route('/health/api', methods=['GET'])
def check_api():
    """
    Check API status
    Response: { status, uptime, endpoints }
    """
    # Implementation goes here
    pass
