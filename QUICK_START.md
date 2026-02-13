# Quick Reference Guide

## 🚀 Current System Status

| Service | Status | URL | Port | Command |
|---------|--------|-----|------|---------|
| Frontend (Vite) | ✅ Running | http://localhost:5174 | 5174 | `pnpm run dev` |
| Backend (Flask) | ✅ Running | http://localhost:5000 | 5000 | `python app.py` |
| Database (MongoDB) | ⏳ Setup Needed | localhost:27017 | 27017 | `mongod` |

## 📁 Key Files & Locations

### Frontend
- **Homepage**: [src/pages/Home.jsx](src/pages/Home.jsx) - API status indicator
- **Navigation**: [src/components/Nav.jsx](src/components/Nav.jsx) - Responsive navbar
- **Styling**: [src/styles.css](src/styles.css) - All CSS (1000+ lines)
- **Config**: [vite.config.js](vite.config.js) - Vite configuration
- **Entry**: [src/main.jsx](src/main.jsx) - React entry point

### Backend
- **Main App**: [server/app.py](server/app.py) - Flask initialization
- **Config**: [server/config.py](server/config.py) - Environment configuration
- **Routes**: [server/routes/](server/routes/) - API endpoints
  - [auth_routes.py](server/routes/auth_routes.py) - Authentication
  - [advocate_routes.py](server/routes/advocate_routes.py) - Advocates
  - [referral_routes.py](server/routes/referral_routes.py) - Referrals
  - [reward_routes.py](server/routes/reward_routes.py) - Rewards
  - [admin_routes.py](server/routes/admin_routes.py) - Admin panel
  - [health_routes.py](server/routes/health_routes.py) - Health checks

### Configuration
- **Environment**: [server/.env](server/.env) - Environment variables
- **Backend Setup**: [SETUP.md](SETUP.md) - Detailed setup guide
- **Project Overview**: [README.md](README.md) - Main documentation
- **Backend Plan**: [server/backend-main.md](server/backend-main.md) - Feature roadmap

## 🔗 API Quick Reference

### Test Connection
```bash
curl http://localhost:5000/api/health
```

### User Authentication
```bash
# Sign up
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pwd123","full_name":"John"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pwd123"}'
```

### Advocate Management
```bash
# Register advocate
curl -X POST http://localhost:5000/api/advocates/register \
  -H "Content-Type: application/json" \
  -d '{"user_id":"ID","advocate_type":"PROJECT_ADVOCATE"}'

# List advocates
curl http://localhost:5000/api/advocates

# Get advocate
curl http://localhost:5000/api/advocates/ADVOCATE_ID
```

### Referral System
```bash
# Generate link
curl -X POST http://localhost:5000/api/referrals/generate-link \
  -H "Content-Type: application/json" \
  -d '{"advocate_id":"ID","project_id":"ID"}'

# List referrals
curl http://localhost:5000/api/referrals?advocate_id=ID
```

### Rewards
```bash
# Create reward
curl -X POST http://localhost:5000/api/rewards/create \
  -H "Content-Type: application/json" \
  -d '{"referral_id":"ID","advocate_id":"ID","plot_value":5000000}'

# List rewards
curl http://localhost:5000/api/rewards
```

### Admin Analytics
```bash
curl http://localhost:5000/api/admin/analytics/overview
curl http://localhost:5000/api/admin/advocates
curl http://localhost:5000/api/admin/referrals
```

## 🛠️ Terminal Commands

### Start All Services (3 terminals needed)

**Terminal 1 - Frontend**
```bash
cd /home/vamsi/Documents/oscar
pnpm run dev
# Runs on http://localhost:5174
```

**Terminal 2 - Backend**
```bash
cd /home/vamsi/Documents/oscar/server
source venv/bin/activate  # Activate Python virtual env
python app.py
# Runs on http://localhost:5000
```

**Terminal 3 - MongoDB**
```bash
# Start MongoDB service
mongod  # or use Docker: docker run -d -p 27017:27017 mongo:latest
```

### MongoDB Commands

```bash
# Connect to MongoDB
mongosh  # or mongo for older versions

# Check connection
db.adminCommand('ping')

# Use builtcred database
use builtcred

# View data
db.users.find()
db.advocates.find()
db.referrals.find()
db.rewards.find()

# Count documents
db.advocates.countDocuments()
db.referrals.countDocuments()
```

