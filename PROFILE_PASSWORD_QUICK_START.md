# Quick Start: Profile & Password Management

## ⚡ 5-Minute Setup

### 1. **Verify Files Are in Place**

```bash
# Frontend files
✓ src/pages/ProfileUpdate.jsx
✓ src/pages/ProfileUpdate.css
✓ src/pages/ResetPassword.jsx
✓ src/pages/ResetPassword.css

# Backend files
✓ server/routes/user_routes.py

# Updated files
✓ src/App.jsx (routes added)
✓ src/components/Nav.jsx (links added)
✓ src/services/api.js (userAPI added)
✓ server/app.py (blueprint registered)
```

### 2. **Start Your Application**

```bash
# Terminal 1: Backend
cd server
python app.py
# Expected: Running on http://0.0.0.0:5000

# Terminal 2: Frontend
npm run dev
# Expected: Local: http://localhost:5173
```

### 3. **Test the Features**

1. **Access Features:**
   - Login with any account
   - Click your name in top-right corner
   - See "👤 Edit Profile" and "🔐 Reset Password" options

2. **Try Profile Update:**
   - Click "Edit Profile"
   - Change your phone number
   - Click "Save Changes"
   - See success message → redirect to dashboard
   - Your name in navbar should update

3. **Try Password Reset:**
   - Click "Reset Password"
   - See password requirements display
   - Current password: enter your current password
   - New password: enter something like `NewPass123`
   - Confirm password: type same password again
   - Click "Change Password"
   - See success message → return to login (for security)
   - Login with new password (should work!)
   - Try old password (should fail!)

---

## 🎯 What Each Component Does

### ProfileUpdate.jsx
```
Purpose: Let users edit their profile
Updates:
- Full name
- Email address
- Phone number
- Project name
- Plot number

Validates:
- Required fields
- Email format
- Email uniqueness (backend)
```

### ResetPassword.jsx
```
Purpose: Let users change their password
Validates:
- Current password is correct
- New password strength
- Passwords match
- New password is different from old

Shows:
- Password requirements
- Strength indicators
- Real-time matching feedback
- Security tips
```

### user_routes.py (Backend)
```
Endpoints provided:
GET    /users/profile        - Get your profile
PUT    /users/profile        - Update profile
POST   /users/reset-password - Change password

All require JWT authentication
```

---

## 🔑 Important Information

### Authentication
- ✅ All requests must include JWT token
- ✅ Token automatically added from localStorage
- ✅ Token gets removed if expires (401 error)
- ✅ Auto-redirects to login if token invalid

### Password Requirements
```
✓ Minimum 8 characters
✓ At least one UPPERCASE letter
✓ At least one lowercase letter
✓ At least one number
✓ At least one special character recommended
```

### Email Validation
```
✓ Format checked (must have @)
✓ Uniqueness checked (one email per account)
✓ Can't change to email already in use
```

### Security Notes
```
✓ Passwords hashed with bcrypt
✓ Current password verified before change
✓ Can't change to same password
✓ No passwords in logs or localStorage
✓ All validation on backend too
```

---

## 🧪 Quick Test Checklist

(Run this after setup)

- [ ] Login successful
- [ ] Can see user dropdown menu
- [ ] "Edit Profile" link available
- [ ] Click "Edit Profile" loads profile page
- [ ] Can change phone number
- [ ] Save button works
- [ ] Success message appears
- [ ] Name in navbar updates
- [ ] Can click "Reset Password"
- [ ] Password requirements display
- [ ] Can enter current password
- [ ] Strength checker works
- [ ] Can change password
- [ ] Can login with new password
- [ ] Old password doesn't work
- [ ] Mobile view works (test with Ctrl+Shift+I)

---

## 🚀 Production Deployment

Before deploying to production:

1. **Update JWT Secret:**
   ```python
   # server/routes/user_routes.py
   JWT_SECRET = os.getenv('JWT_SECRET', 'change-this-in-production!')
   ```

2. **Set Environment Variables:**
   ```bash
   export JWT_SECRET="your-super-secret-key-min-32-chars"
   export MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/db"
   ```

3. **Enable HTTPS** on production server

4. **Test thoroughly** on staging environment

5. **Monitor logs** for any authentication errors

---

## 🐛 Quick Troubleshooting

**Issue:** Can't see Edit Profile button
- Solution: Make sure you're logged in
- Check browser console for errors

**Issue:** Password change says "incorrect password"
- Solution: Verify caps lock is off
- Password is case-sensitive
- May have extra spaces

**Issue:** Email change gives "already in use" error
- Solution: That email belongs to another account
- Try a different email
- Or contact admin

**Issue:** Getting 401 errors
- Solution: Login again (token expired)
- Clear localStorage (Ctrl+Shift+Delete)
- Check backend is running

**Issue:** CORS error
- Solution: Backend must be on port 5000
- Check Flask CORS is enabled
- Restart backend server

---

## 📞 API Quick Reference

### Update Profile
```bash
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "New Name",
    "email": "new@email.com",
    "phone": "+1234567890",
    "project_name": "Project",
    "plot_number": "A-123"
  }'
```

### Reset Password
```bash
curl -X POST http://localhost:5000/api/users/reset-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "OldPass123",
    "new_password": "NewPass456"
  }'
```

### Get Profile
```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 💡 Tips & Tricks

1. **Lost Password?** 
   - No recovery implemented yet (future feature)
   - Contact admin to reset

2. **Change Multiple Fields?**
   - Edit Profile lets you change all at once
   - Save once for all changes

3. **Mobile Users?**
   - Full responsive design
   - Optimized for 480px+ screens
   - Password visibility toggle helps on mobile

4. **Security Best Practice:**
   - Change password every 3 months
   - Use unique passwords per service
   - Don't share profile access
   - Logout from public computers

---

## 📝 File Structure

```
oscar/
├── src/
│   ├── pages/
│   │   ├── ProfileUpdate.jsx ✨ NEW
│   │   ├── ProfileUpdate.css ✨ NEW
│   │   ├── ResetPassword.jsx ✨ NEW
│   │   ├── ResetPassword.css ✨ NEW
│   │   └── ... other pages
│   ├── components/
│   │   └── Nav.jsx (UPDATED - added links)
│   ├── services/
│   │   └── api.js (UPDATED - added userAPI)
│   └── App.jsx (UPDATED - added routes)
│
├── server/
│   ├── routes/
│   │   ├── user_routes.py ✨ NEW
│   │   └── ... other routes
│   └── app.py (UPDATED - registered blueprint)
│
└── PROFILE_PASSWORD_FEATURES.md ✨ NEW (You are here!)
```

---

## ✨ What's Next?

After testing these features:

1. ✅ Test thoroughly
2. ✅ Check logs for errors
3. ✅ Get user feedback
4. ✅ Monitor security
5. ✅ Deploy to staging
6. ✅ Deploy to production

Future enhancements:
- Email verification for profile changes
- Password reset email links
- Two-factor authentication (2FA)
- Login activity logs
- Account security dashboard

---

## 🎉 All Set!

Your users can now:
- ✅ Update their profile anytime
- ✅ Change their password securely
- ✅ Manage their account information
- ✅ Access these from any page via dropdown

**Status:** Ready to Deploy 🚀

---

**Need help?** Check `/PROFILE_PASSWORD_FEATURES.md` for detailed documentation.
