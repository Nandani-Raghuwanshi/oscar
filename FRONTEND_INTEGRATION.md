# Frontend Integration Setup

This document outlines the frontend integration with the backend API and the new pages/features added.

## 📋 New Frontend Structure

### Services
- **`src/services/api.js`** - Centralized API client with all backend endpoints

### Context & State Management
- **`src/context/AuthContext.jsx`** - Authentication context with login, signup, logout, and user state

### Pages Added
- **`src/pages/Login.jsx`** - User login page
- **`src/pages/Signup.jsx`** - User registration page
- **`src/pages/AdvocateDashboard.jsx`** - Advocate dashboard with stats and referrals
- **`src/pages/AdminDashboard.jsx`** - Admin dashboard with system analytics
- **`src/pages/RewardsDashboard.jsx`** - Rewards dashboard to view and claim rewards
- **`src/pages/ReferralForm.jsx`** - Form to create new referrals

### Styles
- **`src/styles/auth.css`** - Authentication pages styling
- **`src/styles/dashboard.css`** - Dashboard pages styling

### Updated Components
- **`src/components/Nav.jsx`** - Updated with authentication links and user menu
- **`src/App.jsx`** - Updated with new routes and protected route logic

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
cd /home/vamsi/Documents/oscar
npm install
```

### 2. Backend Requirements
Ensure the backend is running on `http://localhost:5000` with the following endpoints:

#### Authentication Routes
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

#### Advocate Routes
- `POST /api/advocates/register` - Register as advocate
- `GET /api/advocates/:id` - Get advocate profile
- `PUT /api/advocates/:id` - Update advocate profile
- `GET /api/advocates/:id/referrals` - Get advocate's referrals
- `POST /api/advocates/referrals` - Create new referral
- `GET /api/advocates/:id/stats` - Get advocate statistics

#### Reward Routes
- `GET /api/rewards` - Get user rewards
- `POST /api/rewards/calculate` - Calculate reward
- `POST /api/rewards/:id/claim` - Claim a reward

#### Admin Routes
- `GET /api/admin/analytics/overview` - Get system analytics
- `GET /api/admin/metrics/users` - User metrics
- `GET /api/admin/metrics/advocates` - Advocate metrics
- `GET /api/admin/metrics/referrals` - Referral metrics

#### Health Check
- `GET /api/health/status` - Health check endpoint

### 3. Backend CORS Configuration
Update your Flask backend to allow CORS from the frontend:

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://localhost:3000"])
```

### 4. Start the Frontend
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` (or port shown in terminal)

## 📱 Features Overview

### Authentication Flow
1. Users can sign up with email, password, and full name
2. Passwords are validated for minimum length
3. After login, user data is stored in localStorage
4. Protected routes prevent unauthorized access
5. Auth state persists across page refreshes

### Navigation
- **Public Users**: See Home, About, Login, Signup links
- **Authenticated Users**: See Dashboard, New Referral, Rewards, Admin, and Logout

### Dashboards

#### Advocate Dashboard
- View total referrals, converted referrals, and earnings
- See conversion rate statistics
- View list of all referrals with status and dates

#### Admin Dashboard
- System-wide analytics overview
- Total users, advocates, and referrals count
- Total rewards distributed
- System status monitoring

#### Rewards Dashboard
- Total earned rewards display
- List of all rewards with amounts and status
- Ability to claim pending rewards
- Track claimed rewards

#### Referral Form
- Create new property referrals
- Enter property details (name, value)
- Add client information (name, email, phone)
- Form validation and success/error messages

## 🔐 Security Features

1. **Protected Routes** - Routes are protected and require authentication
2. **Password Validation** - Minimum length validation on signup
3. **Local Storage** - Secure token and user data storage
4. **Auto Logout** - Logout clears all user data
5. **Fallback to Login** - Unauthenticated users redirected to login

## 🎨 Styling

The application uses:
- Modern gradient backgrounds
- Responsive grid layouts
- Clear visual hierarchy
- Color-coded status badges
- Mobile-friendly design

## 📊 API Integration

All API calls are centralized in `src/services/api.js`:
- Automatic base URL configuration
- Standard headers and content type
- Easy error handling
- Reusable across components

## 🔄 State Management

Uses React Context API for:
- User authentication state
- Login/signup/logout actions
- Global user data
- Loading and error states

## 📝 Environment Configuration

Default backend URL: `http://localhost:5000`

To change, edit `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://your-backend-url/api'
```

## ✅ Verification Checklist

- [ ] Backend running on `http://localhost:5000`
- [ ] CORS enabled on backend
- [ ] All API endpoints implemented
- [ ] Frontend dependencies installed
- [ ] `npm run dev` command working
- [ ] Can navigate to login/signup
- [ ] Can create account and login
- [ ] Dashboards load after authentication
- [ ] Navigation updates based on auth state

## 🐛 Troubleshooting

### CORS Errors
- Ensure backend has CORS enabled
- Check API_BASE_URL in `src/services/api.js`
- Verify backend is running

### Login Not Working
- Check backend database connection
- Verify user credentials match stored data
- Check browser console for error messages

### Protected Routes Not Working
- Ensure AuthProvider wraps App component
- Check useAuth() hook imports
- Verify user data in localStorage

## 📚 File Structure
```
src/
├── services/
│   └── api.js                 # API client
├── context/
│   └── AuthContext.jsx        # Auth state management
├── pages/
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── AdvocateDashboard.jsx
│   ├── AdminDashboard.jsx
│   ├── RewardsDashboard.jsx
│   ├── ReferralForm.jsx
│   ├── Home.jsx
│   ├── About.jsx
│   └── NotFound.jsx
├── components/
│   ├── Nav.jsx
│   ├── Loader.jsx
│   └── ...
├── styles/
│   ├── auth.css
│   ├── dashboard.css
│   └── styles.css
└── App.jsx
```
