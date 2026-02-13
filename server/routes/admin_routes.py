from flask import Blueprint, request, jsonify
from app import mongo

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/analytics/overview', methods=['GET'])
def analytics_overview():
    try:
        total_advocates = mongo.db.advocates.count_documents({})
        total_referrals = mongo.db.referrals.count_documents({})
        converted_referrals = mongo.db.referrals.count_documents({'status': 'converted'})
        total_rewards = mongo.db.rewards.aggregate([
            {'$group': {'_id': None, 'total': {'$sum': '$reward_amount'}}}
        ])
        
        total_rewards_amount = list(total_rewards)[0]['total'] if list(total_rewards) else 0
        
        return {
            'total_advocates': total_advocates,
            'total_referrals': total_referrals,
            'converted_referrals': converted_referrals,
            'conversion_rate': (converted_referrals / total_referrals * 100) if total_referrals > 0 else 0,
            'total_rewards_paid': total_rewards_amount
        }, 200
    except Exception as e:
        return {'error': str(e)}, 500

@admin_bp.route('/advocates', methods=['GET'])
def list_all_advocates():
    try:
        advocates = list(mongo.db.advocates.find().limit(100))
        for advocate in advocates:
            advocate['_id'] = str(advocate['_id'])
        
        return {'advocates': advocates, 'count': len(advocates)}, 200
    except Exception as e:
        return {'error': str(e)}, 500

@admin_bp.route('/referrals', methods=['GET'])
def list_all_referrals():
    try:
        referrals = list(mongo.db.referrals.find().limit(100))
        for referral in referrals:
            referral['_id'] = str(referral['_id'])
        
        return {'referrals': referrals, 'count': len(referrals)}, 200
    except Exception as e:
        return {'error': str(e)}, 500
