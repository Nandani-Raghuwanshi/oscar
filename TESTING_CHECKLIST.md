# RBAC Testing Checklist

## Pre-Testing Setup

### Required Test Accounts
- [ ] Admin account with role="admin" and status="approved" (must be created in database manually)
- [ ] Test browser windows/profiles (for simultaneous testing)
- [ ] API testing tool (Postman, Insomnia, or curl)

### Environment Configuration
- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:5173
- [ ] MongoDB connected and accessible
- [ ] CORS enabled for localhost
- [ ] JWT secret configured in auth_config.py

---

## 1. SIGNUP FLOW TESTS

### 1.1 Regular User Signup
- [ ] Navigate to `/signup`
- [ ] Select "Regular User" account type
- [ ] Fill form:
  - [ ] Full Name: "John Doe"
  - [ ] Email: "john.user@test.com"
  - [ ] Password: "TestPass123"
  - [ ] Confirm Password: "TestPass123"
- [ ] Check password strength indicator (should show "Strong" or "Very Strong")
- [ ] Check "I agree to terms and conditions"
- [ ] Click "Sign Up"
- [ ] **Expected Result**: 
  - [ ] Success message shown
  - [ ] Auto-redirect to `/dashboard` after 2 seconds
  - [ ] User logged in and can see dashboard

### 1.2 Project Advocate Signup
- [ ] Navigate to `/signup`
- [ ] Select "Project Advocate" account type
- [ ] Select "project_advocate" from advocate type dropdown
- [ ] Fill form:
  - [ ] Full Name: "Jane Advocate"
  - [ ] Email: "jane.advocate@test.com"
  - [ ] Password: "TestPass123"
  - [ ] Confirm Password: "TestPass123"
- [ ] Check terms text includes "...and understand that my account requires admin approval"
- [ ] Click "Sign Up"
- [ ] **Expected Result**:
  - [ ] Success message: "✓ Registration submitted! Your account is pending admin approval."
  - [ ] Message shown in green background
  - [ ] NO redirect to dashboard
  - [ ] Stay on signup page
  - [ ] Token NOT in localStorage

### 1.3 Brand Advocate Signup
- [ ] Navigate to `/signup`
- [ ] Select "Brand Advocate" account type
- [ ] Select "brand_advocate" from advocate type dropdown
- [ ] Fill form:
  - [ ] Full Name: "Bob Brand"
  - [ ] Email: "bob.brand@test.com"
  - [ ] Password: "TestPass123"
  - [ ] Confirm Password: "TestPass123"
- [ ] Click "Sign Up"
- [ ] **Expected Result**:
  - [ ] Same as Advocate signup (pending approval)

### 1.4 Form Validation Tests

#### Invalid Email Format
- [ ] Enter: "notanemail"
- [ ] Expected: Error message appears
- [ ] Submit button disabled or error shown on submit

#### Duplicate Email
- [ ] Use previously registered email (e.g., "john.user@test.com")
- [ ] Click Sign Up
- [ ] Expected: Error message "Email already registered"

#### Weak Password
- [ ] Enter password: "pass"
- [ ] Expected: Password indicator shows "Weak"

#### Password Mismatch
- [ ] Password: "TestPass123"
- [ ] Confirm: "DifferentPass123"
- [ ] Expected: Error message on submit

#### Missing Required Fields
- [ ] Try submitting with empty email
- [ ] Expected: Error message
- [ ] Try submitting without checking terms
- [ ] Expected: Error message or button disabled

### 1.5 Password Strength Indicator
- [ ] Type "weak" - Should show "Weak" in red
- [ ] Type "Pass1" - Should show "Fair" in orange
- [ ] Type "Pass123" - Should show "Good" in yellow
- [ ] Type "TestPass123" - Should show "Strong" in light green
- [ ] Type "SuperSecurePass123!@#" - Should show "Very Strong" in dark green

---

## 2. LOGIN FLOW TESTS

### 2.1 Regular User Login
- [ ] Use Test Case 1.1 credentials
- [ ] Navigate to `/login`
- [ ] Enter email and password from Test Case 1.1
- [ ] Click "Login"
- [ ] **Expected Result**:
  - [ ] Success message shown
  - [ ] Token stored in localStorage
  - [ ] User data stored in localStorage
  - [ ] Redirect to `/dashboard`
  - [ ] Can access protected routes

