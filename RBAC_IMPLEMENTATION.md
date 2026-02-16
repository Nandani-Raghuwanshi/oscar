# RBAC (Role-Based Access Control) Implementation Guide

## Overview

The BuiltCred application now has a complete Role-Based Access Control (RBAC) system with user verification and admin approval workflows.

## User Roles

### 1. **Regular User** (`user`)
- Can browse and participate in referral opportunities
- Auto-approved on signup
- Full access to all user features
- **Status**: `approved`

### 2. **Project Advocate** (`advocate`)
- Refers projects and builds networks
- Requires admin approval before access
- Access to advocate-specific features
- **Status**: `pending` → `approved` (after admin approval)

### 3. **Brand Advocate** (`brand_advocate`)
- Represents a brand as an advocate
- Requires admin approval before access
- Similar features as Project Advocate
- **Status**: `pending` → `approved` (after admin approval)

### 4. **Admin** (`admin`)
- Full system access
- Can approve/reject user registrations
- View analytics and manage users
- Can only be created by system administrators
- **Status**: Must be set manually in database

## User Status Workflow

### Status States:
- **`approved`**: User can access all features. Has valid authentication token.
- **`pending`**: User registration submitted, waiting for admin approval. Cannot login fully.
- **`rejected`**: Registration was rejected. Cannot login or access features.

### Signup Flow by Role:

#### Regular User Signup:
```
User provides: Full name, Email, Password, Password confirmation
Account Type: "Regular User"
↓
Account created with status = "approved"
↓
Token generated automatically
↓
Redirected to dashboard
```

#### Advocate/Brand Advocate Signup:
```
User provides: Full name, Email, Password, Password confirmation
Account Type: "Project Advocate" or "Brand Advocate"
Advocate Type: Select from dropdown
↓
Account created with status = "pending"
↓
No token generated
↓
Shown "Pending approval" message
↓
Sent to waiting page until admin reviews
```

### Login Flow by Status:

#### Approved User:
```
Valid email/password
↓
status = "approved"
↓
Token generated
↓
Full access granted
↓
Redirect to dashboard
```

#### Pending User:
```
Valid email/password
↓
status = "pending"
↓
No token generated
↓
Show "pending approval" message
↓
Cannot access protected pages
```

#### Rejected User:
```
Valid email/password
↓
status = "rejected"
↓
Deny access
↓
Show "registration rejected" message
↓
Cannot login
```

## Admin Approval System

### Admin Dashboard Access:
- **URL**: `/admin`
- **Auth**: Admin role + approved status required
- **Protected by**: `ProtectedRoute` component with `requiredRole="admin"`

### Admin Features:

#### 1. Pending Users Tab
- List all pending registrations
- Filter by role
- Sort by date or name
- Review user details
- Approve or reject registration

#### 2. All Users Tab
- View all users in the system
- Filter by:
  - Role (User, Advocate, Brand Advocate, Admin)
  - Status (Approved, Pending, Rejected)
- Search by email or name
- View user details including registration date

#### 3. Analytics Tab
- Total users count
- Approved users count
- Pending registrations count
- Rejected users count
- Total advocates
- Total referrals

### Admin Actions:

#### Approve User
```
Admin clicks "Review" on pending user
↓
Opens user detail modal
↓
Admin clicks "Approve"
↓
User status changed to "approved"
↓
Email notification sent (future feature)
↓
User can now login and access features
```

#### Reject User
```
Admin clicks "Review" on pending user
↓
Opens user detail modal
↓
Admin clicks "Reject"
↓
Admin enters rejection reason (required, min 5 chars)
↓
Admin confirms rejection
↓
User status changed to "rejected"
↓
Rejection reason stored in database
↓
User sees rejection message on login
```

#### Reactivate Rejected User
```
Admin opens rejected user record
↓
Admin selects "Reactivate"
↓
User status changed back to "pending"
↓
User can reapply (future feature)
```

## Protected Route Component

The `ProtectedRoute` component handles access control:

```jsx
<ProtectedRoute requiredRole="admin">
  <AdminPanel />
</ProtectedRoute>
```

### Access Control Rules:

1. **Not Authenticated**:
   - Redirect to `/login`

