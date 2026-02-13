from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from datetime import datetime
import uuid
from app import mongo

advocate_bp = Blueprint('advocate', __name__, url_prefix='/api/advocates')

@advocate_bp.route('/register', methods=['POST'])
def register_advocate():
    try:
        data = request.get_json()
        
        if not data.get('user_id') or not data.get('advocate_type'):
            return {'error': 'Missing required fields'}, 400
        
        advocate = {
            'user_id': data['user_id'],
            'advocate_type': data['advocate_type'],
            'primary_project_id': data.get('primary_project_id'),
            'eligibility_verified': False,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = mongo.db.advocates.insert_one(advocate)
        
        return {
            'message': 'Advocate registered successfully',
            'advocate_id': str(result.inserted_id)
        }, 201
    except Exception as e:
        return {'error': str(e)}, 500

@advocate_bp.route('/<advocate_id>', methods=['GET'])
def get_advocate(advocate_id):
    try:
        advocate = mongo.db.advocates.find_one({'_id': ObjectId(advocate_id)})
        
        if not advocate:
            return {'error': 'Advocate not found'}, 404
        
        advocate['_id'] = str(advocate['_id'])
        return advocate, 200
    except Exception as e:
        return {'error': str(e)}, 500

@advocate_bp.route('/<advocate_id>', methods=['PUT'])
def update_advocate(advocate_id):
    try:
        data = request.get_json()
        
        mongo.db.advocates.update_one(
            {'_id': ObjectId(advocate_id)},
            {'$set': {**data, 'updated_at': datetime.utcnow()}}
        )
        
        return {'message': 'Advocate updated successfully'}, 200
    except Exception as e:
        return {'error': str(e)}, 500

@advocate_bp.route('', methods=['GET'])
def list_advocates():
    try:
        advocates = list(mongo.db.advocates.find().limit(50))
        for advocate in advocates:
            advocate['_id'] = str(advocate['_id'])
        
        return {'advocates': advocates}, 200
    except Exception as e:
        return {'error': str(e)}, 500