### 2.2 Pending User Login
- [ ] Use Test Case 1.2 credentials (advocate)
- [ ] Navigate to `/login`
- [ ] Enter email and password from Test Case 1.2
- [ ] Click "Login"
- [ ] **Expected Result**:
  - [ ] Form becomes semi-transparent (opacity 0.6)
  - [ ] Warning message shown in orange: "Your registration is pending admin approval. Please check back later."
  - [ ] NO token in localStorage
  - [ ] NO redirect
  - [ ] Clicking any button should show same message

### 2.3 Rejected User Login
- [ ] Prerequisite: Complete Test Case 4.1 first (admin rejects user)
- [ ] Use rejected user credentials
- [ ] Navigate to `/login`
- [ ] Enter rejected user email and password
- [ ] Click "Login"
- [ ] **Expected Result**:
  - [ ] Form becomes semi-transparent
  - [ ] Error message shown in red: "Your registration has been rejected. Please contact support."
  - [ ] NO token in localStorage
  - [ ] NO redirect
  - [ ] Cannot access any protected features

### 2.4 Invalid Credentials
- [ ] Navigate to `/login`
- [ ] Enter valid email format but wrong password
- [ ] Click "Login"
- [ ] **Expected Result**:
  - [ ] Error message: "Invalid email or password"
  - [ ] Stay on login page
  - [ ] Form not submitted

### 2.5 Non-existent Account
- [ ] Navigate to `/login`
- [ ] Enter email that was never registered
- [ ] Enter any password
- [ ] Click "Login"
- [ ] **Expected Result**:
  - [ ] Error message: "Invalid email or password"
  - [ ] No indication of which field is wrong

### 2.6 Remember Me Functionality
- [ ] Navigate to `/login`
- [ ] Enter email in email field
- [ ] Check "Remember me"
- [ ] Click "Login" with approved user
- [ ] **After successful login**:
  - [ ] Close browser tab/window
  - [ ] Reopen localhost:5173
  - [ ] Go to `/login`
  - [ ] Email field should be pre-filled with remembered email

---

## 3. PROTECTED ROUTE TESTS

### 3.1 Unauthenticated Access
- [ ] Logout (clear localStorage manually or use logout)
- [ ] Try to access `/dashboard`
- [ ] **Expected Result**:
  - [ ] Redirect to `/login`

- [ ] Try to access `/admin`
- [ ] **Expected Result**:
  - [ ] Redirect to `/login`

- [ ] Try to access `/referral` (any subpage)
- [ ] **Expected Result**:
  - [ ] Redirect to `/login`

### 3.2 Pending User Access to Protected Routes
- [ ] Manually set localStorage with pending user token (or intercept during test)
- [ ] Try to access `/dashboard`
- [ ] **Expected Result**:
  - [ ] Show "⏳ Pending Approval" page
  - [ ] Message: "Your registration is pending admin approval"
  - [ ] "Please wait for admin review. This typically takes 24-48 hours."
  - [ ] NO access to dashboard content
  - [ ] Navigation shows ⏳ badge

- [ ] Try to access `/admin`
- [ ] **Expected Result**:
  - [ ] Show rejection page (pending not approved for admin)

### 3.3 Rejected User Access to Protected Routes
- [ ] Manually set localStorage with rejected user token
- [ ] Try to access `/dashboard`
- [ ] **Expected Result**:
  - [ ] Show "❌ Access Denied" page
  - [ ] Message: "Your registration has been rejected"
  - [ ] Help text with support contact info
  - [ ] NO access to dashboard content
  - [ ] Navigation shows ❌ badge

- [ ] Try to access `/referral`
- [ ] **Expected Result**:
  - [ ] Same access denied page

### 3.4 Non-Admin Access to Admin Routes
- [ ] Login as regular user (Test Case 1.1)
- [ ] Try to access `/admin`
- [ ] **Expected Result**:
  - [ ] Show "Admin Access Required" page
  - [ ] Message: "Only administrators can access this page"
  - [ ] NO access to admin panel
  - [ ] Redirect option to home or back

### 3.5 Approved User Access to Protected Routes
- [ ] Login as regular user (Test Case 1.1)
- [ ] Try to access `/dashboard`
- [ ] **Expected Result**:
  - [ ] Access granted
  - [ ] Dashboard loads successfully
  - [ ] Can navigate to subpages

- [ ] Login as approved advocate (after admin approval)
- [ ] Try to access `/referral`
- [ ] **Expected Result**:
  - [ ] Access granted
  - [ ] Can view and interact with referral features

---

## 4. ADMIN DASHBOARD TESTS

