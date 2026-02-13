from flask import Flask, current_app
from flask_cors import CORS
from flask_pymongo import PyMongo
from config import config
import os
import sys

mongo = PyMongo()

def get_db():
    return mongo.db

def create_app(config_name=None):
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    mongo.init_app(app)
    
    cors_origins = app.config.get('CORS_ORIGINS', '').split(',')
    CORS(app, origins=cors_origins, supports_credentials=True)
    
    from routes.auth_routes import auth_bp
    from routes.advocate_routes import advocate_bp
    from routes.referral_routes import referral_bp
    from routes.reward_routes import reward_bp
    from routes.admin_routes import admin_bp
    from routes.health_routes import health_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(advocate_bp)
    app.register_blueprint(referral_bp)
    app.register_blueprint(reward_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(health_bp)
    
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Not Found', 'message': 'The requested resource was not found'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {'error': 'Internal Server Error', 'message': 'An internal server error occurred'}, 500
    
    @app.before_request
    def before_request():
        pass
    
    return app

if __name__ == '__main__':
    app = create_app()
    print("\n" + "="*60)
    print("🚀 BuiltCred Backend Server Starting")
    print("="*60)
    print(f"Environment: {app.config.get('FLASK_ENV', 'development')}")
    print(f"MongoDB URI: {app.config.get('MONGO_URI', 'Not configured')}")
    print(f"CORS Origins: {app.config.get('CORS_ORIGINS', 'Not configured')}")
    print("="*60)
    print("📡 Server running on http://localhost:5000")
    print("🏥 Health check: GET http://localhost:5000/api/health")
    print("="*60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)

