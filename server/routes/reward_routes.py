from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from datetime import datetime
import uuid
from app import mongo

reward_bp = Blueprint('reward', __name__, url_prefix='/api/rewards')

REWARD_TIERS = {
    'tier1': {'min': 5000000, 'max': 10000000, 'amount': 25000},
    'tier2': {'min': 10000000, 'max': 15000000, 'amount': 35000},
    'tier3': {'min': 15000000, 'max': float('inf'), 'amount': 50000}
}

def calculate_reward(plot_value):
    for tier, config in REWARD_TIERS.items():
        if config['min'] <= plot_value < config['max']:
            return config['amount']
    return 0

@reward_bp.route('/create', methods=['POST'])
def create_reward():
    try:
        data = request.get_json()
        
        if not data.get('referral_id') or not data.get('plot_value'):
            return {'error': 'Missing required fields'}, 400
        
        reward_amount = calculate_reward(data['plot_value'])
        
        reward = {
            'referral_id': data['referral_id'],
            'advocate_id': data.get('advocate_id'),
            'plot_value': data['plot_value'],
            'reward_amount': reward_amount,
            'status': 'pending',
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = mongo.db.rewards.insert_one(reward)
        
        return {
            'message': 'Reward created',
            'reward_id': str(result.inserted_id),
            'reward_amount': reward_amount
        }, 201
    except Exception as e:
        return {'error': str(e)}, 500

@reward_bp.route('/<reward_id>', methods=['GET'])
def get_reward(reward_id):
    try:
        reward = mongo.db.rewards.find_one({'_id': ObjectId(reward_id)})
        
        if not reward:
            return {'error': 'Reward not found'}, 404
        
        reward['_id'] = str(reward['_id'])
        return reward, 200
    except Exception as e:
        return {'error': str(e)}, 500

@reward_bp.route('', methods=['GET'])
def list_rewards():
    try:
        advocate_id = request.args.get('advocate_id')
        query = {'advocate_id': advocate_id} if advocate_id else {}
        
        rewards = list(mongo.db.rewards.find(query).limit(50))
        for reward in rewards:
            reward['_id'] = str(reward['_id'])
        
        return {'rewards': rewards}, 200
    except Exception as e:
        return {'error': str(e)}, 500