### 4.1 Admin Authentication
- [ ] Login with admin account
- [ ] **Expected Result**:
  - [ ] Token successfully obtained
  - [ ] User role shows as "admin"
  - [ ] User status shows as "approved"

### 4.2 Access Admin Panel
- [ ] Login as admin
- [ ] Navigate to `/admin`
- [ ] **Expected Result**:
  - [ ] Admin panel loads
  - [ ] Three tabs visible: "Pending Users", "All Users", "Analytics"
  - [ ] Currently on "Pending Users" tab by default

### 4.3 Pending Users Tab
- [ ] Prerequisite: Have at least 2 pending advocate signups (Test Cases 1.2 and 1.3)
- [ ] On admin panel "Pending Users" tab
- [ ] **Expected Result**:
  - [ ] Both pending users listed in table
  - [ ] Columns show: Name, Email, Role, Applied Date, Action (Review button)
  - [ ] Users displayed by applied date (newest first)
  - [ ] Pagination shows "Showing 1-2 of 2 users"

#### Filter by Role
- [ ] Click "Role" dropdown
- [ ] Select "Advocate"
- [ ] **Expected Result**:
  - [ ] List updated to show only advocate role users
  - [ ] Count updated accordingly

- [ ] Select "All Roles"
- [ ] **Expected Result**:
  - [ ] All pending users shown again

### 4.4 Review User Modal
- [ ] Click "Review" button on a pending user
- [ ] **Expected Result**:
  - [ ] Modal opens showing user details:
    - [ ] Full Name
    - [ ] Email
    - [ ] Role
    - [ ] Advocate Type (if applicable)
    - [ ] Applied Date
  - [ ] Three action buttons: "Approve", "Reject", "Close"

### 4.5 Approve User
- [ ] Click "Approve" button in user review modal
- [ ] **Expected Result**:
  - [ ] Confirmation message: "User approved successfully!"
  - [ ] Green success notification displays
  - [ ] Success notification auto-dismisses after 3 seconds
  - [ ] Modal closes
  - [ ] User removed from pending list
  - [ ] User count updated

#### Verify Approved User Can Login
- [ ] Logout from admin
- [ ] Try to login with approved advocate credentials
- [ ] **Expected Result**:
  - [ ] Login successful
  - [ ] Token generated
  - [ ] Redirect to dashboard
  - [ ] Can access all features

### 4.6 Reject User
- [ ] Click "Review" on another pending user
- [ ] Click "Reject" button
- [ ] **Expected Result**:
  - [ ] Rejection reason field appears (textarea)
  - [ ] Field requires minimum 5 characters
  - [ ] Submit button in modal

#### Invalid Rejection Reason
- [ ] Type "bad" (3 characters)
- [ ] Click "Confirm Rejection"
- [ ] **Expected Result**:
  - [ ] Error message: "Rejection reason must be at least 5 characters"
  - [ ] Modal stays open

#### Valid Rejection
- [ ] Type rejection reason: "Application does not meet our current requirements"
- [ ] Click "Confirm Rejection"
- [ ] **Expected Result**:
  - [ ] Green success notification: "User rejected successfully!"
  - [ ] Modal closes
  - [ ] User removed from pending list
  - [ ] User count updated

#### Verify Rejected User Cannot Login
- [ ] Logout
- [ ] Try to login with rejected user credentials
- [ ] **Expected Result**:
  - [ ] Form becomes semi-transparent
  - [ ] Red error message shown
  - [ ] Cannot access any features

### 4.7 All Users Tab
- [ ] Click "All Users" tab
- [ ] **Expected Result**:
  - [ ] List shows all users in system
  - [ ] Columns: Name, Email, Role, Status, Created Date
  - [ ] Status shown with color badges:
    - [ ] Approved = Green
    - [ ] Pending = Orange
    - [ ] Rejected = Red

#### Filter by Role
- [ ] Click Role dropdown
- [ ] Select "Advocate"
- [ ] **Expected Result**:
  - [ ] List filtered to advocates only
  - [ ] Count updated

#### Filter by Status
- [ ] Click Status dropdown
- [ ] Select "Approved"
- [ ] **Expected Result**:
  - [ ] List filtered to approved users only
  - [ ] Both regular users and approved advocates shown (if any)

#### Combined Filters
- [ ] Role = "Advocate" AND Status = "Pending"
- [ ] **Expected Result**:
  - [ ] List shows only pending advocates

