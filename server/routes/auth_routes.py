from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from datetime import datetime
from app import mongo

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password') or not data.get('full_name'):
            return {'error': 'Missing required fields'}, 400
        
        existing_user = mongo.db.users.find_one({'email': data['email']})
        if existing_user:
            return {'error': 'User already exists'}, 409
        
        user = {
            'email': data['email'],
            'password': data['password'],
            'full_name': data['full_name'],
            'created_at': datetime.utcnow(),
            'verified': False
        }
        
        result = mongo.db.users.insert_one(user)
        
        return {
            'message': 'User registered successfully',
            'user_id': str(result.inserted_id)
        }, 201
    except Exception as e:
        return {'error': str(e)}, 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return {'error': 'Missing email or password'}, 400
        
        user = mongo.db.users.find_one({'email': data['email']})
        if not user or user['password'] != data['password']:
            return {'error': 'Invalid email or password'}, 401
        
        return {
            'message': 'Login successful',
            'user': {
                'id': str(user['_id']),
                'email': user['email'],
                'full_name': user['full_name']
            }
        }, 200
    except Exception as e:
        return {'error': str(e)}, 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    return {'message': 'Logout successful'}, 200

