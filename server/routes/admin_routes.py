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
    Get comprehensive system analytics and overview
    Response: Complete dashboard metrics with advocate types and pipeline analytics
    """
    try:
        # User Statistics
        total_users = users_collection.count_documents({})
        approved_users = users_collection.count_documents({'status': 'approved'})
        pending_users = users_collection.count_documents({'status': 'pending'})
        rejected_users = users_collection.count_documents({'status': 'rejected'})
        
        # Advocate Statistics
        total_advocates = users_collection.count_documents({'role': {'$in': ['advocate', 'brand_advocate']}})
        project_advocates = users_collection.count_documents({'advocate_type': 'PROJECT_ADVOCATE'})
        brand_advocates = users_collection.count_documents({'advocate_type': 'BRAND_ADVOCATE'})
        
        # Referral Statistics
        total_referrals = referrals_collection.count_documents({})
        active_referrals = referrals_collection.count_documents({'status': {'$in': ['NEW_LEAD', 'SITE_VISIT', 'IN_PROGRESS']}})
        
        # Pipeline stages for Project Advocates
        project_new_leads = referrals_collection.count_documents({
            'advocate_type': 'PROJECT_ADVOCATE',
            'status': 'NEW_LEAD'
        })
        project_in_progress = referrals_collection.count_documents({
            'advocate_type': 'PROJECT_ADVOCATE',
            'status': {'$in': ['SITE_VISIT', 'IN_PROGRESS']}
        })
        project_converted = referrals_collection.count_documents({
            'advocate_type': 'PROJECT_ADVOCATE',
            'status': 'CONVERTED'
        })
        
        # Pipeline stages for Brand Advocates
        brand_new_leads = referrals_collection.count_documents({
            'advocate_type': 'BRAND_ADVOCATE',
            'status': 'NEW_LEAD'
        })
        brand_in_progress = referrals_collection.count_documents({
            'advocate_type': 'BRAND_ADVOCATE',
            'status': {'$in': ['SITE_VISIT', 'IN_PROGRESS']}
        })
        brand_converted = referrals_collection.count_documents({
            'advocate_type': 'BRAND_ADVOCATE',
            'status': 'CONVERTED'
        })
        
        # Conversion analytics
        total_converted = project_converted + brand_converted
        conversions_mtd = referrals_collection.count_documents({
            'status': 'CONVERTED',
            'converted_at': {
                '$gte': datetime(datetime.utcnow().year, datetime.utcnow().month, 1)
            }
        })
        
        conversion_rate = int((total_converted / total_referrals) * 100) if total_referrals > 0 else 0
        project_conversion_rate = int((project_converted / (project_new_leads + project_in_progress + project_converted)) * 100) if (project_new_leads + project_in_progress + project_converted) > 0 else 0
        brand_conversion_rate = int((brand_converted / (brand_new_leads + brand_in_progress + brand_converted)) * 100) if (brand_new_leads + brand_in_progress + brand_converted) > 0 else 0
        
        # Rewards Statistics
        rewards_collection = db['rewards']
        total_rewards = rewards_collection.count_documents({})
        rewards_paid = 0
        paid_rewards = list(rewards_collection.find({'status': 'PAID'}))
        for reward in paid_rewards:
            rewards_paid += reward.get('amount', 0)
        
        # Average referrals per advocate
        project_avg_referrals = 0
        brand_avg_referrals = 0
        
        if project_advocates > 0:
            project_referrals = referrals_collection.count_documents({'advocate_type': 'PROJECT_ADVOCATE'})
            project_avg_referrals = round(project_referrals / project_advocates, 2)
        
        if brand_advocates > 0:
            brand_referrals = referrals_collection.count_documents({'advocate_type': 'BRAND_ADVOCATE'})
            brand_avg_referrals = round(brand_referrals / brand_advocates, 2)
        
        return jsonify({
            'total_users': total_users,
            'approved_users': approved_users,
            'pending_users': pending_users,
            'rejected_users': rejected_users,
            'total_advocates': total_advocates,
            'project_advocates': project_advocates,
            'brand_advocates': brand_advocates,
            'total_referrals': total_referrals,
            'active_referrals': active_referrals,
            'conversions_mtd': conversions_mtd,
            'conversion_rate': conversion_rate,
            'rewards_paid': rewards_paid,
            'project_advocates_new_leads': project_new_leads,
            'project_advocates_in_progress': project_in_progress,
            'project_advocates_converted': project_converted,
            'project_advocates_conversion': project_conversion_rate,
            'project_advocates_avg_referrals': project_avg_referrals,
            'brand_advocates_new_leads': brand_new_leads,
            'brand_advocates_in_progress': brand_in_progress,
            'brand_advocates_converted': brand_converted,
            'brand_advocates_conversion': brand_conversion_rate,
            'brand_advocates_avg_referrals': brand_avg_referrals,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/advocates', methods=['GET'])
@admin_required
def list_all_advocates():
    """
    List all advocates with detailed analytics and filtering
    Query params: { advocate_type, status, skip, limit, search }
    Response: { advocates: [...], total }
    """
    try:
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 20))
        advocate_type = request.args.get('advocate_type')
        status_filter = request.args.get('status')
        search = request.args.get('search', '').strip()
        
        # Build query
        query = {'role': {'$in': ['advocate', 'brand_advocate']}}
        
        if advocate_type:
            query['advocate_type'] = advocate_type
        
        if status_filter:
            query['status'] = status_filter
        
        # Search functionality - only add if search term provided
        if search:
            print(f'Applying search filter for: {search}')
            search_or = [
                {'full_name': {'$regex': search, '$options': 'i'}},
                {'email': {'$regex': search, '$options': 'i'}},
                {'phone': {'$regex': search, '$options': 'i'}},
                {'project_name': {'$regex': search, '$options': 'i'}}
            ]
            # If there are other filters, use $and to combine them with $or
            if advocate_type or status_filter:
                query = {'$and': [query, {'$or': search_or}]}
            else:
                query['$or'] = search_or
        
        # Get total count
        total = users_collection.count_documents(query)
        
        # Get advocates with pagination
        advocates = list(users_collection.find(query)
            .sort('created_at', -1)
            .skip(skip)
            .limit(limit)
        )
        
        # Fetch advocates collection for details
        rewards_collection = db['rewards']
        
        advocates_data = []
        for advocate in advocates:
            advocate_id = str(advocate['_id'])
            
            # Get referral count
            referral_count = referrals_collection.count_documents({'advocate_id': advocate_id})
            
            # Get conversion count
            conversion_count = referrals_collection.count_documents({
                'advocate_id': advocate_id,
                'status': 'CONVERTED'
            })
            
            # Get total rewards
            rewards_data = list(rewards_collection.find({'advocate_id': advocate_id}))
            total_rewards = sum(r.get('amount', 0) for r in rewards_data)
            
            advocates_data.append({
                'id': advocate_id,
                'name': advocate.get('full_name', 'N/A'),
                'email': advocate.get('email'),
                'phone': advocate.get('phone'),
                'advocate_type': advocate.get('advocate_type', 'UNKNOWN'),
                'project_name': advocate.get('project_name', 'Oscar Sanctuary'),
                'plot_number': advocate.get('plot_number'),
                'status': advocate.get('status', 'active'),
                'referral_count': referral_count,
                'conversion_count': conversion_count,
                'total_rewards': total_rewards,
                'created_at': advocate.get('created_at').isoformat() if advocate.get('created_at') else None
            })
        
        return jsonify({
            'advocates': advocates_data,
            'total': total,
            'skip': skip,
            'limit': limit
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/referrals', methods=['GET'])
@admin_required
def get_all_referrals():
    """
    Get all referrals with filtering and analytics
    Query params: { advocate_type, status, project_id, skip, limit }
    Response: { referrals: [...], total, analytics }
    """
    try:
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 20))
        advocate_type = request.args.get('advocate_type')
        status_filter = request.args.get('status')
        project_id = request.args.get('project_id')
        
        # Build query
        query = {}
        
        if advocate_type:
            query['advocate_type'] = advocate_type
        
        if status_filter:
            query['status'] = status_filter
        
        if project_id:
            query['project_id'] = project_id
        
        # Get total count
        total = referrals_collection.count_documents(query)
        
        # Get referrals
        referrals = list(referrals_collection.find(query)
            .sort('created_at', -1)
            .skip(skip)
            .limit(limit)
        )
        
        # Format referrals data
        referrals_data = []
        for referral in referrals:
            referrals_data.append({
                'referral_id': str(referral.get('_id', '')),
                'advocate_id': referral.get('advocate_id'),
                'referrer_name': referral.get('referrer_name', 'N/A'),
                'advocate_type': referral.get('advocate_type'),
                'source_project': referral.get('source_project', 'Oscar Sanctuary'),
                'target_project': referral.get('target_project', 'Oscar Sanctuary'),
                'lead_name': referral.get('lead_name'),
                'lead_email': referral.get('lead_email'),
                'lead_phone': referral.get('lead_phone'),
                'status': referral.get('status', 'NEW_LEAD'),
                'created_at': referral.get('created_at').isoformat() if referral.get('created_at') else None,
                'converted_at': referral.get('converted_at').isoformat() if referral.get('converted_at') else None
            })
        
        # Calculate analytics
        total_new_leads = referrals_collection.count_documents({'status': 'NEW_LEAD'})
        total_in_progress = referrals_collection.count_documents({'status': {'$in': ['SITE_VISIT', 'IN_PROGRESS']}})
        total_converted = referrals_collection.count_documents({'status': 'CONVERTED'})
        
        return jsonify({
            'referrals': referrals_data,
            'total': total,
            'skip': skip,
            'limit': limit,
            'analytics': {
                'total_new_leads': total_new_leads,
                'total_in_progress': total_in_progress,
                'total_converted': total_converted,
                'conversion_rate': int((total_converted / total) * 100) if total > 0 else 0
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/advocates/import', methods=['POST'])
def import_advocates():
    """
    Bulk import advocates from CSV
    Request: { file or data }
    Response: { message, imported_count, errors }
    """
    try:
        data = request.get_json()
        advocates_to_import = data.get('advocates', [])
        
        if not advocates_to_import:
            return jsonify({'error': 'No advocates data provided'}), 400
        
        imported_count = 0
        errors = []
        
        for idx, advocate_data in enumerate(advocates_to_import):
            try:
                # Validate required fields
                if not advocate_data.get('email') or not advocate_data.get('full_name'):
                    errors.append(f"Row {idx + 1}: Missing email or full_name")
                    continue
                
                # Check if user already exists
                existing = users_collection.find_one({'email': advocate_data.get('email')})
                
                if not existing:
                    # Create new advocate user
                    users_collection.insert_one({
                        'email': advocate_data.get('email'),
                        'full_name': advocate_data.get('full_name'),
                        'phone': advocate_data.get('phone'),
                        'role': 'advocate',
                        'advocate_type': advocate_data.get('advocate_type', 'PROJECT_ADVOCATE'),
                        'project_name': advocate_data.get('project_name', 'Oscar Sanctuary'),
                        'plot_number': advocate_data.get('plot_number'),
                        'status': 'approved',
                        'is_active': True,
                        'created_at': datetime.utcnow(),
                        'approved_at': datetime.utcnow()
                    })
                    imported_count += 1
                else:
                    # Update existing user if needed
                    users_collection.update_one(
                        {'email': advocate_data.get('email')},
                        {'$set': {
                            'advocate_type': advocate_data.get('advocate_type', existing.get('advocate_type')),
                            'project_name': advocate_data.get('project_name', existing.get('project_name')),
                            'plot_number': advocate_data.get('plot_number', existing.get('plot_number')),
                            'phone': advocate_data.get('phone', existing.get('phone'))
                        }}
                    )
                    imported_count += 1
            except Exception as e:
                errors.append(f"Row {idx + 1}: {str(e)}")
        
        return jsonify({
            'message': f'Successfully imported {imported_count} advocates',
            'imported_count': imported_count,
            'errors': errors if errors else None
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/validation/override', methods=['POST'])
@admin_required
def override_validation():
    """
    Override auto-correction for advocate type validation
    Request: { advocate_id, new_type, reason }
    Response: { message, updated_advocate }
    """
    try:
        data = request.get_json()
        advocate_id = data.get('advocate_id')
        new_type = data.get('new_type')
        reason = data.get('reason', 'Manual override')
        
        if not advocate_id or not new_type:
            return jsonify({'error': 'advocate_id and new_type are required'}), 400
        
        try:
            advocate_obj_id = ObjectId(advocate_id)
        except:
            return jsonify({'error': 'Invalid advocate ID format'}), 400
        
        # Update advocate type
        admin_id = str(request.current_user['_id'])
        
        users_collection.update_one(
            {'_id': advocate_obj_id},
            {
                '$set': {
                    'advocate_type': new_type,
                    'type_override': True,
                    'override_reason': reason,
                    'overridden_at': datetime.utcnow(),
                    'overridden_by': admin_id
                }
            }
        )
        
        # Get updated advocate
        updated_advocate = users_collection.find_one({'_id': advocate_obj_id})
        
        return jsonify({
            'message': f'Advocate type updated to {new_type}',
            'advocate': {
                'advocate_id': str(updated_advocate['_id']),
                'full_name': updated_advocate.get('full_name'),
                'advocate_type': updated_advocate.get('advocate_type'),
                'type_override': updated_advocate.get('type_override'),
                'override_reason': updated_advocate.get('override_reason')
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/advocates/<advocate_id>/details', methods=['GET'])
@admin_required
def get_advocate_details(advocate_id):
    """
    Get detailed information about a specific advocate
    Response: { advocate details, statistics, history }
    """
    try:
        try:
            advocate_obj_id = ObjectId(advocate_id)
        except:
            return jsonify({'error': 'Invalid advocate ID format'}), 400
        
        advocate = users_collection.find_one({'_id': advocate_obj_id})
        
        if not advocate:
            return jsonify({'error': 'Advocate not found'}), 404
        
        advocate_id_str = str(advocate['_id'])
        
        # Get referral statistics
        referral_count = referrals_collection.count_documents({'advocate_id': advocate_id_str})
        conversion_count = referrals_collection.count_documents({
            'advocate_id': advocate_id_str,
            'status': 'CONVERTED'
        })
        
        # Get rewards
        rewards_collection = db['rewards']
        rewards_data = list(rewards_collection.find({'advocate_id': advocate_id_str}))
        total_rewards = sum(r.get('amount', 0) for r in rewards_data)
        paid_rewards = sum(r.get('amount', 0) for r in rewards_data if r.get('status') == 'PAID')
        pending_rewards = total_rewards - paid_rewards
        
        # Get recent referrals
        recent_referrals = list(referrals_collection.find({'advocate_id': advocate_id_str})
            .sort('created_at', -1)
            .limit(10)
        )
        
        return jsonify({
            'advocate': {
                'id': advocate_id_str,
                'name': advocate.get('full_name'),
                'email': advocate.get('email'),
                'phone': advocate.get('phone'),
                'advocate_type': advocate.get('advocate_type'),
                'project_name': advocate.get('project_name'),
                'plot_number': advocate.get('plot_number'),
                'status': advocate.get('status'),
                'created_at': advocate.get('created_at').isoformat() if advocate.get('created_at') else None
            },
            'statistics': {
                'total_referrals': referral_count,
                'total_conversions': conversion_count,
                'conversion_rate': int((conversion_count / referral_count) * 100) if referral_count > 0 else 0,
                'total_rewards': total_rewards,
                'paid_rewards': paid_rewards,
                'pending_rewards': pending_rewards
            },
            'recent_referrals': [
                {
                    'referral_id': str(ref.get('_id')),
                    'lead_name': ref.get('lead_name'),
                    'status': ref.get('status'),
                    'created_at': ref.get('created_at').isoformat() if ref.get('created_at') else None
                }
                for ref in recent_referrals
            ]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/rewards-analytics', methods=['GET'])
@admin_required
def get_rewards_analytics():
    """
    Get rewards analytics and distribution
    Query params: { skip, limit, status }
    Response: { rewards: [...], total, analytics }
    """
    try:
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 20))
        status_filter = request.args.get('status')
        
        rewards_collection = db['rewards']
        
        # Build query
        query = {}
        if status_filter:
            query['status'] = status_filter
        
        # Get total count
        total = rewards_collection.count_documents(query)
        
        # Get rewards
        rewards = list(rewards_collection.find(query)
            .sort('created_at', -1)
            .skip(skip)
            .limit(limit)
        )
        
        rewards_data = []
        total_amount = 0
        pending_amount = 0
        paid_amount = 0
        
        for reward in rewards:
            amount = reward.get('amount', 0)
            status = reward.get('status', 'PENDING')
            total_amount += amount
            
            if status == 'PENDING':
                pending_amount += amount
            elif status == 'PAID':
                paid_amount += amount
            
            # Get advocate info
            advocate = users_collection.find_one({'_id': ObjectId(reward.get('advocate_id'))}) if reward.get('advocate_id') else None
            
            rewards_data.append({
                'reward_id': str(reward.get('_id')),
                'advocate_name': advocate.get('full_name') if advocate else 'Unknown',
                'advocate_type': advocate.get('advocate_type') if advocate else 'Unknown',
                'amount': amount,
                'status': status,
                'referral_count': reward.get('referral_count', 0),
                'conversion_count': reward.get('conversion_count', 0),
                'created_at': reward.get('created_at').isoformat() if reward.get('created_at') else None,
                'paid_at': reward.get('paid_at').isoformat() if reward.get('paid_at') else None
            })
        
        return jsonify({
            'rewards': rewards_data,
            'total': total,
            'skip': skip,
            'limit': limit,
            'analytics': {
                'total_amount': total_amount,
                'paid_amount': paid_amount,
                'pending_amount': pending_amount
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/project-analytics', methods=['GET'])
@admin_required
def get_project_analytics():
    """
    Get project-wise analytics
    Response: { projects: [...], total_analytics }
    """
    try:
        projects_collection = db['projects']
        
        # Get all projects
        projects = list(projects_collection.find({}))
        
        projects_data = []
        
        for project in projects:
            project_id_str = str(project.get('_id'))
            
            # Get project advocates count
            project_advocates = users_collection.count_documents({
                'project_name': project.get('name'),
                'advocate_type': 'PROJECT_ADVOCATE'
            })
            
            # Get brand advocates from other projects
            brand_advocates = users_collection.count_documents({
                'project_name': project.get('name'),
                'advocate_type': 'BRAND_ADVOCATE'
            })
            
            # Get referrals for this project
            referrals_count = referrals_collection.count_documents({
                'target_project': project.get('name')
            })
            
            conversions = referrals_collection.count_documents({
                'target_project': project.get('name'),
                'status': 'CONVERTED'
            })
            
            conversion_rate = int((conversions / referrals_count) * 100) if referrals_count > 0 else 0
            
            projects_data.append({
                'project_id': project_id_str,
                'name': project.get('name'),
                'status': project.get('status', 'active'),
                'accepts_referrals': project.get('accepts_referrals', True),
                'project_advocates_count': project_advocates,
                'brand_advocates_count': brand_advocates,
                'total_referrals': referrals_count,
                'conversions': conversions,
                'conversion_rate': conversion_rate,
                'total_budget': project.get('total_budget', 0),
                'units': project.get('units', 0)
            })
        
        # Overall analytics
        total_advocates = users_collection.count_documents({'role': {'$in': ['advocate', 'brand_advocate']}})
        total_referrals = referrals_collection.count_documents({})
        total_conversions = referrals_collection.count_documents({'status': 'CONVERTED'})
        
        return jsonify({
            'projects': projects_data,
            'total_projects': len(projects_data),
            'total_analytics': {
                'total_advocates': total_advocates,
                'total_referrals': total_referrals,
                'total_conversions': total_conversions,
                'overall_conversion_rate': int((total_conversions / total_referrals) * 100) if total_referrals > 0 else 0
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
