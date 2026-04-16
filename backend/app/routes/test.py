from flask import Blueprint

bp = Blueprint('test', __name__, url_prefix='/api/test')

@bp.route('/', methods=['GET'])
def test_route():
    """Test endpoint"""
    return {'message': 'Test endpoint working!'}, 200

@bp.route('/ping', methods=['POST'])
def test_ping():
    """Ping endpoint"""
    return {'pong': True, 'timestamp': __import__('datetime').datetime.now().isoformat()}, 200