### Frontend Commands

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm run dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Backend Commands

```bash
# Install Python dependencies
pip install -r requirements.txt

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Run Flask server
python app.py

# Run with specific port
python -c "from app import create_app; app = create_app(); app.run(port=5001)"
```

## 📊 Database Schema

### Collections in MongoDB

```
builtcred/
├── users
│   ├── _id
│   ├── email
│   ├── password
│   ├── full_name
│   ├── created_at
│   └── verified
│
├── advocates
│   ├── _id
│   ├── user_id
│   ├── advocate_type (PROJECT_ADVOCATE | BRAND_ADVOCATE)
│   ├── primary_project_id
│   ├── eligibility_verified
│   ├── created_at
│   └── updated_at
│
├── referrals
│   ├── _id
│   ├── advocate_id
│   ├── project_id
│   ├── referral_code (UUID)
│   ├── first_touch_timestamp
│   ├── last_touch_timestamp
│   ├── status (pending | qualified | converted | rejected)
│   ├── created_at
│   └── updated_at
│
├── rewards
│   ├── _id
│   ├── referral_id
│   ├── advocate_id
│   ├── plot_value
│   ├── reward_amount
│   ├── status (pending | approved | paid)
│   ├── created_at
│   └── updated_at
│
└── leads (future)
    ├── _id
    ├── referral_id
    ├── first_name
    ├── last_name
    ├── email
    ├── phone
    ├── budget_range
    └── capture_timestamp
```

## 🎨 UI Components

### Pages
- [Home.jsx](src/pages/Home.jsx) - Hero section + API status
- [About.jsx](src/pages/About.jsx) - System information
- [NotFound.jsx](src/pages/NotFound.jsx) - 404 error page

### Components
- [Nav.jsx](src/components/Nav.jsx) - Responsive navigation bar
- [Loader.jsx](src/components/Loader.jsx) - Loading spinner

### Styling
- Modern gradient backgrounds
- Responsive grid layouts
- Mobile-first design
- Smooth animations
- Professional color scheme

## 🔒 Security Notes

- **CORS**: Configured for localhost development (update for production)
- **Passwords**: Currently stored in plaintext (implement hashing before production)
- **JWT**: Not yet implemented (Phase 4 feature)
- **Environment**: Use .env for sensitive data (never commit to Git)

## 📈 Reward Calculation

```
Tiered System:
├── ₹50L - ₹1Cr      → ₹25,000 reward
├── ₹1Cr - ₹1.5Cr    → ₹35,000 reward
└── ₹1.5Cr+          → ₹50,000 reward
```

## 🐛 Common Issues

### Port Already in Use
```bash
# Find and kill process
lsof -ti:5000 | xargs kill -9   # Backend
lsof -ti:5174 | xargs kill -9   # Frontend
lsof -ti:27017 | xargs kill -9  # MongoDB
```

### MongoDB Connection Failed
- Ensure MongoDB is running
- Check MONGO_URI in [server/.env](server/.env)
- Default: `mongodb://localhost:27017/builtcred`

### Dependencies Not Found
```bash
# Frontend
pnpm install

# Backend
pip install -r requirements.txt
```

### CORS Errors
- Update CORS_ORIGINS in [server/.env](server/.env)
- Add your frontend URL to the list

## 📚 Documentation Files

- [README.md](README.md) - Main project documentation
- [SETUP.md](SETUP.md) - Detailed setup and deployment guide
- [server/backend-main.md](server/backend-main.md) - Backend feature roadmap (7 phases)
- [frontend-main.md](frontend-main.md) - Frontend feature roadmap
- [to-do.md](to-do.md) - Project todo list

## 🚀 Next Steps

1. **Start MongoDB**: `mongod` or Docker
2. **Visit Frontend**: http://localhost:5174
3. **Check API Status**: Page shows ✅ if backend is connected
4. **Test API**: Use curl commands above to test endpoints
5. **Review**: Check [backend-main.md](server/backend-main.md) for full roadmap

## 💡 Tips

- Keep three terminals open: Frontend, Backend, MongoDB
- Use Postman for easier API testing
- MongoDB Compass for visual database management
- Browser DevTools (F12) for frontend debugging
- Flask debug mode auto-reloads on file changes

---

**Last Updated**: February 11, 2026  
**Frontend Status**: ✅ Running  
**Backend Status**: ✅ Running  
**Database Status**: ⏳ Ready to configure