2. **Pending Approval**:
   - Show "Pending Approval" page
   - Explain what happens next
   - Cannot access any protected pages

3. **Rejected**:
   - Show "Access Denied" page
   - No access to any features
   - Suggest contacting support

4. **Approved without role restriction**:
   - Full access to page

5. **Approved with role restriction**:
   - Check if user has required role
   - If yes: Access granted
   - If no: Show "Access Denied" page

## API Endpoints

### Authentication Endpoints

#### POST `/api/auth/signup`
```json
Request: {
  "email": "user@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe",
  "role": "advocate",
  "advocate_type": "project_advocate"
}

Response (Approved): {
  "message": "User registered successfully",
  "user_id": "...",
  "token": "JWT_TOKEN_HERE",
  "user": { "user_id", "email", "full_name", "role", "status" }
}

Response (Pending): {
  "message": "Registration submitted. Please wait for admin approval.",
  "user_id": "...",
  "user": { "user_id", "email", "full_name", "role", "status" }
}
```

#### POST `/api/auth/login`
```json
Request: {
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response (Approved): {
  "message": "Login successful",
  "token": "JWT_TOKEN_HERE",
  "user": { ... },
  "status": "approved"
}

Response (Pending): {
  "message": "Your registration is pending admin approval",
  "status": "pending",
  "user": { ... }
}

Response (Rejected): {
  "message": "Your registration has been rejected",
  "status": "rejected",
  "user": { ... }
}
```

### Admin Endpoints

#### GET `/api/admin/pending-users`
```json
Query: ?skip=0&limit=20&role=advocate

Response: {
  "users": [
    {
      "user_id": "...",
      "email": "...",
      "full_name": "...",
      "role": "advocate",
      "advocate_type": "project_advocate",
      "status": "pending",
      "created_at": "2026-02-16T..."
    }
  ],
  "total": 5
}
```

#### GET `/api/admin/users`
```json
Query: ?skip=0&limit=20&role=advocate&status=approved&search=john

Response: {
  "users": [...],
  "total": 10
}
```

#### POST `/api/admin/users/:user_id/approve`
```json
Response: {
  "message": "User approved successfully",
  "user": {
    "user_id": "...",
    "status": "approved",
    "approved_at": "2026-02-16T..."
  }
}
```

#### POST `/api/admin/users/:user_id/reject`
```json
Request: {
  "reason": "Application does not meet requirements"
}

Response: {
  "message": "User rejected successfully",
  "user": {
    "user_id": "...",
    "status": "rejected",
    "rejection_reason": "...",
    "rejected_at": "2026-02-16T..."
  }
}
```

#### POST `/api/admin/users/:user_id/reactivate`
```json
Response: {
  "message": "User reactivated and pending approval again",
  "user": {
    "user_id": "...",
    "status": "pending"
  }
}
```

#### GET `/api/admin/analytics`
```json
Response: {
  "total_users": 50,
  "approved_users": 45,
  "pending_users": 3,
  "rejected_users": 2,
  "total_advocates": 20,
  "total_referrals": 150
}
```

## AuthContext API

The `AuthContext` provides these properties:

```javascript
{
  user: {                     // Current user object
    user_id: "...",
    email: "...",
    full_name: "...",
    role: "user|advocate|brand_advocate|admin",
    status: "pending|approved|rejected"
  },
  isLoading: false,          // Loading state
  error: null,               // Error message
  loginStatus: null|"pending"|"approved"|"rejected",
  isAuthenticated: true,     // User is logged in and approved
  isAdmin: false,            // User is admin
  isAdvocate: true,          // User is advocate
  isPendingApproval: false,  // User is waiting for approval
  isRejected: false,         // User registration rejected
  
  // Methods:
  login(email, password),
  signup(email, password, fullName, role, advocateType),
  logout()
}
```

## Navigation Updates

The navigation bar now shows:

- **Not Authenticated**:
  - Home, About, Login, Sign Up

- **Authenticated & Pending**:
  - Home, About, ⏳ Pending badge, Logout

- **Authenticated & Rejected**:
  - Home, About, ❌ Rejected badge, Logout

- **Authenticated & Approved (Regular User)**:
  - Home, Referral menu, Dashboard menu, About, User menu → Logout