#### Search Function
- [ ] Enter email in search field: "jane.advocate"
- [ ] **Expected Result**:
  - [ ] List filtered to show matching users
  - [ ] Search works on partial email matches

- [ ] Enter name in search field: "John"
- [ ] **Expected Result**:
  - [ ] List shows users with "John" in full name

#### Pagination
- [ ] If more than 10 users exist, pagination controls show
- [ ] Click "Next" button
- [ ] **Expected Result**:
  - [ ] Next 10 users shown
  - [ ] Previous button becomes enabled

- [ ] Click "Previous" button
- [ ] **Expected Result**:
  - [ ] Back to first page

### 4.8 Analytics Tab
- [ ] Click "Analytics" tab
- [ ] **Expected Result**:
  - [ ] Six metric cards displayed:
    - [ ] Total Users (green background)
    - [ ] Approved Users (blue background)
    - [ ] Pending Users (orange background)
    - [ ] Rejected Users (red background)
    - [ ] Total Advocates (dark blue background)
    - [ ] Total Referrals (gold background)
  - [ ] Each card shows a number
  - [ ] Numbers update to reflect actual database counts

#### Verify Analytics Accuracy
Based on tests so far, examples:
- [ ] Total Users = number of accounts created
- [ ] Approved Users = regular users + approved advocates
- [ ] Pending Users = unapproved advocates in database
- [ ] Rejected Users = number rejected by admin
- [ ] Total Advocates = Project Advocates + Brand Advocates
- [ ] Total Referrals = referrals created (future test)

---

## 5. NAVIGATION TESTS

### 5.1 Unauthenticated Navigation
- [ ] Logout completely
- [ ] Check navigation bar
- [ ] **Expected Result**:
  - [ ] "Home" link visible
  - [ ] "About" link visible
  - [ ] "Login" link visible
  - [ ] "Sign Up" link visible
  - [ ] "Referral" menu NOT visible
  - [ ] "Dashboard" menu NOT visible
  - [ ] "Admin Panel" link NOT visible

### 5.2 Pending User Navigation
- [ ] Manually set localStorage with pending user token
- [ ] Refresh page
- [ ] Check navigation bar
- [ ] **Expected Result**:
  - [ ] "Home" link visible
  - [ ] "About" link visible
  - [ ] "Referral" menu NOT visible
  - [ ] "Dashboard" menu NOT visible
  - [ ] "Admin Panel" link NOT visible
  - [ ] "⏳ Pending" badge shown
  - [ ] User dropdown visible with logout option

### 5.3 Rejected User Navigation
- [ ] Manually set localStorage with rejected user token
- [ ] Refresh page
- [ ] Check navigation bar
- [ ] **Expected Result**:
  - [ ] "Home" link visible
  - [ ] "About" link visible
  - [ ] Other menus hidden
  - [ ] "❌ Rejected" badge shown
  - [ ] User dropdown visible with logout option

### 5.4 Approved Regular User Navigation
- [ ] Login as regular user
- [ ] **Expected Result**:
  - [ ] "Home" link visible
  - [ ] "About" link visible
  - [ ] "Referral" menu visible
  - [ ] "Dashboard" menu visible
  - [ ] "Admin Panel" NOT visible
  - [ ] No status badge
  - [ ] User dropdown showing user's first name

### 5.5 Approved Admin Navigation
- [ ] Login as admin
- [ ] **Expected Result**:
  - [ ] All menus visible
  - [ ] "Admin Panel" link visible
  - [ ] No status badge
  - [ ] User dropdown with email

### 5.6 User Dropdown Functions
- [ ] Login as any approved user
- [ ] Click user dropdown
- [ ] **Expected Result**:
  - [ ] Shows user email or first name
  - [ ] "Logout" button visible

- [ ] Click "Logout"
- [ ] **Expected Result**:
  - [ ] User logged out
  - [ ] Redirect to home
  - [ ] localStorage cleared
  - [ ] Navigation shows unauthenticated state

---

## 6. TOKEN PERSISTENCE TESTS

### 6.1 Token Stored in localStorage
- [ ] Login as approved user
- [ ] Open browser DevTools (F12)
- [ ] Go to Application → localStorage
- [ ] **Expected Result**:
  - [ ] Key "token" exists
  - [ ] Value contains JWT (3 parts separated by dots)
  - [ ] User data stored in "user" key

### 6.2 Persistent Login After Refresh
- [ ] Login as approved user
- [ ] Verify dashboard loads
- [ ] Press F5 to refresh page
- [ ] **Expected Result**:
  - [ ] Still logged in
  - [ ] Dashboard still loads
  - [ ] No redirect to login

