"""
Task: Implement project management routes
- GET /projects - List all projects
- GET /projects/:project_id - Get project details
- GET /projects/advocate/:advocate_id - Get advocate's projects

Expected functionality:
- List available projects with filtering
- Display project details (name, location, status, units)
- Return projects based on advocate type and eligibility
- Show referral statistics per project
"""

from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from pymongo import MongoClient
import os
from datetime import datetime

# MongoDB Connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
client = MongoClient(MONGO_URI)
db = client.get_database('builtcred')
projects_collection = db['projects']
users_collection = db['users']
referrals_collection = db['referrals']

project_bp = Blueprint('projects', __name__)

@project_bp.route('', methods=['GET'])
def get_projects():
    """
    Get list of all projects with optional filtering
    Query params: { status, search, skip, limit }
    Response: { projects: [...], total }
    """
    try:
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 20))
        status_filter = request.args.get('status')
        search = request.args.get('search', '').strip()
        
        # Build query
        query = {}
        
        if status_filter:
            query['status'] = status_filter
        
        if search:
            query['name'] = {'$regex': search, '$options': 'i'}
        
        # Get total count
        total = projects_collection.count_documents(query)
        
        # Get projects
        projects = list(projects_collection.find(query)
            .sort('created_at', -1)
            .skip(skip)
            .limit(limit)
        )
        
        projects_data = []
        for project in projects:
            project_id_str = str(project.get('_id'))
            
            # Get statistics for each project
            referrals_count = referrals_collection.count_documents({
                'target_project': project.get('name')
            })
            
            conversions = referrals_collection.count_documents({
                'target_project': project.get('name'),
                'status': 'CONVERTED'
            })
            
            # Get advocate counts
            project_advocates = users_collection.count_documents({
                'project_name': project.get('name'),
                'advocate_type': 'PROJECT_ADVOCATE'
            })
            
            brand_advocates = users_collection.count_documents({
                'project_name': project.get('name'),
                'advocate_type': 'BRAND_ADVOCATE'
            })
            
            projects_data.append({
                'id': project_id_str,
                'name': project.get('name'),
                'location': project.get('location'),
                'status': project.get('status', 'active'),
                'accepts_referrals': project.get('accepts_referrals', True),
                'units': project.get('units', 0),
                'total_budget': project.get('total_budget', 0),
                'project_advocates_count': project_advocates,
                'brand_advocates_count': brand_advocates,
                'total_referrals': referrals_count,
                'conversions': conversions,
                'conversion_rate': int((conversions / referrals_count) * 100) if referrals_count > 0 else 0,
                'created_at': project.get('created_at').isoformat() if project.get('created_at') else None
            })
        
        return jsonify({
            'projects': projects_data,
            'total': total,
            'skip': skip,
            'limit': limit
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@project_bp.route('/<project_id>', methods=['GET'])
def get_project_details(project_id):
    """
    Get specific project details with full statistics
    Response: { project details, units, developer info, referral stats }
    """
    try:
        try:
            project_obj_id = ObjectId(project_id)
        except:
            return jsonify({'error': 'Invalid project ID format'}), 400
        
        project = projects_collection.find_one({'_id': project_obj_id})
        
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        project_name = project.get('name')
        
        # Get statistics
        referrals_count = referrals_collection.count_documents({
            'target_project': project_name
        })
        
        conversions = referrals_collection.count_documents({
            'target_project': project_name,
            'status': 'CONVERTED'
        })
        
        # Get advocate statistics
        project_advocates_list = list(users_collection.find({
            'project_name': project_name,
            'advocate_type': 'PROJECT_ADVOCATE'
        }).limit(10))
        
        brand_advocates_list = list(users_collection.find({
            'project_name': project_name,
            'advocate_type': 'BRAND_ADVOCATE'
        }).limit(10))
        
        # Get recent referrals
        recent_referrals = list(referrals_collection.find({
            'target_project': project_name
        }).sort('created_at', -1).limit(10))
        
        return jsonify({
            'project': {
                'id': str(project.get('_id')),
                'name': project.get('name'),
                'location': project.get('location'),
                'status': project.get('status'),
                'description': project.get('description'),
                'units': project.get('units', 0),
                'total_budget': project.get('total_budget', 0),
                'accepts_referrals': project.get('accepts_referrals', True),
                'developer': project.get('developer'),
                'created_at': project.get('created_at').isoformat() if project.get('created_at') else None
            },
            'statistics': {
                'total_referrals': referrals_count,
                'conversions': conversions,
                'conversion_rate': int((conversions / referrals_count) * 100) if referrals_count > 0 else 0,
                'project_advocates_count': len(project_advocates_list),
                'brand_advocates_count': len(brand_advocates_list)
            },
            'project_advocates': [
                {
                    'id': str(adv.get('_id')),
                    'name': adv.get('full_name'),
                    'plot_number': adv.get('plot_number')
                }
                for adv in project_advocates_list
            ],
            'brand_advocates': [
                {
                    'id': str(adv.get('_id')),
                    'name': adv.get('full_name')
                }
                for adv in brand_advocates_list
            ],
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


@project_bp.route('/advocate/<advocate_id>', methods=['GET'])
def get_advocate_projects(advocate_id):
    """
    Get projects available for an advocate based on their type
    Query params: { status, skip, limit }
    Response: { projects: [...], advocate_type, total }
    """
    try:
        try:
            advocate_obj_id = ObjectId(advocate_id)
        except:
            return jsonify({'error': 'Invalid advocate ID format'}), 400
        
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 20))
        
        # Get advocate info
        advocate = users_collection.find_one({'_id': advocate_obj_id})
        
        if not advocate:
            return jsonify({'error': 'Advocate not found'}), 404
        
        advocate_type = advocate.get('advocate_type', 'PROJECT_ADVOCATE')
        
        # Build query for projects
        query = {}
        
        # Project advocates can only see projects they're assigned to
        if advocate_type == 'PROJECT_ADVOCATE':
            if advocate.get('project_name'):
                query['name'] = advocate.get('project_name')
        # Brand advocates can see all active projects
        else:
            query['accepts_referrals'] = True
            query['status'] = 'active'
        
        # Get total count
        total = projects_collection.count_documents(query)
        
        # Get projects
        projects = list(projects_collection.find(query)
            .sort('created_at', -1)
            .skip(skip)
            .limit(limit)
        )
        
        projects_data = []
        for project in projects:
            referrals_count = referrals_collection.count_documents({
                'target_project': project.get('name'),
                'advocate_id': advocate_id
            })
            
            projects_data.append({
                'id': str(project.get('_id')),
                'name': project.get('name'),
                'location': project.get('location'),
                'status': project.get('status'),
                'units': project.get('units', 0),
                'total_budget': project.get('total_budget', 0),
                'advocate_referrals': referrals_count
            })
        
        return jsonify({
            'projects': projects_data,
            'advocate_type': advocate_type,
            'total': total,
            'skip': skip,
            'limit': limit
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

