"""
User Management Routes
- PUT /users/profile - Update user profile
- POST /users/reset-password - Reset/change user password
- GET /users/profile - Get user profile
"""

from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import os
from datetime import datetime
from pymongo import MongoClient
from bson.objectid import ObjectId
from functools import wraps

user_bp = Blueprint('users', __name__)

# MongoDB Connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
client = MongoClient(MONGO_URI)
db = client.get_database('builtcred')
users_collection = db['users']

# JWT Secret
JWT_SECRET = os.getenv('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

def verify_token(f):
    """Verify JWT token from request header"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header:
            try:
                token = auth_header.split(' ')[1]
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'error': 'Missing authorization token'}), 401
        
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id = payload.get('user_id')
            request.user_id = user_id
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    return decorated_function

def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not __import__('re').search(r'[a-z]', password):
        return False, "Password must contain lowercase letters"
    if not __import__('re').search(r'[A-Z]', password):
        return False, "Password must contain uppercase letters"
    if not __import__('re').search(r'[0-9]', password):
        return False, "Password must contain numbers"
    return True, ""

@user_bp.route('/profile', methods=['GET'])
@verify_token
def get_profile():
    """
    Get current user profile
    Returns: { user_id, email, full_name, phone, project_name, plot_number, ... }
    """
    try:
        user_id = request.user_id
        
        try:
            user_obj_id = ObjectId(user_id)
        except:
            return jsonify({'error': 'Invalid user ID'}), 400
        
        user = users_collection.find_one({'_id': user_obj_id})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Return user profile without password
        user_data = {
            'user_id': str(user['_id']),
            'email': user.get('email'),
            'full_name': user.get('full_name'),
            'phone': user.get('phone'),
            'project_name': user.get('project_name'),
            'plot_number': user.get('plot_number'),
            'role': user.get('role'),
            'advocate_type': user.get('advocate_type'),
            'status': user.get('status'),
            'created_at': user.get('created_at')
        }
        
        return jsonify({'user': user_data}), 200
        
    except Exception as e:
        print(f'Error getting profile: {str(e)}')
        return jsonify({'error': 'Failed to retrieve profile'}), 500

@user_bp.route('/profile', methods=['PUT'])
@verify_token
def update_profile():
    """
    Update user profile
    Request: { full_name, email, phone, project_name, plot_number }
    Response: { message, user }
    """
    try:
        user_id = request.user_id
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        try:
            user_obj_id = ObjectId(user_id)
        except:
            return jsonify({'error': 'Invalid user ID'}), 400
        
        # Find the user
        user = users_collection.find_one({'_id': user_obj_id})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Prepare update data
        update_data = {}
        
        # Full Name (required)
        if 'full_name' in data:
            full_name = data.get('full_name', '').strip()
            if not full_name:
                return jsonify({'error': 'Full name is required'}), 400
            update_data['full_name'] = full_name
        
        # Email (required, must be unique)
        if 'email' in data:
            email = data.get('email', '').strip().lower()
            if not email:
                return jsonify({'error': 'Email is required'}), 400
            
            # Validate email format
            import re
            if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
                return jsonify({'error': 'Invalid email format'}), 400
            
            # Check if email is already taken by another user
            existing_user = users_collection.find_one({
                'email': email,
                '_id': {'$ne': user_obj_id}
            })
            if existing_user:
                return jsonify({'error': 'Email already in use'}), 400
            
            update_data['email'] = email
        
        # Phone (optional)
        if 'phone' in data:
            phone = data.get('phone', '').strip()
            if phone:
                update_data['phone'] = phone
            else:
                update_data['phone'] = None
        
        # Project Name (optional)
        if 'project_name' in data:
            project_name = data.get('project_name', '').strip()
            if project_name:
                update_data['project_name'] = project_name
            else:
                update_data['project_name'] = None
        
        # Plot Number (optional)
        if 'plot_number' in data:
            plot_number = data.get('plot_number', '').strip()
            if plot_number:
                update_data['plot_number'] = plot_number
            else:
                update_data['plot_number'] = None
        
        # Add update timestamp
        update_data['updated_at'] = datetime.utcnow()
        
        # Update the user
        users_collection.update_one(
            {'_id': user_obj_id},
            {'$set': update_data}
        )
        
        # Get updated user data
        updated_user = users_collection.find_one({'_id': user_obj_id})
        
        user_response = {
            'user_id': str(updated_user['_id']),
            'email': updated_user.get('email'),
            'full_name': updated_user.get('full_name'),
            'phone': updated_user.get('phone'),
            'project_name': updated_user.get('project_name'),
            'plot_number': updated_user.get('plot_number'),
            'role': updated_user.get('role'),
            'advocate_type': updated_user.get('advocate_type')
        }
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user_response
        }), 200
        
    except Exception as e:
        print(f'Error updating profile: {str(e)}')
        return jsonify({'error': 'Failed to update profile'}), 500

@user_bp.route('/reset-password', methods=['POST'])
@verify_token
def reset_password():
    """
    Reset/change user password
    Request: { current_password, new_password }
    Response: { message }
    """
    try:
        user_id = request.user_id
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        current_password = data.get('current_password', '').strip()
        new_password = data.get('new_password', '').strip()
        
        if not current_password or not new_password:
            return jsonify({'error': 'Current and new password are required'}), 400
        
        try:
            user_obj_id = ObjectId(user_id)
        except:
            return jsonify({'error': 'Invalid user ID'}), 400
        
        # Find the user
        user = users_collection.find_one({'_id': user_obj_id})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Verify current password
        if not check_password_hash(user.get('password'), current_password):
            return jsonify({'error': 'Current password is incorrect'}), 401
        
        # Validate new password strength
        is_valid, message = validate_password(new_password)
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # Check if new password is same as current password
        if current_password == new_password:
            return jsonify({'error': 'New password must be different from current password'}), 400
        
        # Hash new password
        hashed_password = generate_password_hash(new_password)
        
        # Update password
        users_collection.update_one(
            {'_id': user_obj_id},
            {'$set': {
                'password': hashed_password,
                'updated_at': datetime.utcnow()
            }}
        )
        
        return jsonify({
            'message': 'Password changed successfully'
        }), 200
        
    except Exception as e:
        print(f'Error resetting password: {str(e)}')
        return jsonify({'error': 'Failed to reset password'}), 500