### 6.3 Logout Clears localStorage
- [ ] Login as any user
- [ ] Open DevTools → Application → localStorage
- [ ] Click logout
- [ ] Check localStorage again
- [ ] **Expected Result**:
  - [ ] "token" key removed
  - [ ] "user" key removed
  - [ ] "rememberedEmail" still exists (if "Remember me" was checked)

### 6.4 Token Expiry Handling (Future Test)
- [ ] Login as user
- [ ] Wait for token to expire (set short expiry for testing)
- [ ] Try to access protected route
- [ ] **Expected Result**:
  - [ ] Should redirect to login
  - [ ] Show "Session expired" error

---

## 7. API ENDPOINT TESTS (Using Postman/Insomnia)

### 7.1 Signup Endpoint

#### Test: Regular User Signup
```
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "email": "test.user@example.com",
  "password": "TestPass123",
  "full_name": "Test User",
  "role": "user"
}
```
- [ ] Expected: 201 status, token in response, user auto-approved

#### Test: Advocate Signup
```
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "email": "test.advocate@example.com",
  "password": "TestPass123",
  "full_name": "Test Advocate",
  "role": "advocate",
  "advocate_type": "project_advocate"
}
```
- [ ] Expected: 201 status, NO token, status = "pending"

#### Test: Duplicate Email
```
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "email": "test.user@example.com",  // Same as previous
  "password": "NewPass123",
  "full_name": "Another User",
  "role": "user"
}
```
- [ ] Expected: 409 status, error: "Email already registered"

### 7.2 Login Endpoint

#### Test: Approved User Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test.user@example.com",
  "password": "TestPass123"
}
```
- [ ] Expected: 200 status, token, user data with status="approved"

#### Test: Pending User Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test.advocate@example.com",
  "password": "TestPass123"
}
```
- [ ] Expected: 202 status (Accepted), NO token, user data with status="pending"

#### Test: Rejected User Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "rejected@example.com",  // Previously rejected by admin
  "password": "TestPass123"
}
```
- [ ] Expected: 403 status, error: "Your registration has been rejected"

#### Test: Wrong Password
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test.user@example.com",
  "password": "WrongPass123"
}
```
- [ ] Expected: 401 status, error: "Invalid email or password"

### 7.3 Admin Endpoints

#### Test: Get Pending Users
```
GET http://localhost:5000/api/admin/pending-users?skip=0&limit=20
Authorization: Bearer <ADMIN_TOKEN>
```
- [ ] Expected: 200 status, array of pending users

#### Test: Approve User
```
POST http://localhost:5000/api/admin/users/<USER_ID>/approve
Authorization: Bearer <ADMIN_TOKEN>
```
- [ ] Expected: 200 status, user with status="approved"

#### Test: Reject User
```
POST http://localhost:5000/api/admin/users/<USER_ID>/reject
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "reason": "Does not meet requirements"
}
```
- [ ] Expected: 200 status, user with status="rejected"

#### Test: Get Analytics
```
GET http://localhost:5000/api/admin/analytics
Authorization: Bearer <ADMIN_TOKEN>
```
- [ ] Expected: 200 status with JSON:
```json
{
  "total_users": 5,
  "approved_users": 3,
  "pending_users": 1,
  "rejected_users": 1,
  "total_advocates": 1,
  "total_referrals": 0
}
```

### 7.4 Auth Header Tests

#### Test: Missing Token
```
GET http://localhost:5000/api/admin/analytics
(No Authorization header)
```
- [ ] Expected: 401 status, error: "Missing authorization header"

#### Test: Invalid Token
```
GET http://localhost:5000/api/admin/analytics
Authorization: Bearer invalid.token.here
```
- [ ] Expected: 401 status, error: "Invalid token"

#### Test: Non-Admin Token on Admin Endpoint
```
POST http://localhost:5000/api/admin/users/<ID>/approve
Authorization: Bearer <REGULAR_USER_TOKEN>
```
- [ ] Expected: 403 status, error: "Admin access required"

---

## 8. ERROR HANDLING TESTS

### 8.1 Network Error Handling
- [ ] Stop backend server
- [ ] Try to login
- [ ] **Expected Result**:
  - [ ] Error message shown: "Unable to connect to server"
  - [ ] Form not cleared (user can see what they entered)
  - [ ] Console shows network error

### 8.2 Validation Error Messages
- [ ] Weak password
- [ ] **Expected Result**: Password strength indicator updates in real-time
  
