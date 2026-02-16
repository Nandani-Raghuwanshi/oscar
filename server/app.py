"""
Flask Application Entry Point

Task: Complete Flask backend setup
- Initialize Flask app with CORS
- Load configuration from config.py
- Register all API routes
- Implement error handling middleware
- Connect to MongoDB
"""

from flask import Flask, jsonify
from flask_cors import CORS
from config import Config

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS
CORS(app)

# Register blueprints for different route modules
from routes.auth_routes import auth_bp
from routes.health_routes import health_bp
from routes.admin_routes import admin_bp

# Routes needed:
# - routes/auth_routes.py (signup, login, logout) ✓
# - routes/advocate_routes.py (register, get, update)
# - routes/referral_routes.py (create link, submit lead, get referrals)
# - routes/reward_routes.py (get rewards, pending, paid)
# - routes/project_routes.py (get projects)
# - routes/admin_routes.py (admin analytics, user validation) ✓
# - routes/health_routes.py (health check) ✓

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(health_bp, url_prefix='/api')
app.register_blueprint(admin_bp, url_prefix='/api/admin')

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({"error": "Internal server error"}), 500

@app.errorhandler(400)
def bad_request(error):
    """Handle 400 errors"""
    return jsonify({"error": "Bad request"}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
