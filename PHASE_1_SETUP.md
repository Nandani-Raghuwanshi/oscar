# BuiltCred - Phase 1 Setup Guide

## Phase 1: Core Infrastructure & Authentication

### Project Structure
```
oscar/
├── server/          # Node.js/Express backend
├── client/          # React/Vite frontend
└── docs/            # Documentation
```

### Backend Setup

**Installation:**
```bash
cd server
npm install
```

**Configuration:**
- Copy `.env.example` to `.env`
- Update `MONGODB_URI` with your MongoDB connection string
- Keep other defaults or customize as needed

**Running the Server:**
```bash
# Development with auto-reload
npm run dev

# Production
npm start

# The server will run on http://localhost:5000
# Health check: http://localhost:5000/health
```

**API Endpoints (Phase 1):**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (requires auth)

**Database Models:**
- User - Email, phone, password, role, permissions
- Project - Project details, certifications, documentation

### Frontend Setup

**Installation:**
```bash
cd client
npm install
```

**Running the Client:**
```bash
npm run dev

# The app will run on http://localhost:3000
```

**Features Implemented:**
- Login page with email/password authentication
- Registration page with role selection
- Protected routes based on authentication
- Token storage and management
- API client with automatic token injection
- Basic dashboard after login
- Global state management with Zustand

### Testing the Application

1. **Start MongoDB:**
   ```bash
   mongod
   ```

2. **Start Backend Server:**
   ```bash
   cd server
   npm run dev
   ```

3. **Start Frontend (in another terminal):**
   ```bash
   cd client
   npm run dev
   ```

4. **Test Registration:**
   - Go to http://localhost:3000/register
   - Fill in the form with test data
   - Select a role
   - Click Register

5. **Test Login:**
   - Go to http://localhost:3000/login
   - Use the credentials from registration
   - Should be redirected to dashboard

### What's Implemented

✅ Node.js + Express server structure
✅ MongoDB connection with Mongoose
✅ User authentication (JWT-based)
✅ Password hashing with bcryptjs
✅ Role-Based Access Control (RBAC) middleware
✅ User and Project models
✅ React + Vite frontend
✅ Login and Register pages
✅ Protected routes
✅ State management (Zustand)
✅ API client with interceptors
✅ Responsive UI with Tailwind CSS
✅ Error handling middleware
✅ Response formatting utilities

### Next Steps

Phase 2 will implement Admin & User Management features:
- User creation/deletion by admins
- Role assignment
- Project management
- User search and filtering
- Audit trail logging
