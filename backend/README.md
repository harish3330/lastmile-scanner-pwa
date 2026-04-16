# Backend Architecture Notes

## Structure
- `app.py` - Entry point
- `app/__init__.py` - App factory
- `app/routes/` - API routes (modular)
- `requirements.txt` - Dependencies

## TODO: Future Implementation
- Authentication module
- Database models
- Delivery management routes
- Scanning routes
- Tracking routes
- ML integration routes
- Payment processing

## Running the Server
```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
python app.py
```

The server will run on `http://localhost:5000`
