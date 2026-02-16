"""
Task: Implement advocate management routes
- POST /advocates/register - Register user as advocate
- GET /advocates/:advocate_id - Get advocate details
- PUT /advocates/:advocate_id - Update advocate information
- GET /advocates - List all advocates (admin only)

Expected functionality:
- Validate advocate type (PROJECT_ADVOCATE or BRAND_ADVOCATE)
- Store advocate type and associated projects
- Auto-correct invalid advocate selections
- Retrieve advocate details with statistics
- Update advocate profile and settings
"""

from flask import Blueprint, request, jsonify

advocate_bp = Blueprint('advocates', __name__)

@advocate_bp.route('/register', methods=['POST'])
def register_advocate():
    """
    Register user as advocate
    Request: { user_id, advocate_type }
    Response: { message, advocate_id }
    """
    # Implementation goes here
    pass

@advocate_bp.route('/<advocate_id>', methods=['GET'])
def get_advocate(advocate_id):
    """
    Get advocate details and statistics
    Response: { advocate details, referral stats, reward info }
    """
    # Implementation goes here
    pass

@advocate_bp.route('/<advocate_id>', methods=['PUT'])
def update_advocate(advocate_id):
    """
    Update advocate information
    Request: { field: value }
    Response: { message, updated_advocate }
    """
    # Implementation goes here
    pass

@advocate_bp.route('', methods=['GET'])
def list_advocates():
    """
    List all advocates (admin only)
    Query params: { advocate_type, skip, limit }
    Response: { advocates: [...], total }
    """
    # Implementation goes here
    pass
