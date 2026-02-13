# Backend Setup & Running Instructions

## Prerequisites
- Python 3.8+
- MongoDB 4.4+
- pip (Python package manager)

## Setup Steps

### 1. Install Python Dependencies
```bash
cd server
pip install -r requirements.txt
```

### 2. Configure Environment Variables
The `.env.example` file has been created. Create a `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
FLASK_ENV=development
MONGO_URI=mongodb://localhost:27017/builtcred
SECRET_KEY=your-secret-key-here
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:3000
```

### 3. Start MongoDB

#### On Linux/Mac:
```bash
# If installed via brew
brew services start mongodb-community

# If installed via manual installation
mongod
```

#### On Windows:
- MongoDB Community Server should be running as a service
- Or manually: `mongod.exe` from installation directory

#### Using Docker:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Run Flask Backend
```bash
cd server
python app.py
```

The Flask server will start on `http://localhost:5000`

## API Endpoints

### Health Check
- **GET** `/health` - Basic health check
- **GET** `/api/health` - API health check with database connection test

### Authentication
- **POST** `/api/auth/signup` - User registration
- **POST** `/api/auth/login` - User login
- **POST** `/api/auth/logout` - User logout

### Advocates
- **POST** `/api/advocates/register` - Register new advocate
- **GET** `/api/advocates` - List all advocates
- **GET** `/api/advocates/<id>` - Get advocate details
- **PUT** `/api/advocates/<id>` - Update advocate

### Referrals
- **POST** `/api/referrals/generate-link` - Generate referral link
- **GET** `/api/referrals` - List referrals
- **GET** `/api/referrals/<id>` - Get referral details
- **PUT** `/api/referrals/<id>/status` - Update referral status

### Rewards
- **POST** `/api/rewards/create` - Create reward
- **GET** `/api/rewards` - List rewards
- **GET** `/api/rewards/<id>` - Get reward details

### Admin
- **GET** `/api/admin/analytics/overview` - Overview analytics
- **GET** `/api/admin/advocates` - List all advocates (admin)
- **GET** `/api/admin/referrals` - List all referrals (admin)

## Testing the API

### Using cURL:
```bash
# Health check
curl http://localhost:5000/api/health

# Sign up
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"123456","full_name":"John Doe"}'

# Generate referral link
curl -X POST http://localhost:5000/api/referrals/generate-link \
  -H "Content-Type: application/json" \
  -d '{"advocate_id":"YOUR_ADVOCATE_ID","project_id":"YOUR_PROJECT_ID"}'
```

### Using Postman:
1. Import the API endpoints from the above list
2. Set the base URL to `http://localhost:5000`
3. Test each endpoint with appropriate request bodies

## Frontend Configuration

The frontend is configured to connect to the Flask backend at `http://localhost:5000`. 
The configuration is set in the Home.jsx component which checks the health endpoint.

Frontend is running on: `http://localhost:5174`

## Troubleshooting

### MongoDB Connection Fails
- Ensure MongoDB is running: `mongosh` or `mongo` from terminal
- Check MONGO_URI in .env file matches your MongoDB setup
- Default: `mongodb://localhost:27017/builtcred`

### CORS Errors
- Update CORS_ORIGINS in .env to match your frontend URL
- Common URLs: `http://localhost:5173,http://localhost:5174,http://localhost:3000`

### Port Already in Use
- Flask defaults to port 5000
- Change in app.py: `app.run(debug=True, host='0.0.0.0', port=YOUR_PORT)`

### Dependencies Not Installing
- Ensure Python 3.8+ is installed
- Use virtual environment:
  ```bash
  python -m venv venv
  source venv/bin/activate  # On Windows: venv\Scripts\activate
  pip install -r requirements.txt
  ```

## Project Structure

```
server/
├── app.py              # Main Flask application
├── config.py           # Configuration settings
├── requirements.txt    # Python dependencies
├── .env.example        # Environment variables template
└── routes/
    ├── auth_routes.py       # Authentication endpoints
    ├── advocate_routes.py    # Advocate management endpoints
    ├── referral_routes.py    # Referral system endpoints
    ├── reward_routes.py      # Reward calculation endpoints
    ├── admin_routes.py       # Admin panel endpoints
    └── health_routes.py      # Health check endpoints
```

## Next Steps

1. ✅ Flask backend is set up
2. ✅ Frontend is running on http://localhost:5174
3. Start MongoDB
4. Run `python app.py` in the server directory
5. Visit http://localhost:5174 to see the application
6. The Home page will show the backend connection status

Refer to the backend-main.md for the complete feature roadmap and implementation plan.
