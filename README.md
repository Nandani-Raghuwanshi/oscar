# BuiltCred - Construction Referral Program

A comprehensive referral management system for construction projects with multi-role support, lead tracking, and reward management.

## Quick Links

- [Phase 1 Summary](PHASE_1_COMPLETE.md) - Infrastructure & Authentication complete ✅
- [Phase 2 Summary](PHASE_2_COMPLETE.md) - Admin & User Management complete ✅
- [Phase 3 Setup](docs/PHASE_3_BUILDER_MODULE.md) - Builder module in progress 🚀
- [Phase 1 Setup](PHASE_1_SETUP.md) - Detailed setup instructions
- [Phase 2 Setup](PHASE_2_SETUP.md) - Overview of what's been implemented
- [Phase 2: Role-Based Routing](docs/PHASE_2_ROUTING_SETUP.md) - Frontend routing & navigation setup
- [Storage & State Management](docs/STORAGE_MANAGEMENT.md) - localStorage & Zustand stores guide
- [Architecture](ARCHITECTURE.md) - System design and data flow
- [Development Guide](DEVELOPMENT.md) - Code conventions & best practices
- [Project Requirements](docs/basic.md) - Features by user role
- [Development Tracking](docs/to-do-list.md) - Feature checklist by phase

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB
- **Auth:** JWT + bcryptjs
- **State Management:** Zustand
- **Communication:** WhatsApp (Gupshup integration)

## Project Overview

BuiltCred is a referral program platform for construction projects that enables:

- **Builders/Developers:** Manage customer lists, send WhatsApp invites, track escalations
- **CRM/Sales Team:** Manage advocates, assign referrals, track pipeline, handle payments
- **Project Advocates:** Send referrals, track conversions, earn rewards
- **Brand Advocates:** Cross-project referrals, reward tracking
- **Admins:** Complete system control, user management, reporting

## Current Status: Phase 3 - In Progress 🚀

Phase 1 (infrastructure & authentication) and Phase 2 (admin & user management) are complete. Phase 3 (Builder/Developer module) is now in development.

### ✅ Phase 1 - Complete
- Full authentication system (register, login, JWT)
- MongoDB database with User and Project models
- Role-based access control (RBAC)
- Protected routes and middleware
- Frontend infrastructure with React + Vite + Tailwind

### ✅ Phase 2 - Complete
- **Backend:** Complete admin API with 16 endpoints
  - User management CRUD (create, read, update, delete)
  - Project management CRUD with builder assignment
  - Dashboard statistics and analytics
  - Audit trail logging for all admin actions
  - Bulk user import from CSV
  - Advanced search, filtering, and pagination
  
- **Frontend:** Full admin interface
  - Admin dashboard with live statistics
  - User management with table view and forms
  - Project management with grid view
  - Audit trail viewer
  - Bulk CSV upload interface
  - Search, filter, and pagination components

### 🚀 Phase 3 - In Progress
- **Backend:** Builder API endpoints for customer management
  - Customer CRUD operations
  - CSV file upload and import
  - Customer search and filtering
  - Dashboard statistics
  - Escalation views
  
- **Frontend:** Builder interface
  - Customer list management with upload
  - Reports and analytics dashboard
  - Escalations viewer
  - Ready for WhatsApp integration in Phase 8

### What's Next: Phase 4 - Project Advocates Module
- Advocate profile management
- Referral submission interface
- Conversion tracking
- Reward management

### File Structure
```
oscar/
├── server/                    # Express.js backend
│   ├── src/
│   │   ├── config/           # Database & constants
│   │   ├── middleware/       # Auth & error handling
│   │   ├── models/           # User & Project schemas
│   │   ├── routes/           # API endpoints
│   │   ├── utils/            # Helper functions
│   │   └── index.js          # Server entry point
│   ├── package.json
│   ├── .env
│   └── .env.example
│
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── api/              # API client
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── store/            # Zustand state
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── docs/                      # Documentation
│   ├── basic.md              # Project requirements
│   └── to-do-list.md         # Progress tracker
│
├── README.md                  # This file
├── PHASE_1_COMPLETE.md       # Phase 1 completion summary
├── PHASE_1_SETUP.md          # Setup instructions
├── ARCHITECTURE.md           # System design
├── DEVELOPMENT.md            # Code guidelines
├── docker-compose.yml        # MongoDB container
└── setup.sh                  # Auto setup script
```

## Getting Started

### Prerequisites
- Node.js 16+
- MongoDB (or Docker)
- npm or yarn

### Quick Start

1. **One-Command Setup** (requires bash)
   ```bash
   chmod +x setup.sh
   ./setup.sh
   docker-compose up -d
   ```

