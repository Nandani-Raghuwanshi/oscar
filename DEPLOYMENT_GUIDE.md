# BuiltCred - Complete Deployment Guide

**Project:** BuiltCred - Construction Referral Management System  
**Version:** 1.0.0  
**Status:** Production Ready (Phases 1-7 Complete)  
**Date:** February 21, 2026

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Backend Setup](#backend-setup)
5. [Frontend Setup](#frontend-setup)
6. [Running the Application](#running-the-application)
7. [Creating Test Users](#creating-test-users)
8. [Testing the Application](#testing-the-application)
9. [Production Deployment](#production-deployment)
10. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites

### Required Software:
- **Node.js:** v18.x or higher ([Download](https://nodejs.org/))
- **MongoDB:** v6.0 or higher ([Download](https://www.mongodb.com/try/download/community))
- **Git:** Latest version ([Download](https://git-scm.com/downloads))
- **Code Editor:** VS Code recommended ([Download](https://code.visualstudio.com/))

### Package Managers (choose one):
- **npm:** (comes with Node.js)
- **pnpm:** (recommended) - Install: `npm install -g pnpm`

### Verify Installation:
```powershell
# Check Node.js version
node --version
# Should output: v18.x.x or higher

# Check npm version
npm --version
# Should output: 9.x.x or higher

# Check MongoDB installation
mongod --version
# Should output: db version v6.x.x

# Check Git
git --version
# Should output: git version 2.x.x
```

---

## 2. Environment Setup

### Step 1: Clone Repository
```powershell
# Navigate to your projects directory
cd C:\Users\YourUsername\Projects

# Clone the repository
git clone https://github.com/Nandani-Raghuwanshi/oscar.git

# Navigate into project directory
cd oscar
```

### Step 2: Install Dependencies

#### Backend Dependencies:
```powershell
# Navigate to server directory
cd server

# Install dependencies using npm
npm install

# OR using pnpm (recommended)
pnpm install

# Expected output: All packages installed successfully
```

#### Frontend Dependencies:
```powershell
# Navigate to client directory (from project root)
cd ..\client

# Install dependencies using npm
npm install

# OR using pnpm (recommended)
pnpm install

# Expected output: All packages installed successfully
```

---

## 3. Database Setup

### Step 1: Start MongoDB

#### Option A: Local MongoDB
```powershell
# Start MongoDB service (Windows)
net start MongoDB

# OR start manually
mongod --dbpath C:\data\db

# Expected output: MongoDB starting... waiting for connections on port 27017
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/builtcred`)

### Step 2: Create Database
```powershell
# Open MongoDB shell
mongosh

# Create database
use builtcred

# Verify database created
show dbs

# Exit MongoDB shell
exit
```

---

## 4. Backend Setup

### Step 1: Configure Environment Variables
```powershell
# Navigate to server directory
cd server

# Copy .env.example to .env
copy .env.example .env

# Open .env file in editor
notepad .env
```

### Step 2: Update .env File
```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/builtcred
# For MongoDB Atlas, use: mongodb+srv://username:password@cluster.mongodb.net/builtcred

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# WhatsApp/Gupshup (Optional - For Phase 8)
GUPSHUP_API_KEY=your_gupshup_api_key_here
GUPSHUP_APP_NAME=your_app_name_here
```

### Step 3: Generate Strong JWT Secret
```powershell
# Generate random 32-character string (PowerShell)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})

# Copy the output and paste it as JWT_SECRET in .env file
```

### Step 4: Verify Backend Setup
```powershell
# Make sure you're in server directory
cd server

# Check if .env file exists
Test-Path .env
# Should output: True

# Check if node_modules exists
Test-Path node_modules
# Should output: True
```

---

## 5. Frontend Setup

### Step 1: Configure Frontend Environment (Optional)
```powershell
# Navigate to client directory
cd ..\client

# Create .env file (optional - only if using different port)
echo VITE_API_URL=http://localhost:5000 > .env
```

**Note:** The frontend is pre-configured to use `http://localhost:5000`. You only need to create `.env` if using a different backend URL.

### Step 2: Verify Frontend Setup
```powershell
# Check if node_modules exists
Test-Path node_modules
# Should output: True
```

---

## 6. Running the Application

### Option A: Run Both Servers Simultaneously

#### Terminal 1 - Backend Server:
```powershell
# Navigate to server directory
cd server

# Start backend in development mode
npm run dev

# Expected output:
# Server running on port 5000
# MongoDB connected successfully
# Starting auto-escalation cron job...
# Running initial auto-escalation check...
# Initial auto-escalation check completed
```

#### Terminal 2 - Frontend Server:
```powershell
# Open new terminal
# Navigate to client directory
cd client

# Start frontend in development mode
npm run dev

# Expected output:
# VITE v5.0.0  ready in 500 ms
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
```

### Option B: Run Using Scripts (if available)

If you have a start script in root:
```powershell
# From project root
npm start
```

---

## 7. Creating Test Users

### Method 1: Using MongoDB Compass (GUI)

1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Select `builtcred` database
4. Select `users` collection
5. Click "ADD DATA" → "Insert Document"
6. Use the JSON documents below

### Method 2: Using MongoDB Shell

```powershell
# Open MongoDB shell
mongosh

# Switch to builtcred database
use builtcred

# Create Admin User
db.users.insertOne({
  name: "Admin User",
  email: "admin@builtcred.com",
  password: "$2a$10$YourHashedPasswordHere",
  role: "admin",
  phone: "1234567890",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})

# Create Builder User
db.users.insertOne({
  name: "Builder Company",
  email: "builder@builtcred.com",
  password: "$2a$10$YourHashedPasswordHere",
  role: "builder",
  phone: "1234567891",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})

# Create CRM Manager
db.users.insertOne({
  name: "CRM Manager",
  email: "crm@builtcred.com",
  password: "$2a$10$YourHashedPasswordHere",
  role: "crm_manager",
  phone: "1234567892",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})

# Create Sales Associate
db.users.insertOne({
  name: "Sales Associate",
  email: "sales@builtcred.com",
  password: "$2a$10$YourHashedPasswordHere",
  role: "sales_associate",
  phone: "1234567893",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Method 3: Using Registration API

```powershell
# Register Admin (use Postman, Thunder Client, or curl)
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@builtcred.com",
  "password": "Admin@123456",
  "role": "admin",
  "phone": "1234567890"
}

# Register Builder
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Builder Company",
  "email": "builder@builtcred.com",
  "password": "Builder@123456",
  "role": "builder",
  "phone": "1234567891"
}

# Register CRM Manager
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "CRM Manager",
  "email": "crm@builtcred.com",
  "password": "CRM@123456",
  "role": "crm_manager",
  "phone": "1234567892"
}

# Register Sales Associate
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Sales Associate",
  "email": "sales@builtcred.com",
  "password": "Sales@123456",
  "role": "sales_associate",
  "phone": "1234567893"
}
```

**Default Password for All Test Users:** `Test@123456`

---

## 8. Testing the Application

### Step 1: Access Frontend
```
Open browser and navigate to: http://localhost:5173
```

### Step 2: Login as Different Roles

#### Test Admin Flow:
```
1. Login with: admin@builtcred.com / Test@123456
2. Navigate to: http://localhost:5173/admin/dashboard
3. Expected: See admin dashboard with user management
4. Test: Create users, manage projects, view audit logs
```

#### Test Builder Flow:
```
1. Login with: builder@builtcred.com / Test@123456
2. Navigate to: http://localhost:5173/builder/dashboard
3. Expected: See builder dashboard with project stats
4. Test: Upload customers CSV, view advocates, check reports
```

#### Test CRM Manager Flow:
```
1. Login with: crm@builtcred.com / Test@123456
2. Navigate to: http://localhost:5173/crm/dashboard
3. Expected: See CRM dashboard with referrals stats
4. Test: 
   - View advocates (with performance tiers)
   - Assign referrals via dropdown
   - View pipeline (Kanban board)
   - Check payments
```

#### Test Sales Associate Flow:
```
1. Login with: sales@builtcred.com / Test@123456
2. Navigate to: http://localhost:5173/crm/dashboard
3. Expected: See sales associate dashboard
4. Test:
   - View "My Referrals" (only assigned)
   - Log call (50-word validation)
   - Update referral status
   - View performance analytics
```

### Step 3: Test End-to-End Flow
```
1. Login as Builder → Upload customers CSV
2. Customers auto-converted to project advocates
3. Login as Advocate → Submit referral
4. Login as CRM Manager → Assign referral to sales associate
5. Login as Sales Associate → Log call, update status
6. Login as Sales Associate → Mark payment (when status = booking)
7. Verify reward auto-generated for advocate (2%)
8. Check auto-escalation after 24 hours (Level 1)
```

---

## 9. Production Deployment

### Step 1: Build Frontend for Production
```powershell
# Navigate to client directory
cd client

# Build production bundle
npm run build

# Expected output:
# ✓ built in 15s
# dist folder created with optimized files
```

### Step 2: Configure Production Environment
```bash
# Update server/.env for production
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret_64_chars_long
PORT=5000
```

### Step 3: Start Production Server
```powershell
# Navigate to server directory
cd server

# Start in production mode
npm start

# Expected output:
# Server running on port 5000
# MongoDB connected successfully
# Auto-escalation cron job started
```

### Step 4: Serve Frontend (Choose one)

#### Option A: Using Express (Recommended)
```javascript
// Add to server/src/index.js (before error handlers)
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../../client/dist')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist', 'index.html'));
});
```

#### Option B: Using Nginx
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /path/to/client/dist;
        try_files $uri /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 10. Troubleshooting

### Issue 1: MongoDB Connection Failed
```
Error: MongooseServerSelectionError: connect ECONNREFUSED
```

**Solutions:**
```powershell
# Check if MongoDB is running
net start MongoDB

# OR restart MongoDB service
net stop MongoDB
net start MongoDB

# Verify MongoDB is listening
netstat -an | findstr :27017
# Should show: TCP    0.0.0.0:27017    LISTENING
```

### Issue 2: Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# OR change port in server/.env
PORT=5001
```

### Issue 3: JWT Verification Failed
```
Error: jwt malformed or invalid signature
```

**Solutions:**
```powershell
# 1. Clear browser localStorage
# In browser console: localStorage.clear()

# 2. Verify JWT_SECRET is set in .env
# Check: server/.env has JWT_SECRET=...

# 3. Generate new JWT_SECRET
# Use at least 32 characters
```

### Issue 4: CORS Error
```
Error: CORS policy: No 'Access-Control-Allow-Origin' header
```

**Solutions:**
```javascript
// Verify in server/src/index.js
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
```

### Issue 5: Auto-Escalation Not Running
```
Escalations not being created automatically
```

**Solutions:**
```powershell
# 1. Check server logs for:
# "Starting auto-escalation cron job..."
# "Running auto-escalation check..."

# 2. Verify import in server/src/index.js:
# import { checkAndEscalateReferrals } from './utils/autoEscalation.js';

# 3. Check referral has assignedAt date set

# 4. Manually trigger escalation (for testing):
# Create referral and set assignedAt to 25 hours ago
```

### Issue 6: Frontend Build Fails
```
Error: Cannot find module or dependency issues
```

**Solutions:**
```powershell
# Navigate to client directory
cd client

# Remove node_modules and lock files
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
Remove-Item pnpm-lock.yaml

# Reinstall dependencies
npm install

# Retry build
npm run build
```

### Issue 7: 50-Word Validation Not Working
```
Can submit with less than 50 words
```

**Solutions:**
```javascript
// Verify in client/src/components/crm/CallLogModal.jsx:
const wordCount = notes.trim().split(/\s+/).filter(w => w.length > 0).length;
const isValid = wordCount >= 50;

// Verify in server/src/models/Interaction.js:
interactionSchema.pre('save', function(next) {
    const wordCount = this.notes.trim().split(/\s+/).length;
    if (wordCount < 50) {
        return next(new Error('Notes must be at least 50 words'));
    }
    next();
});
```

---

## 11. Health Checks

### Backend Health Check
```powershell
# Test backend is running
curl http://localhost:5000/health

# Expected response:
# {"status":"Server is running"}
```

### API Test
```powershell
# Test authentication endpoint
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@builtcred.com","password":"Test@123456"}'

# Expected response:
# {"success":true,"token":"jwt_token_here","user":{...}}
```

### Database Check
```powershell
# Check database connection
mongosh
use builtcred
db.stats()

# Expected: Shows database statistics
```

---

## 12. Quick Reference

### Start Application (Development):
```powershell
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### Build for Production:
```powershell
# Build frontend
cd client
npm run build

# Start backend
cd server
npm start
```

### Common URLs:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health
- **API Docs:** See MASTER_PLAN_PHASE_6_7.md

### Test Credentials:
```
Admin: admin@builtcred.com / Test@123456
Builder: builder@builtcred.com / Test@123456
CRM Manager: crm@builtcred.com / Test@123456
Sales Associate: sales@builtcred.com / Test@123456
```

---

## 13. Support & Documentation

### Documentation Files:
- **DAY_1_10_COMPLETE.md** - Complete implementation details
- **PHASE_6_7_COMPLETE_SUMMARY.md** - Executive summary
- **README_COMPLETE_PHASE_1_TO_7.md** - Full application documentation
- **MASTER_PLAN_PHASE_6_7.md** - CRM module planning
- **DEPLOYMENT_GUIDE.md** - This file

### Getting Help:
1. Check troubleshooting section above
2. Review error logs in terminal
3. Check browser console for frontend errors
4. Verify all environment variables are set
5. Ensure MongoDB is running
6. Check all dependencies are installed

---

## ✅ Deployment Checklist

Before deploying to production, ensure:

- [ ] MongoDB is properly configured and backed up
- [ ] Environment variables are set in production .env
- [ ] JWT_SECRET is strong (64+ characters)
- [ ] Frontend is built (`npm run build`)
- [ ] All dependencies are installed
- [ ] CORS is configured for production domain
- [ ] Auto-escalation cron job is running
- [ ] Test users are created
- [ ] All 7 phases are tested end-to-end
- [ ] SSL certificate is installed (HTTPS)
- [ ] Error logging is configured
- [ ] Database backups are scheduled
- [ ] Monitoring is setup (optional)

---

**Deployment Status:** ✅ Ready  
**Documentation Status:** ✅ Complete  
**Testing Status:** ✅ Verified  

**Good luck with your deployment!** 🚀
