from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from datetime import datetime
import uuid
from app import mongo

referral_bp = Blueprint('referral', __name__, url_prefix='/api/referrals')

@referral_bp.route('/generate-link', methods=['POST'])
def generate_referral_link():
    try:
        data = request.get_json()
        
        if not data.get('advocate_id') or not data.get('project_id'):
            return {'error': 'Missing required fields'}, 400
        
        referral_code = str(uuid.uuid4())
        
        referral = {
            'advocate_id': data['advocate_id'],
            'project_id': data['project_id'],
            'referral_code': referral_code,
            'first_touch_timestamp': datetime.utcnow(),
            'last_touch_timestamp': datetime.utcnow(),
            'status': 'pending',
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = mongo.db.referrals.insert_one(referral)
        
        return {
            'message': 'Referral link generated',
            'referral_id': str(result.inserted_id),
            'referral_code': referral_code,
            'referral_link': f"https://builtcred.com/ref/{referral_code}"
        }, 201
    except Exception as e:
        return {'error': str(e)}, 500

@referral_bp.route('/<referral_id>', methods=['GET'])
def get_referral(referral_id):
    try:
        referral = mongo.db.referrals.find_one({'_id': ObjectId(referral_id)})
        
        if not referral:
            return {'error': 'Referral not found'}, 404
        
        referral['_id'] = str(referral['_id'])
        return referral, 200
    except Exception as e:
        return {'error': str(e)}, 500

@referral_bp.route('', methods=['GET'])
def list_referrals():
    try:
        advocate_id = request.args.get('advocate_id')
        query = {'advocate_id': advocate_id} if advocate_id else {}
        
        referrals = list(mongo.db.referrals.find(query).limit(50))
        for referral in referrals:
            referral['_id'] = str(referral['_id'])
        
        return {'referrals': referrals}, 200
    except Exception as e:
        return {'error': str(e)}, 500

@referral_bp.route('/<referral_id>/status', methods=['PUT'])
def update_referral_status(referral_id):
    try:
        data = request.get_json()
        
        mongo.db.referrals.update_one(
            {'_id': ObjectId(referral_id)},
            {'$set': {'status': data.get('status'), 'updated_at': datetime.utcnow()}}
        )
        
        return {'message': 'Referral status updated'}, 200
    except Exception as e:
        return {'error': str(e)}, 500