2. **Manual Setup - Backend**
   ```bash
   cd server
   npm install
   npm run dev
   ```

3. **Manual Setup - Frontend** (new terminal)
   ```bash
   cd client
   npm install
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB UI: http://localhost:8081 (if Docker is running)

### Testing Login
1. Go to http://localhost:3000/register
2. Create an account with any details
3. Select a user role
4. Click Register
5. You'll be logged in and see the dashboard
6. Try logging out and back in

## Development Phases

The project is organized into 10 phases for systematic development:

1. **Phase 1:** Core Infrastructure & Authentication ✅ **COMPLETE**
2. **Phase 2:** Admin & User Management
3. **Phase 3:** Builder/Developer Module
4. **Phase 4:** Project Advocates Module
5. **Phase 5:** Brand Advocates Module
6. **Phase 6:** CRM/Sales Module (Core)
7. **Phase 7:** CRM/Sales Module (Advanced)
8. **Phase 8:** Notifications & Communication
9. **Phase 9:** Reporting & Analytics
10. **Phase 10:** System Optimization & Testing

**See [docs/to-do-list.md](docs/to-do-list.md) for detailed task breakdown by phase.**

## API Reference - Phase 1

### Authentication Endpoints

#### 1. Register User
```
POST /api/auth/register
Content-Type: application/json

Request:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "password": "password123",
  "role": "project_advocate"
}

Response (201):
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { id, email, firstName, lastName, role, ... },
    "token": "jwt_token_string"
  }
}
```

#### 2. Login
```
POST /api/auth/login
Content-Type: application/json

Request:
{
  "email": "john@example.com",
  "password": "password123"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { id, email, firstName, lastName, role, ... },
    "token": "jwt_token_string"
  }
}
```

#### 3. Get Current User
```
GET /api/auth/me
Authorization: Bearer <jwt_token>

Response (200):
{
  "success": true,
  "message": "User details retrieved",
  "data": { id, email, firstName, lastName, role, projectId, ... }
}
```

#### Health Check
```
GET /health

Response (200):
{
  "status": "Server is running"
}
```

## User Roles

- **admin** - System administrator with full access
- **builder** - Builder/Land-owner/Developer
- **crm_manager** - CRM/Sales manager
- **sales_associate** - Sales associate (Level 2)
- **project_advocate** - Project-specific advocate
- **brand_advocate** - Brand-wide advocate

## Environment Variables

Create a `.env` file in the server directory with:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/builtcred

# JWT
JWT_SECRET=your_secret_key_change_in_production
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# WhatsApp/Gupshup (Phase 2+)
GUPSHUP_API_KEY=your_api_key
GUPSHUP_APP_NAME=your_app_name
```

For detailed setup, see [PHASE_1_SETUP.md](PHASE_1_SETUP.md)

## Development Commands

### Backend
```bash
cd server
npm run dev          # Development mode with auto-reload
npm start            # Production mode
npm test             # Run tests
```

### Frontend
```bash
cd client
npm run dev          # Development mode
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## What's Next?

### Continuing Development

1. **Review Phase 2** - Check [PHASE_2_COMPLETE.md](PHASE_2_COMPLETE.md)
2. **Review Phase 1** - Check [PHASE_1_COMPLETE.md](PHASE_1_COMPLETE.md)
3. **Understand Architecture** - Read [ARCHITECTURE.md](ARCHITECTURE.md)
4. **Read Guidelines** - Follow [DEVELOPMENT.md](DEVELOPMENT.md)
5. **Start Phase 3** - Implementation of Builder/Developer Module

### Phase 3 Features (Next Up)
- Customer list upload and management
- WhatsApp invitation system (Gupshup integration)
- Builder reports dashboard with analytics
- Escalations management and alerts
- Notification center
- Customer tracking and status updates

### Making Changes

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Follow code conventions in [DEVELOPMENT.md](DEVELOPMENT.md)
3. Update [docs/to-do-list.md](docs/to-do-list.md) as you complete tasks
4. Test thoroughly before committing
5. Update relevant documentation in [docs/](docs/) folder
6. Submit pull request

### Important Files to Know

- **README.md** - Main documentation (you are here)
- **[PHASE_1_COMPLETE.md](PHASE_1_COMPLETE.md)** - What Phase 1 accomplished
- **[PHASE_1_SETUP.md](PHASE_1_SETUP.md)** - How to set up Phase 1
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design and data flow
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Code standards and practices
- **[docs/to-do-list.md](docs/to-do-list.md)** - Progress tracking

## Notes

- All changes should be documented in `docs/` folder
- Keep `README.md` minimal with links to detailed docs
- Update `docs/to-do-list.md` to track progress
- Monthly security updates and MongoDB index optimization required

## License

MIT