- [ ] Invalid email format
- [ ] **Expected Result**: Clear error message when submitting

### 8.3 Unexpected Status Codes
- [ ] Manually test API with invalid data
- [ ] **Expected Result**: Appropriate error message displayed

---

## 9. CONCURRENT USER TESTS

### 9.1 Multiple Admins
- [ ] Have 2+ admin accounts
- [ ] Have one admin approve a user
- [ ] Have second admin refresh admin panel
- [ ] **Expected Result**:
  - [ ] Second admin sees updated pending list
  - [ ] User no longer in pending

### 9.2 Pending User Logs In Multiple Times
- [ ] Create pending advocate account
- [ ] Try to login 5 times with same credentials
- [ ] **Expected Result**:
  - [ ] All 5 attempts show same "pending" message
  - [ ] Status doesn't change
  - [ ] Account not locked or throttled

---

## 10. EDGE CASE TESTS

### 10.1 Special Characters in Names
- [ ] Signup with full name: "José María O'Brien"
- [ ] **Expected Result**: Name stored and displayed correctly

### 10.2 Email Case Sensitivity
- [ ] Signup with: "Test@Example.COM"
- [ ] Try to login with: "test@example.com"
- [ ] **Expected Result**: Login successful (emails should be case-insensitive)

### 10.3 Very Long Email Address
- [ ] Signup with 100+ character email (valid format)
- [ ] **Expected Result**: Accepted and stored correctly

### 10.4 Password with Special Characters
- [ ] Password: "P@ssw0rd!#$%"
- [ ] **Expected Result**: Accepted, hashed, and verified on login

### 10.5 Rapid Multiple Requests
- [ ] Submit signup form multiple times in quick succession
- [ ] **Expected Result**: Handled gracefully (duplicate submission prevented or request queued)

---

## 11. UI/UX TESTS

### 11.1 Responsive Design
- [ ] Test on mobile viewport (375px width)
- [ ] **Expected Result**:
  - [ ] Forms stack vertically
  - [ ] Buttons readable and clickable
  - [ ] Navigation accessible

- [ ] Test on tablet (768px width)
- [ ] **Expected Result**: Proper layout

- [ ] Test on desktop (1920px width)
- [ ] **Expected Result**: Optimal spacing

### 11.2 Loading States
- [ ] Signup form submission
- [ ] **Expected Result**:
  - [ ] Button shows loading state (disabled, maybe spinner)
  - [ ] Cannot double-submit

- [ ] Login form submission
- [ ] **Expected Result**: Same loading state

### 11.3 Error Message Visibility
- [ ] All error messages should be clearly visible
- [ ] Should not be cut off by other elements
- [ ] Should have good color contrast

### 11.4 Success Message Auto-Dismiss
- [ ] On signup success (pending): Message auto-dismisses
- [ ] On admin approve: Green notification dismisses after 3 seconds
- [ ] On admin reject: Dismisses appropriately

---

## 12. BROWSER COMPATIBILITY

### 12.1 Chrome/Chromium
- [ ] Test all flows in latest Chrome
- [ ] **Expected Result**: All features work

### 12.2 Firefox
- [ ] Test all flows in latest Firefox
- [ ] **Expected Result**: All features work

### 12.3 Safari
- [ ] Test all flows in Safari
- [ ] localStorage works
- [ ] **Expected Result**: All features work

---

## Test Results Summary

| Test Category | Total Tests | Passed | Failed | Notes |
|---|---|---|---|---|
| Signup Flow | 5 | - | - | |
| Login Flow | 6 | - | - | |
| Protected Routes | 5 | - | - | |
| Admin Dashboard | 8 | - | - | |
| Navigation | 6 | - | - | |
| Token Persistence | 4 | - | - | |
| API Endpoints | 10 | - | - | |
| Error Handling | 3 | - | - | |
| Concurrent Users | 2 | - | - | |
| Edge Cases | 5 | - | - | |
| UI/UX | 4 | - | - | |
| Browser Compatibility | 3 | - | - | |
| **TOTAL** | **61** | **-** | **-** | |

---

## Known Issues to Track

- [ ] Issue #1: [Description]
- [ ] Issue #2: [Description]
- [ ] Issue #3: [Description]

---

## Testing Notes

- [ ] All tests completed without critical failures
- [ ] All tests completed with minor fixes required
- [ ] All tests completed successfully

**Tested By**: ________________
**Date**: ________________
**Notes**: ____________________________________________________________________
