# Backend Routes

Module structure for backend API routes.

## Available Routes

### Health Check
- `GET /api/health` - Server health status
- Returns: `{ status: "OK", message: "Server is running" }`

### Test Routes
- `GET /api/test/` - Test endpoint
- `POST /api/test/ping` - Ping test

## Adding New Routes

Create a new file in this directory for each module:
```
routes/
  test.py      (test routes)
  deliveries.py  (delivery routes - TODO)
  scanning.py    (scanning routes - TODO)
  tracking.py    (tracking routes - TODO)
  ...
```

Each route file should have a Blueprint and be registered in `app/main.py`.
