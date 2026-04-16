from flask import Flask
from flask_cors import CORS
from app.routes import test

def create_app():
    """
    Application factory for Flask app
    """
    app = Flask(__name__)
    
    # Enable CORS for all routes
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Register blueprints
    app.register_blueprint(test.bp)
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health():
        return {'status': 'OK', 'message': 'Server is running'}, 200
    
    return app
