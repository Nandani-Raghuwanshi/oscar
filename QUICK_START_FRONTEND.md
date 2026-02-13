# 🚀 Quick Start Guide - Frontend Integration

Get your frontend running with backend integration in minutes!

## Prerequisites
- Node.js 16+ installed
- Backend server running on `http://localhost:5000`
- MongoDB connection in backend

## 📦 Installation

### Step 1: Install Dependencies
```bash
cd /home/vamsi/Documents/oscar
npm install
```

This installs:
- React & React DOM
- React Router DOM
- Axios (HTTP client)

### Step 2: Ensure Backend is Running
```bash
cd /home/vamsi/Documents/oscar/server
python app.py
# or
bash start-backend.sh
```

Expected output:
```
 * Running on http://127.0.0.1:5000
```

### Step 3: Start Frontend Development Server
```bash
cd /home/vamsi/Documents/oscar
npm run dev
```

Expected output:
```
  VITE v5.0.0  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

## 🌐 Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## 📱 First Time Setup

### 1. Create an Account
- Click **Sign Up** in the navigation
- Fill in: Email, Password, Full Name
- Click **Sign Up** button
- You'll be redirected to your dashboard

### 2. View Your Dashboard
- See your referral statistics
- Total referrals, conversions, and earnings
- View list of your referrals

### 3. Create a Referral
- Click **New Referral** in navigation
- Fill in property details:
  - Property name
  - Property value (in ₹)
  - Client information
- Click **Create Referral**

### 4. Track Rewards
- Click **Rewards** in navigation
- See total rewards earned
- Claim available rewards
- Track reward status

### 5. Admin Dashboard (if admin)
- Click **Admin** in navigation
- View system analytics
- Monitor platform metrics
- See total users and referrals

## 🔑 Features Overview

### 🔐 Authentication
- ✅ Signup with email and password
- ✅ Login to your account
- ✅ Persistent login (localStorage)
- ✅ Logout functionality
- ✅ Protected routes

### 📊 Dashboards
- ✅ Advocate Dashboard - View your stats
- ✅ Rewards Dashboard - Track earnings
- ✅ Admin Dashboard - System analytics
- ✅ Referral Form - Create new referrals

### 🎨 User Interface
- ✅ Responsive design (mobile & desktop)
- ✅ Modern gradient backgrounds
- ✅ Color-coded status indicators
- ✅ Hamburger menu for mobile
- ✅ Loading indicators

## 📋 Navigation Menu

### When Not Logged In
- 🏠 Home
- ℹ️ About
- 🔐 Login
- 📝 Sign Up

### When Logged In
- 🏠 Home
- ℹ️ About
- 📊 Dashboard
- ➕ New Referral
- 🎁 Rewards
- ⚙️ Admin
- 👤 User Name
- 🚪 Logout

## 🧪 Test Data

### Test User Account
```
Email: test@example.com
Password: password123
Full Name: Test User
```

Note: You need to create this account first through signup.

## ⚙️ Configuration

### Change Backend URL
Edit `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://your-backend-url/api'
```

### Change Frontend Port
Edit `vite.config.js`:
```javascript
export default {
  server: {
    port: 3000  // Change to desired port
  }
}
```

## 🔍 Troubleshooting

### 1. CORS Error
**Error**: Access blocked by CORS
**Solution**: 
- Check backend has CORS enabled
- Add frontend URL to CORS origins in backend
- Restart backend server

### 2. Cannot Connect to Backend
**Error**: Network error / Failed to fetch
**Solution**:
- Verify backend running on `http://localhost:5000`
- Check firewall isn't blocking port 5000
- Check API_BASE_URL in `src/services/api.js`

### 3. Login Not Working
**Error**: Invalid email or password
**Solution**:
- Make sure account was created via signup
- Check email and password are correct
- Look at browser console for error details

### 4. Blank Page / No Content Loading
**Error**: Page loads but shows nothing
**Solution**:
- Check browser console for JavaScript errors
- Clear browser cache (Ctrl+Shift+Del)
- Try hard refresh (Ctrl+F5)
- Check if backend is responding

### 5. Protected Routes Not Working
**Error**: Always redirected to login
**Solution**:
- Ensure AuthProvider wraps entire app
- Check localStorage for user data
- Clear localStorage and login again
- Check browser console for errors

## 📚 Useful Commands

### Development
```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
```

### Backend
```bash
cd server
python app.py            # Start backend
bash start-backend.sh    # Alternative startup
```

### Database
```bash
mongo               # Access MongoDB
use oscar          # Select database
db.users.find()    # View users
```

## 📊 Project Structure
```
oscar/
├── src/
│   ├── pages/              # Page components
│   ├── components/         # Reusable components
│   ├── services/           # API integration
│   ├── context/            # State management
│   ├── styles/             # CSS files
│   ├── App.jsx
│   └── main.jsx
├── server/
│   ├── routes/             # API routes
│   ├── app.py             # Flask app
│   └── config.py          # Configuration
├── package.json
└── vite.config.js
```

## 🚨 Important Notes

1. **Password Security**: Passwords should be hashed in production
2. **HTTPS**: Use HTTPS in production
3. **API Key**: Implement proper API authentication in production
4. **MongoDB**: Ensure database is running and configured
5. **Backups**: Regular database backups recommended

## ✅ Verification Checklist

Before considering setup complete:
- [ ] `npm install` completed without errors
- [ ] Backend running on `http://localhost:5000`
- [ ] Frontend running on `http://localhost:5173`
- [ ] Can access homepage
- [ ] Can create account via signup
- [ ] Can login with created account
- [ ] Dashboard loads after login
- [ ] Can create a referral
- [ ] Can view rewards
- [ ] Can access admin dashboard
- [ ] Can logout successfully

## 📞 Support

If you encounter issues:
1. Check the error message in browser console
2. Verify backend is running and accessible
3. Check API_BASE_URL configuration
4. Review the troubleshooting section above
5. Check API_REQUIREMENTS.md for endpoint details

## 🎉 You're All Set!

Your frontend integration is complete and ready to use. Start creating referrals and tracking rewards!

For more details, see:
- [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) - Full integration details
- [API_REQUIREMENTS.md](./API_REQUIREMENTS.md) - Backend API specifications
- [INTEGRATION_COMPLETE.md](./INTEGRATION_COMPLETE.md) - Complete feature list
