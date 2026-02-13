from flask import Blueprint, jsonify, current_app
import pymongo
from datetime import datetime

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    try:
        if not hasattr(current_app, 'config') or 'MONGO_URI' not in current_app.config:
            return {
                'status': 'unhealthy',
                'message': 'MongoDB not configured',
                'database': 'not_configured'
            }, 500
        
        mongo_uri = current_app.config.get('MONGO_URI', 'mongodb://localhost:27017/builtcred')
        client = pymongo.MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        
        return {
            'status': 'healthy',
            'message': 'API is running',
            'database': 'connected'
        }, 200
    except pymongo.errors.ServerSelectionTimeoutError:
        return {
            'status': 'unhealthy',
            'message': 'Database connection timeout',
            'database': 'disconnected',
            'error': 'Cannot reach MongoDB. Ensure MongoDB is running on the configured URI.'
        }, 503
    except Exception as e:
        return {
            'status': 'unhealthy',
            'message': 'API error',
            'database': 'error',
            'error': str(e)
        }, 500

@health_bp.route('/api/health', methods=['GET'])
def api_health_check():
    try:
        if not hasattr(current_app, 'config') or 'MONGO_URI' not in current_app.config:
            return {
                'status': 'unhealthy',
                'message': 'MongoDB not configured'
            }, 500
        
        mongo_uri = current_app.config.get('MONGO_URI', 'mongodb://localhost:27017/builtcred')
        client = pymongo.MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        
        return {
            'status': 'healthy',
            'message': 'API is running',
            'timestamp': datetime.utcnow().isoformat()
        }, 200
    except Exception as e:
        return {
            'status': 'unhealthy',
            'message': str(e)
        }, 500

