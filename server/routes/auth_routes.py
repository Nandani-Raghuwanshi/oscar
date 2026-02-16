"""
Task: Implement authentication routes
- POST /auth/signup - User registration
- POST /auth/login - User login
- POST /auth/logout - User logout

Expected functionality:
- Validate email format and uniqueness
- Hash passwords securely
- Generate JWT tokens
- Return user data on success
- Handle errors appropriately
"""

from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import os
from datetime import datetime, timedelta
from pymongo import MongoClient
import re

auth_bp = Blueprint('auth', __name__)

# MongoDB Connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
client = MongoClient(MONGO_URI)
db = client.get_database('builtcred')
users_collection = db['users']
advocates_collection = db['advocates']

# JWT Secret
JWT_SECRET = os.getenv('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

def validate_email(email):
    """Validate email format"""
    pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain lowercase letters"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain uppercase letters"
    if not re.search(r'[0-9]', password):
        return False, "Password must contain numbers"
    return True, ""

def generate_token(user_id):
    """Generate JWT token"""
    payload = {
        'user_id': str(user_id),
        'exp': datetime.utcnow() + timedelta(days=7),
        'iat': datetime.utcnow()
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """
    Register a new user
    Request: { email, password, full_name, role, advocate_type }
    Response: { message, user_id, token, user }
    
    Roles: 'user', 'advocate', 'brand_advocate', 'admin'
    Statuses: 'pending', 'approved', 'rejected'
    """
    try:
        data = request.get_json()
        
        # Validate input
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email', '').strip()
        password = data.get('password', '')
        full_name = data.get('full_name', '').strip()
        role = data.get('role', 'user').lower()  # Default to 'user'
        advocate_type = data.get('advocate_type')  # 'project_advocate' or 'brand_advocate'
        
        if not email or not password or not full_name:
            return jsonify({'error': 'Email, password, and full name are required'}), 400
        
        # Validate email format
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate password strength
        is_valid, message = validate_password(password)
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # Validate role
        valid_roles = ['user', 'advocate', 'brand_advocate', 'admin']
        if role not in valid_roles:
            return jsonify({'error': f'Invalid role. Must be one of: {", ".join(valid_roles)}'}), 400
        
        # If advocate role, validate advocate type
        if role in ['advocate', 'brand_advocate'] and advocate_type:
            if advocate_type not in ['project_advocate', 'brand_advocate']:
                return jsonify({'error': 'Invalid advocate type'}), 400
        
        # Check if email already exists
        existing_user = users_collection.find_one({'email': email.lower()})
        if existing_user:
            return jsonify({'error': 'Email already registered'}), 409
        
        # Determine initial status based on role
        # Admins require manual creation (status won't be set here)
        # Advocates and brand_advocates default to 'pending' (waiting for admin approval)
        # Regular users are auto-approved
        if role == 'admin':
            initial_status = 'pending'  # Admin creation must be manual
        elif role in ['advocate', 'brand_advocate']:
            initial_status = 'pending'  # Requires admin approval
        else:
            initial_status = 'approved'  # Regular users auto-approved
        
        # Create new user
        user = {
            'email': email.lower(),
            'full_name': full_name,
            'password': generate_password_hash(password),
            'role': role,
            'status': initial_status,
            'advocate_type': advocate_type,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'approved_at': datetime.utcnow() if initial_status == 'approved' else None,
            'approved_by': None,
            'is_active': True
        }
        
        result = users_collection.insert_one(user)
        user_id = result.inserted_id
        
        # Generate token only if approved
        token = generate_token(user_id) if initial_status == 'approved' else None
        
        # Return user data (without password)
        user_data = {
            'user_id': str(user_id),
            'email': user['email'],
            'full_name': user['full_name'],
            'role': user['role'],
            'status': user['status'],
            'advocate_type': user['advocate_type']
        }
        
        status_code = 201
        response = {
            'message': 'User registered successfully',
            'user_id': str(user_id),
            'user': user_data
        }
        
        if initial_status == 'pending':
            response['message'] = 'Registration submitted. Please wait for admin approval.'
        else:
            response['token'] = token
        
        return jsonify(response), status_code
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login user and return JWT token
    Request: { email, password }
    Response: { message, token, user, status }
    
    Handles different user statuses:
    - 'approved': Normal login with token
    - 'pending': Show waiting message, no token
    - 'rejected': Deny access
    """
    try:
        data = request.get_json()
        
        # Validate input
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find user by email
        user = users_collection.find_one({'email': email.lower()})
        
        if not user or not check_password_hash(user['password'], password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        if not user.get('is_active', True):
            return jsonify({'error': 'Account is inactive'}), 403
        
        # Check user status
        status = user.get('status', 'approved')
        
        if status == 'rejected':
            return jsonify({
                'message': 'Your registration has been rejected',
                'status': 'rejected',
                'user': {
                    'user_id': str(user['_id']),
                    'email': user['email'],
                    'full_name': user['full_name'],
                    'status': status
                }
            }), 403
        
        if status == 'pending':
            return jsonify({
                'message': 'Your registration is pending admin approval',
                'status': 'pending',
                'user': {
                    'user_id': str(user['_id']),
                    'email': user['email'],
                    'full_name': user['full_name'],
                    'status': status,
                    'role': user.get('role', 'user'),
                    'created_at': user.get('created_at').isoformat() if user.get('created_at') else None
                }
            }), 202  # 202 Accepted - waiting for approval
        
        # User is approved, generate token
        token = generate_token(user['_id'])
        
        # Return user data (without password)
        user_data = {
            'user_id': str(user['_id']),
            'email': user['email'],
            'full_name': user['full_name'],
            'role': user.get('role', 'user'),
            'status': status,
            'advocate_type': user.get('advocate_type'),
            'created_at': user.get('created_at').isoformat() if user.get('created_at') else None
        }
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': user_data,
            'status': 'approved'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """
    Logout user (invalidate token if applicable)
    Response: { message }
    """
    # In a stateless JWT system, logout is typically handled on the client
    # by removing the token. This endpoint can be used for logging logout events.
    try:
        return jsonify({'message': 'Logout successful'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