- **Authenticated & Approved (Admin)**:
  - Home, Referral menu, Dashboard menu, Admin Panel, About, User menu → Logout

## Testing the RBAC System

### Test Case 1: Regular User Flow
```
1. Go to /signup
2. Select "Regular User" account type
3. Fill form and submit
4. Should show success message and redirect to /dashboard
5. Can access all features immediately
```

### Test Case 2: Advocate Pending Approval Flow
```
1. Go to /signup
2. Select "Project Advocate" account type
3. Select "project_advocate" advocate type
4. Fill form and submit
5. Should show "pending approval" message
6. Go to /login with same credentials
7. Should show "pending approval" message
8. Cannot access /dashboard (redirected to pending page)
```

### Test Case 3: Admin Approval Flow
```
1. Create user as Test Case 2
2. Go to /admin (requires admin account)
3. Click "Pending Users" tab
4. Click "Review" on the pending user
5. Click "Approve"
6. Logout
7. Login as the approved advocate
8. Can access /dashboard and all features
```

### Test Case 4: Admin Rejection Flow
```
1. Create user as Test Case 2
2. Go to /admin
3. Click "Pending Users" tab
4. Click "Review" on the pending user
5. Click "Reject"
6. Enter rejection reason
7. Click "Confirm Rejection"
8. Logout
9. Try login as rejected user
10. Should show "registration rejected" message
11. Cannot access any features
```

### Test Case 5: Admin Reactivation Flow
```
1. Complete Test Case 4 (user is rejected)
2. Go to /admin
3. Go to "All Users" tab
4. Filter by Status = "Rejected"
5. Find rejected user
6. Click review
7. Click "Reactivate"
8. User status returns to "pending"
9. Admin can approve again
```

### Test Case 6: Protected Routes
```
1. Logout (unauthenticated)
2. Try to access /dashboard
3. Should redirect to /login

Then:
1. Login as pending user
2. Try to access /dashboard
3. Should show "pending approval" page

Then:
1. Logout
2. Login as approved regular user
3. Can access /dashboard

Finally:
1. Login as approved advocate
2. Can access /dashboard
3. Try to access /admin
4. Should show "admin access required" page
```

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, lowercase),
  full_name: String,
  password: String (hashed),
  role: "user" | "advocate" | "brand_advocate" | "admin",
  status: "pending" | "approved" | "rejected",
  advocate_type: "project_advocate" | "brand_advocate" | null,
  is_active: Boolean,
  created_at: DateTime,
  updated_at: DateTime,
  approved_at: DateTime | null,
  approved_by: ObjectId | null,  // Admin who approved
  rejected_at: DateTime | null,
  rejected_by: ObjectId | null,  // Admin who rejected
  rejection_reason: String | null,
  reactivated_at: DateTime | null,
  reactivated_by: ObjectId | null
}
```

## Middleware Auth Protection

The backend uses auth middleware decorators:

```python
@admin_required
def admin_only_endpoint():
    # Only accessible to approved admins
    pass

@role_required('advocate', 'brand_advocate')
def advocate_endpoint():
    # Only accessible to approved advocates
    pass

@login_required
def authenticated_endpoint():
    # Accessible to any authenticated, approved user
    pass
```

## Error Handling

### 401 Unauthorized
- Missing or invalid token
- Token has expired

### 403 Forbidden
- Account is inactive
- Account is pending approval
- User is rejected
- User doesn't have required role

### 202 Accepted
- User exists but is pending approval
- Special status code indicating "waiting for approval"

## What's Covered

✅ User registration with role selection
✅ Email and password validation
✅ Password strength requirements
✅ Admin approval/rejection workflow
✅ Different login flows for different statuses
✅ Protected routes based on authentication
✅ Role-based access control
✅ Admin dashboard for user management
✅ Pending user notifications
✅ Rejection reason tracking
✅ User reactivation capability
✅ Navigation updates based on status
✅ Status badges in navigation
✅ Analytics dashboard
✅ Comprehensive error handling
✅ All possible situation coverage

## Future Enhancements

- Email notifications for approval/rejection
- Bulk user operations
- User role migration
- Session management
- IP-based rate limiting
- Audit logging
- Two-factor authentication
