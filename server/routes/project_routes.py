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

project_bp = Blueprint('projects', __name__)

@project_bp.route('', methods=['GET'])
def get_projects():
    """
    Get list of all projects
    Query params: { status, developer_id, skip, limit }
    Response: { projects: [...], total }
    """
    # Implementation goes here
    pass

@project_bp.route('/<project_id>', methods=['GET'])
def get_project_details(project_id):
    """
    Get specific project details
    Response: { project details, units, developer info, referral stats }
    """
    # Implementation goes here
    pass

@project_bp.route('/advocate/<advocate_id>', methods=['GET'])
def get_advocate_projects(advocate_id):
    """
    Get projects for an advocate based on their type
    Response: { projects: [...], advocate_type }
    """
    # Implementation goes here
    pass
