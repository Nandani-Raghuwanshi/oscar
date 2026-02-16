# RBAC Quick Testing Guide

Quick reference for testing the RBAC implementation without reading the full documentation.

## Quick Start (10 minutes)

### Step 1: Setup (Assuming backend and frontend already running)
1. Ensure MongoDB is running
2. Backend: `python server/app.py` (running on :5000)
3. Frontend: `npm run dev` (running on :5173)

### Step 2: Create Test Admin Account (ONE TIME ONLY)
```bash
# In MongoDB:
db.users.insertOne({
  email: "admin@test.com",
  password: "$2b$12$...", // bcrypt hash of "AdminPass123"
  full_name: "Test Admin",
  role: "admin",
  status: "approved",
  created_at: new Date(),
  is_active: true
})
```

Or manually via mongo shell:
```javascript
use oscars
db.users.insertOne({
  "email": "admin@test.com",
  "full_name": "Test Admin",
  "role": "admin",
  "status": "approved",
  "is_active": true,
  "created_at": new Date()
})
```

Then manually hash and update password in database.

### Step 3: Test Regular User (2 mins)
```
1. Go to localhost:5173/signup
2. Select "Regular User"
3. Fill form: john.test@example.com / TestPass123 / John Test
4. Submit
5. ✅ Should auto-redirect to dashboard
```

### Step 4: Test Pending Advocate (2 mins)
```
1. Go to localhost:5173/signup
2. Select "Project Advocate"
3. Select "project_advocate"
4. Fill form: jane.test@example.com / TestPass123 / Jane Advocate
5. Submit
6. ✅ Should show "pending approval" message
7. Try to login
8. ✅ Should show orange "pending" message
```

### Step 5: Test Admin Approval (2 mins)
```
1. Login as admin: admin@test.com / AdminPass123
2. Go to /admin
3. Click "Pending Users" tab
4. Click "Review" on Jane Advocate
5. Click "Approve"
6. ✅ Should show green success message
7. Logout
8. Login as jane.test@example.com
9. ✅ Should redirect to dashboard successfully
```

### Step 6: Test Admin Rejection (2 mins)
```
1. Signup new advocate: bob.test@example.com / TestPass123 / Bob Advocate
2. Login as admin
3. Go to /admin → "Pending Users"
4. Click "Review" on Bob Advocate
5. Click "Reject"
6. Enter reason: "Does not meet requirements"
7. Confirm
8. ✅ Should show green success message
9. Logout
10. Try login as bob.test@example.com
11. ✅ Should show red "rejected" message
```

---

## Testing Checklists by Role

### As Regular User
- [ ] Can signup immediately
- [ ] Can login immediately
- [ ] Can access /dashboard
- [ ] Can access /referral
- [ ] Cannot access /admin

### As Admin
- [ ] Can login with approved status
- [ ] Can access /admin
- [ ] Can see "Pending Users" tab
- [ ] Can approve pending users
- [ ] Can reject pending users
- [ ] Can see analytics
- [ ] Can filter users by role/status

### As Pending Advocate
- [ ] Cannot access dashboard
- [ ] Cannot access referral
- [ ] Cannot access admin
- [ ] Sees "pending approval" message on all protected routes
- [ ] Sees orange ⏳ badge in navigation

### As Rejected User
- [ ] Cannot access any protected feature
- [ ] Sees red "rejected" message on login
- [ ] Sees ❌ badge in navigation
- [ ] Can still view home and about pages

---

## Common Test Scenarios

### Scenario 1: First Time User (Regular)
```
Signup → Immediate Access → Full Features
Status: Approved automatically
Time to access: Instant
```

### Scenario 2: Advocate Joining
```
Signup → Pending → Admin Review → Approval → Full Access
Status: Pending → Approved
Time to access: Admin dependent (hours to days)
```

### Scenario 3: Rejected Advocate
```
Signup → Pending → Admin Rejects (with reason) → No Access
Status: Rejected (cannot login, cannot access features)
```

### Scenario 4: Admin Reactivates Rejected User
```
Rejected User → Admin Reactivates → Pending Again → Can reapply
Status: Rejected → Pending
```

---

## Quick API Testing (Postman)

### Test User Signup (Expected: 201)
```
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "TestPass123",
  "full_name": "Test User",
  "role": "user"
}
```

### Test Advocate Signup (Expected: 201, no token)
```
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "email": "advocate@example.com",
  "password": "TestPass123",
  "full_name": "Test Advocate",
  "role": "advocate",
  "advocate_type": "project_advocate"
}
```

