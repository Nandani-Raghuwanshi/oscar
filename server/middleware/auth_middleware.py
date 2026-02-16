"""
Authentication and Authorization Middleware

Provides:
- Token verification
- Role-based access control (RBAC)
- Decorators for protecting routes
"""

from functools import wraps
from flask import request, jsonify
import jwt
import os
from pymongo import MongoClient

# MongoDB Connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
client = MongoClient(MONGO_URI)
db = client.get_database('builtcred')
users_collection = db['users']

JWT_SECRET = os.getenv('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

def verify_token(token):
    """Verify JWT token and return user data"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get('user_id')
        
        if not user_id:
            return None, 'Invalid token'
        
        # Get user from database
        from bson.objectid import ObjectId
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        
        if not user:
            return None, 'User not found'
        
        return user, None
    except jwt.ExpiredSignatureError:
        return None, 'Token has expired'
    except jwt.InvalidTokenError:
        return None, 'Invalid token'
    except Exception as e:
        return None, str(e)

def get_token_from_request():
    """Extract JWT token from Authorization header"""
    auth_header = request.headers.get('Authorization', '')
    
    if not auth_header:
        return None
    
    try:
        # Expected format: "Bearer <token>"
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return None
        return parts[1]
    except Exception:
        return None

def login_required(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = get_token_from_request()
        
        if not token:
            return jsonify({'error': 'Missing authorization token'}), 401
        
        user, error = verify_token(token)
        
        if error:
            return jsonify({'error': error}), 401
        
        if not user.get('is_active', True):
            return jsonify({'error': 'Account is inactive'}), 403
        
        if user.get('status') != 'approved':
            return jsonify({'error': 'Account not approved'}), 403
        
        # Attach user to request for use in the route
        request.current_user = user
        return f(*args, **kwargs)
    
    return decorated_function

def role_required(*required_roles):
    """Decorator to require specific roles"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            token = get_token_from_request()
            
            if not token:
                return jsonify({'error': 'Missing authorization token'}), 401
            
            user, error = verify_token(token)
            
            if error:
                return jsonify({'error': error}), 401
            
            if not user.get('is_active', True):
                return jsonify({'error': 'Account is inactive'}), 403
            
            if user.get('status') != 'approved':
                return jsonify({'error': 'Account not approved'}), 403
            
            user_role = user.get('role', 'user')
            
            if user_role not in required_roles:
                return jsonify({
                    'error': f'Insufficient permissions. Required roles: {", ".join(required_roles)}'
                }), 403
            
            # Attach user to request for use in the route
            request.current_user = user
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator

def admin_required(f):
    """Decorator to require admin role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = get_token_from_request()
        
        if not token:
            return jsonify({'error': 'Missing authorization token'}), 401
        
        user, error = verify_token(token)
        
        if error:
            return jsonify({'error': error}), 401
        
        if not user.get('is_active', True):
            return jsonify({'error': 'Account is inactive'}), 403
        
        if user.get('status') != 'approved':
            return jsonify({'error': 'Account not approved'}), 403
        
        if user.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        # Attach user to request for use in the route
        request.current_user = user
        return f(*args, **kwargs)
    
    return decorated_function
