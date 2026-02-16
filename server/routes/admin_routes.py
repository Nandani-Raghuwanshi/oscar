"""
Task: Implement admin management routes
- GET /admin/analytics - Get system analytics
- GET /admin/advocates - List all advocates with filters
- GET /admin/referrals - Get all referrals with analytics
- POST /admin/validation/override - Override auto-correction
- GET /admin/pending-users - List pending user registrations
- POST /admin/users/approve - Approve user registration
- POST /admin/users/reject - Reject user registration
- GET /admin/users - List all users with filters

Expected functionality:
- System overview statistics
- Advocate filtering by type and status
- Referral pipeline analytics
- Cross-project reporting
- User validation and approval
- Rejection with reason
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
from bson.objectid import ObjectId
from pymongo import MongoClient
import os
from middleware.auth_middleware import admin_required

# MongoDB Connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
client = MongoClient(MONGO_URI)
db = client.get_database('builtcred')
users_collection = db['users']
referrals_collection = db['referrals']
advocates_collection = db['advocates']

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/pending-users', methods=['GET'])
@admin_required
def get_pending_users():
    """
    List all pending user registrations (awaiting admin approval)
    Query params: { skip, limit, role, sort_by }
    Response: { users: [...], total, timestamp }
    """
    try:
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 20))
        role_filter = request.args.get('role')
        sort_by = request.args.get('sort_by', 'created_at')  # created_at, full_name
        
        # Build query
        query = {'status': 'pending'}
        if role_filter:
            query['role'] = role_filter
        
        # Get total count
        total = users_collection.count_documents(query)
        
        # Determine sort order (newest first by default)
        sort_order = -1 if sort_by == 'created_at' else 1
        
        # Get pending users
        pending_users = list(users_collection.find(query)
            .sort(sort_by, sort_order)
            .skip(skip)
            .limit(limit)
        )
        
        # Format response (exclude password)
        users_data = []
        for user in pending_users:
            users_data.append({
                'user_id': str(user['_id']),
                'email': user['email'],
                'full_name': user['full_name'],
                'role': user.get('role', 'user'),
                'advocate_type': user.get('advocate_type'),
                'status': user.get('status'),
                'created_at': user.get('created_at').isoformat() if user.get('created_at') else None,
                'is_active': user.get('is_active', True)
            })
        
        return jsonify({
            'users': users_data,
            'total': total,
            'skip': skip,
            'limit': limit,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users', methods=['GET'])
@admin_required
def list_all_users():
    """
    List all users with filtering and pagination
    Query params: { skip, limit, role, status, is_active, search }
    Response: { users: [...], total }
    """
    try:
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 20))
        role_filter = request.args.get('role')
        status_filter = request.args.get('status')
        is_active_filter = request.args.get('is_active')
        search = request.args.get('search', '').strip()
        
        # Build query
        query = {}
        
        if role_filter:
            query['role'] = role_filter
        
        if status_filter:
            query['status'] = status_filter
        
        if is_active_filter:
            query['is_active'] = is_active_filter.lower() == 'true'
        
        # Search by email or full name
        if search:
            query['$or'] = [
                {'email': {'$regex': search, '$options': 'i'}},
                {'full_name': {'$regex': search, '$options': 'i'}}
            ]
        
        # Get total count
        total = users_collection.count_documents(query)
        
        # Get users
        all_users = list(users_collection.find(query)
            .sort('created_at', -1)
            .skip(skip)
            .limit(limit)
        )
        
        # Format response (exclude password)
        users_data = []
        for user in all_users:
            users_data.append({
                'user_id': str(user['_id']),
                'email': user['email'],
                'full_name': user['full_name'],
                'role': user.get('role', 'user'),
                'status': user.get('status', 'approved'),
                'advocate_type': user.get('advocate_type'),
                'is_active': user.get('is_active', True),
                'created_at': user.get('created_at').isoformat() if user.get('created_at') else None,
                'approved_at': user.get('approved_at').isoformat() if user.get('approved_at') else None,
                'approved_by': user.get('approved_by')
            })
        
        return jsonify({
            'users': users_data,
            'total': total,
            'skip': skip,
            'limit': limit
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<user_id>/approve', methods=['POST'])
@admin_required
def approve_user(user_id):
    """
    Approve a pending user registration
    Request: { reason (optional) }
    Response: { message, user }
    """
    try:
        try:
            user_obj_id = ObjectId(user_id)
        except:
            return jsonify({'error': 'Invalid user ID format'}), 400
        
        user = users_collection.find_one({'_id': user_obj_id})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if user.get('status') != 'pending':
            return jsonify({
                'error': f'User is already {user.get("status")}',
                'current_status': user.get('status')
            }), 400
        
        # Update user status
        admin_id = str(request.current_user['_id'])
        
        users_collection.update_one(
            {'_id': user_obj_id},
            {
                '$set': {
                    'status': 'approved',
                    'approved_at': datetime.utcnow(),
                    'approved_by': admin_id,
                    'updated_at': datetime.utcnow()
                }
            }
        )
        
        # Get updated user
        updated_user = users_collection.find_one({'_id': user_obj_id})
        
        return jsonify({
            'message': f'{updated_user["full_name"]} has been approved successfully',
            'user': {
                'user_id': str(updated_user['_id']),
                'email': updated_user['email'],
                'full_name': updated_user['full_name'],
                'role': updated_user.get('role', 'user'),
                'status': updated_user.get('status'),
                'approved_at': updated_user.get('approved_at').isoformat() if updated_user.get('approved_at') else None
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<user_id>/reject', methods=['POST'])
@admin_required
def reject_user(user_id):
    """
    Reject a pending user registration
    Request: { reason }
    Response: { message, user }
    """
    try:
        try:
            user_obj_id = ObjectId(user_id)
        except:
            return jsonify({'error': 'Invalid user ID format'}), 400
        
        data = request.get_json()
        reason = data.get('reason', 'No reason provided').strip() if data else 'No reason provided'
        
        if not reason or len(reason) < 5:
            return jsonify({'error': 'Please provide a valid reason (at least 5 characters)'}), 400
        
        user = users_collection.find_one({'_id': user_obj_id})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if user.get('status') != 'pending':
            return jsonify({
                'error': f'User is already {user.get("status")}',
                'current_status': user.get('status')
            }), 400
        
        # Update user status
        admin_id = str(request.current_user['_id'])
        
        users_collection.update_one(
            {'_id': user_obj_id},
            {
                '$set': {
                    'status': 'rejected',
                    'rejection_reason': reason,
                    'rejected_at': datetime.utcnow(),
                    'rejected_by': admin_id,
                    'updated_at': datetime.utcnow()
                }
            }
        )
        
        # Get updated user
        updated_user = users_collection.find_one({'_id': user_obj_id})
        
        return jsonify({
            'message': f'{updated_user["full_name"]} registration has been rejected',
            'user': {
                'user_id': str(updated_user['_id']),
                'email': updated_user['email'],
                'full_name': updated_user['full_name'],
                'role': updated_user.get('role', 'user'),
                'status': updated_user.get('status'),
                'rejection_reason': updated_user.get('rejection_reason'),
                'rejected_at': updated_user.get('rejected_at').isoformat() if updated_user.get('rejected_at') else None
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<user_id>/reactivate', methods=['POST'])
@admin_required
def reactivate_user(user_id):
    """
    Reactivate a rejected user (allows them to register again)
    Response: { message, user }
    """
    try:
        try:
            user_obj_id = ObjectId(user_id)
        except:
            return jsonify({'error': 'Invalid user ID format'}), 400
        
        user = users_collection.find_one({'_id': user_obj_id})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if user.get('status') != 'rejected':
            return jsonify({
                'error': f'Only rejected users can be reactivated. Current status: {user.get("status")}',
                'current_status': user.get('status')
            }), 400
        
        # Update user status back to pending
        admin_id = str(request.current_user['_id'])
        
        users_collection.update_one(
            {'_id': user_obj_id},
            {
                '$set': {
                    'status': 'pending',
                    'rejection_reason': None,
                    'rejected_at': None,
                    'rejected_by': None,
                    'updated_at': datetime.utcnow(),
                    'reactivated_by': admin_id,
                    'reactivated_at': datetime.utcnow()
                }
            }
        )
        
        # Get updated user
        updated_user = users_collection.find_one({'_id': user_obj_id})
        
        return jsonify({
            'message': f'{updated_user["full_name"]} has been reactivated and is pending approval again',
            'user': {
                'user_id': str(updated_user['_id']),
                'email': updated_user['email'],
                'full_name': updated_user['full_name'],
                'role': updated_user.get('role', 'user'),
                'status': updated_user.get('status')
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/analytics', methods=['GET'])
@admin_required
def get_analytics():
    """
    Get system analytics and overview
    Response: { total_users, total_advocates, pending_approvals, active_users, stats }
    """
    try:
        total_users = users_collection.count_documents({})
        approved_users = users_collection.count_documents({'status': 'approved'})
        pending_users = users_collection.count_documents({'status': 'pending'})
        rejected_users = users_collection.count_documents({'status': 'rejected'})
        
        total_advocates = users_collection.count_documents({'role': {'$in': ['advocate', 'brand_advocate']}})
        
        total_referrals = referrals_collection.count_documents({})
        
        return jsonify({
            'total_users': total_users,
            'approved_users': approved_users,
            'pending_users': pending_users,
            'rejected_users': rejected_users,
            'total_advocates': total_advocates,
            'total_referrals': total_referrals,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/advocates', methods=['GET'])
@admin_required
def list_all_advocates():
    """
    List all advocates with filtering
    Query params: { advocate_type, status, skip, limit }
    Response: { advocates: [...], total }
    """
    # Implementation goes here
    try:
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 20))
        advocate_type = request.args.get('advocate_type')
        status_filter = request.args.get('status')
        
        query = {'role': {'$in': ['advocate', 'brand_advocate']}}
        
        if advocate_type:
            query['advocate_type'] = advocate_type
        
        if status_filter:
            query['status'] = status_filter
        
        total = users_collection.count_documents(query)
        
        advocates = list(users_collection.find(query)
            .sort('created_at', -1)
            .skip(skip)
            .limit(limit)
        )
        
        advocates_data = []
        for advocate in advocates:
            advocates_data.append({
                'user_id': str(advocate['_id']),
                'email': advocate['email'],
                'full_name': advocate['full_name'],
                'advocate_type': advocate.get('advocate_type'),
                'status': advocate.get('status'),
                'created_at': advocate.get('created_at').isoformat() if advocate.get('created_at') else None
            })
        
        return jsonify({
            'advocates': advocates_data,
            'total': total
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/referrals', methods=['GET'])
@admin_required
def get_all_referrals():
    """
    Get all referrals with analytics
    Query params: { advocate_type, project_id, status, skip, limit }
    Response: { referrals: [...], total, analytics }
    """
    # Implementation goes here
    pass

@admin_bp.route('/advocates/import', methods=['POST'])
def import_advocates():
    """
    Bulk import advocates from CSV
    Request: { file or data }
    Response: { message, imported_count, errors }
    """
    # Implementation goes here
    pass

@admin_bp.route('/validation/override', methods=['POST'])
def override_validation():
    """
    Override auto-correction for advocate type validation
    Request: { advocate_id, new_type, reason }
    Response: { message, updated_advocate }
    """
    # Implementation goes here
    pass