### Test Pending Login (Expected: 202)
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "advocate@example.com",
  "password": "TestPass123"
}
```

### Test Admin Approve (Expected: 200)
```
POST http://localhost:5000/api/admin/users/<USER_ID>/approve
Authorization: Bearer <ADMIN_TOKEN>
```

### Test Admin Analytics (Expected: 200 with metrics)
```
GET http://localhost:5000/api/admin/analytics
Authorization: Bearer <ADMIN_TOKEN>
```

---

## Status Codes Reference

| Code | Meaning | Scenario |
|------|---------|----------|
| 200 | OK | Approved user login successful |
| 201 | Created | User signup successful |
| 202 | Accepted | User signup pending approval |
| 400 | Bad Request | Invalid form data |
| 401 | Unauthorized | Wrong password or invalid token |
| 403 | Forbidden | Account rejected or not approved |
| 409 | Conflict | Email already registered |

---

## What to Check When Tests Fail

### Signup Not Working
- [ ] Check MongoDB is running
- [ ] Check email is not already registered
- [ ] Check password meets requirements (8+ chars, uppercase, lowercase, number)
- [ ] Check network tab for error response
- [ ] Check backend logs for exceptions

### Login Not Working
- [ ] Check email is registered
- [ ] Check password is correct
- [ ] Check account status in database
- [ ] Check token is being stored in localStorage

### Protected Routes Not Working
- [ ] Check user is authenticated (check localStorage has token)
- [ ] Check user status is "approved"
- [ ] Check user role matches required role (for admin routes)
- [ ] Check network requests go to correct URL

### Admin Panel Not Loading
- [ ] Check user role in localStorage is "admin"
- [ ] Check user status is "approved"
- [ ] Check API endpoint is responding (test in Postman)
- [ ] Check CORS is configured correctly

### Navigation Not Updating
- [ ] Check AuthContext is being used in Nav.jsx
- [ ] Refresh page after login/logout
- [ ] Check localStorage for user data
- [ ] Check browser console for errors

---

## Database Queries for Testing

### View Pending Users
```javascript
db.users.find({ status: "pending" })
```

### View Approved Users
```javascript
db.users.find({ status: "approved" })
```

### View Rejected Users
```javascript
db.users.find({ status: "rejected" })
```

### View All Users by Role
```javascript
db.users.find({ role: "advocate" })
```

### Count Users by Status
```javascript
db.users.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])
```

### Approve a User (Admin Operation)
```javascript
db.users.updateOne(
  { _id: ObjectId("USER_ID") },
  { 
    $set: { 
      status: "approved",
      approved_at: new Date(),
      approved_by: ObjectId("ADMIN_ID")
    }
  }
)
```

---

## Files to Review

If something isn't working, check these files:

### Frontend
- [src/context/AuthContext.jsx](src/context/AuthContext.jsx) - Authentication state
- [src/components/ProtectedRoute.jsx](src/components/ProtectedRoute.jsx) - Route protection
- [src/pages/Login.jsx](src/pages/Login.jsx) - Login form
- [src/pages/Signup.jsx](src/pages/Signup.jsx) - Signup form
- [src/pages/admin/AdminPanel.jsx](src/pages/admin/AdminPanel.jsx) - Admin dashboard
- [src/components/Nav.jsx](src/components/Nav.jsx) - Navigation bar

### Backend
- [server/routes/auth_routes.py](server/routes/auth_routes.py) - Login/signup endpoints
- [server/routes/admin_routes.py](server/routes/admin_routes.py) - Admin endpoints
- [server/middleware/auth_middleware.py](server/middleware/auth_middleware.py) - Auth decorators

---

## Common Mistakes to Avoid

❌ Creating admin account with wrong password format
✅ Use bcrypt to hash password: `bcrypt.hashpw("AdminPass123".encode(), bcrypt.gensalt())`

❌ Forgetting to send advocate_type when signing up as advocate
✅ Include advocate_type in signup request body

❌ Trying to access admin routes without admin token
✅ Login as admin first, copy token from localStorage, use in Postman Authorization header

❌ Testing in private/incognito mode without clearing cache
✅ Use regular browsing mode or clear localStorage between tests

❌ Not waiting for admin approval before trying to access features as advocate
✅ After signup, login as admin, approve the advocate, then logout and login as advocate

---

## Expected Test Results

| Action | Expected Result | Status |
|--------|-----------------|--------|
| Regular user signup | Auto-login and redirect to dashboard | ✅ |
| Advocate signup | Show pending message | ✅ |
| Pending user login | Show orange pending warning | ✅ |
| Rejected user login | Show red rejection error | ✅ |
| Approved advocate login | Login successful | ✅ |
| Admin approve user | Green success notification | ✅ |
| Admin reject user | Update status to rejected | ✅ |
| Non-admin access /admin | Show access denied page | ✅ |
| Pending user access /dashboard | Show pending approval page | ✅ |
| Logout | Clear tokens, redirect home | ✅ |

---

**Last Updated**: 2026-02-16
**For Full Details**: See [RBAC_IMPLEMENTATION.md](RBAC_IMPLEMENTATION.md) and [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)
