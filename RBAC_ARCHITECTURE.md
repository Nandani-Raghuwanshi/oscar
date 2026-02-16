# RBAC System Architecture Overview

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐                                            │
│  │   Auth Context   │──┐ Manages user state, tokens, roles      │
│  └──────────────────┘  │                                        │
│         Stores:        │ • user data                            │
│         • token        │ • loginStatus                          │
│         • user         │ • role-based computed properties       │
│         • loginStatus  │                                        │
│                        │                                        │
│                    ┌───┘                                        │
│                    │                                            │
│  ┌────────────────────────────────┐                            │
│  │      Protected Routes           │                            │
│  │  (ProtectedRoute component)     │                            │
│  ├────────────────────────────────┤                            │
│  │ • Checks authentication         │                            │
│  │ • Checks user status            │                            │
│  │ • Checks user role              │                            │
│  │ • Routes access accordingly     │                            │
│  └────────────────────────────────┘                            │
│         ↓           ↓           ↓                               │
│  ┌────────────┐ ┌─────────┐ ┌──────────┐                      │
│  │ Dashboard  │ │ Referral│ │Admin Panel│                      │
│  └────────────┘ └─────────┘ └──────────┘                      │
│  (Approved)    (Approved)   (Admin Only)                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              Components (Auth Pages)                      │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │  Login.jsx  │  Signup.jsx  │  Nav.jsx  │  AdminPanel.jsx   │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                    API Layer (api.js)                    │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │  authAPI           │          adminAPI                     │
│  │  • signup()        │  • getPendingUsers()                  │
│  │  • login()         │  • listAllUsers()                     │
│  │  • logout()        │  • approveUser()                      │
│  │                    │  • rejectUser()                       │
│  │                    │  • reactivateUser()                   │
│  │                    │  • getAnalytics()                     │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                  │
└────────────────────────┬──────────────────────────────────────┘
                         │
                         │ HTTPS/REST API Calls
                         │
┌────────────────────────┴──────────────────────────────────────┐
│                     BACKEND (Flask)                            │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                  Route Handlers                          │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │                                                          │ │
│  │  auth_routes.py          admin_routes.py               │ │
│  │  • signup()              • get_pending_users()          │ │
│  │  • login()               • list_all_users()            │ │
│  │  • logout()              • approve_user()              │ │
│  │                          • reject_user()               │ │
│  │                          • reactivate_user()           │ │
│  │                          • get_analytics()             │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                         ↑                                      │
│                         │                                      │
│  ┌──────────────────────┴─────────────────────────────────┐ │
│  │            Auth Middleware (Decorators)               │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │  @login_required      verify_token() helper           │ │
│  │  @admin_required      JWT validation                  │ │
│  │  @role_required()     Token extraction                │ │
│  └──────────────────────────────────────────────────────┘ │
│                         ↑                                      │
│                         │                                      │
│  ┌──────────────────────┴─────────────────────────────────┐ │
│  │              Request Validation                        │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │  • Email validation & uniqueness                      │ │
│  │  • Password strength validation                       │ │
│  │  • Role validation                                    │ │
│  │  • Status validation                                  │ │
│  └──────────────────────────────────────────────────────┘ │
│                         ↑                                      │
│                         │                                      │
└────────────────────────┬──────────────────────────────────────┘
                         │
┌────────────────────────┴──────────────────────────────────────┐
│                   DATABASE (MongoDB)                           │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │          users Collection Schema                        │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │                                                          │ │
│  │  _id, email, password (hashed), full_name               │ │
│  │  role: "user" | "advocate" | "brand_advocate" | "admin" │
│  │  status: "pending" | "approved" | "rejected"            │ │
│  │  advocate_type: "project_advocate" | "brand_advocate"   │ │
│  │  is_active: boolean                                      │ │
│  │  created_at, updated_at (timestamps)                    │ │
│  │  approved_at, approved_by (admin info)                  │ │
│  │  rejected_at, rejected_by, rejection_reason             │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## User Authentication Flow

### Regular User Signup & Login Flow
```
┌──────────────┐
│   User       │
│   Signup     │
└──────┬───────┘
       │ (email, password, name, role: "user")
       ▼
┌─────────────────────────────────────────┐
│ Frontend: Signup Component              │
│ - Validate form fields                  │
│ - Check password strength               │
└──────────┬──────────────────────────────┘
            │
            │ POST /api/auth/signup
            ▼
┌─────────────────────────────────────────┐
│ Backend: signup() Route                 │
│ - Validate email format                 │
│ - Check email is unique                 │
│ - Validate password strength            │
│ - Hash password (bcrypt)                │
│ - role must be valid                    │
└──────────┬──────────────────────────────┘
            │
            │ Create user with status="approved"
            ▼
┌─────────────────────────────────────────┐
│ MongoDB: Insert User                    │
│ _id, email, password, name              │
│ role: "user"                            │
│ status: "approved"  ◄─ AUTO-APPROVED    │
│ created_at, is_active: true             │
└──────────┬──────────────────────────────┘
           │
           │ Response: 201 + JWT Token
           ▼
┌─────────────────────────────────────────┐
│ Frontend: AuthContext                   │
│ - Store token in localStorage           │
│ - Store user data                       │
│ - isAuthenticated = true                │
│ - Redirect to /dashboard                │
└─────────────────────────────────────────┘
```

### Advocate Signup & Admin Approval Flow
```
┌──────────────┐
│   Advocate   │
│   Signup     │
└──────┬───────┘
       │ (email, password, name, role: "advocate", type: "project_advocate")
       ▼
┌─────────────────────────────────────────┐
│ Frontend: Signup Component              │
│ - Select "Project Advocate"             │
│ - Select "project_advocate" type        │
│ - Validate form                         │
└──────────┬──────────────────────────────┘
           │
           │ POST /api/auth/signup
           ▼
┌─────────────────────────────────────────┐
│ Backend: signup() Route                 │
│ - Validate all fields                   │
│ - Hash password                         │
└──────────┬──────────────────────────────┘
           │
           │ Create user with status="pending"
           ▼
┌─────────────────────────────────────────┐
│ MongoDB: Insert User                    │
│ _id, email, password, name              │
│ role: "advocate"                        │
│ advocate_type: "project_advocate"       │
│ status: "pending"  ◄─ PENDING APPROVAL  │
│ created_at, is_active: true             │
└──────────┬──────────────────────────────┘
           │
           │ Response: 201 (NO TOKEN)
           ▼
┌─────────────────────────────────────────┐
│ Frontend: Show "Pending Approval"       │
│ - Display success message               │
│ - No auto-redirect                      │
│ - Email stored in localStorage          │
└──────────┬──────────────────────────────┘
           │
           │ Admin Reviews Registration
           │ (Login as admin)
           ▼
┌─────────────────────────────────────────┐
│ Admin: /admin Panel                     │
│ - Click "Pending Users" tab             │
│ - Review applicant                      │
│ - Click "Approve"                       │
└──────────┬──────────────────────────────┘
           │
           │ POST /api/admin/users/:id/approve
           │ @admin_required
           │ Authorization: Bearer <admin_token>
           ▼
┌─────────────────────────────────────────┐
│ Backend: approve_user() Route           │
│ - Verify admin by @admin_required       │
│ - Find user by ID                       │
│ - Update status to "approved"           │
│ - Record approver info                  │
└──────────┬──────────────────────────────┘
           │
           │ MongoDB: Update User
           │ status: "pending" → "approved"
           │ approved_by: admin_id
           │ approved_at: timestamp
           ▼
┌─────────────────────────────────────────┐
│ Response: 200 + Updated User Object     │
├─────────────────────────────────────────┤
│ Frontend: Show "Approved!" notification │
│ - Green success message                 │
│ - Auto-dismiss after 3 seconds          │
└─────────────────────────────────────────┘
           │
           │ Advocate Can Now Login
           ▼
┌──────────────────────────────────────────┐
│ Advocate: Login                          │
│ POST /api/auth/login                     │
│ email: advocate email, password: password│
└──────────┬───────────────────────────────┘
           │
           │ Backend: validate credentials
           │ Check status = "approved" ✓
           ▼
┌──────────────────────────────────────────┐
│ Response: 200 + JWT Token                │
│ - Token generated                        │
│ - User data with status="approved"       │
└──────────┬───────────────────────────────┘
           │
           │ Frontend: AuthContext
           │ - Store token
           │ - Store user
           │ - Redirect to /dashboard
           ▼
┌──────────────────────────────────────────┐
│ Full Access Granted                      │
│ - Can access /dashboard                  │
│ - Can access /referral                   │
│ - Can access all features                │
└──────────────────────────────────────────┘
```

### Rejection Flow
```
┌──────────────────────────────────┐
│ Admin Reviews Pending User       │
│ /admin → Pending Users Tab       │
│ Click "Review" on user           │
└──────────┬──────────────────────┘
           │
           │ Click "Reject"
           ▼
┌──────────────────────────────────┐
│ Modal Opens: Enter Reason        │
│ Reason: "Does not meet standards"│
│ (min 5 characters required)      │
│ Click "Confirm"                  │
└──────────┬──────────────────────┘
           │
           │ POST /api/admin/users/:id/reject
           │ {reason: "Does not meet standards"}
           ▼
┌──────────────────────────────────┐
│ Backend: reject_user()           │
│ - Verify admin                   │
│ - Check reason length            │
│ - Update user status             │
└──────────┬──────────────────────┘
           │
           │ MongoDB: Update User
           │ status: "rejected"
           │ rejection_reason: "..."
           │ rejected_by: admin_id
           │ rejected_at: timestamp
           ▼
┌──────────────────────────────────┐
│ Response: 200 Success            │
│ - Show "User Rejected!" message  │
│ - Remove from pending list       │
└──────────┬──────────────────────┘
           │
           │ Rejected User Tries Login
           ▼
┌──────────────────────────────────┐
│ POST /api/auth/login             │
│ Check status = "rejected"        │
└──────────┬──────────────────────┘
           │
           │ Return 403 Forbidden
           │ "Your registration has been rejected"
           ▼
┌──────────────────────────────────┐
│ Frontend: Login Form             │
│ - Show red error message         │
│ - Form disabled (opacity 0.6)    │
│ - No access to any features      │
└──────────────────────────────────┘
```

---

## Protected Route Access Control

```
User Attempts to Access /dashboard
                │
                ▼
┌──────────────────────────────────────────┐
│ ProtectedRoute Component Checks:         │
├──────────────────────────────────────────┤
│ 1. Is user authenticated?                │
│    (has valid token in localStorage)     │
└──────────┬───────────────────────────────┘
           │
    ┌──────┴───────┐
    │              │
   NO          YES │
    │              ▼
    │      Is user status "rejected"?
    │              │
    │        ┌─────┴─────┐
    │       YES          NO
    │        │            │
    │        │            ▼
    │        │     Is user status "pending"?
    │        │            │
    │        │       ┌────┴─────┐
    │        │      YES        NO
    │        │       │          │
    │        ▼       ▼          ▼
    │    ┌─────────────────────────────────┐
    │    │ Check Role (if required)         │
    │    ├─────────────────────────────────┤
    │    │ Is user role = required role?   │
    │    └──────┬──────────────────────────┘
    │           │
    │      ┌────┴────┐
    │     YES       NO
    │      │         │
    │      │         ▼
    │      │    ┌─────────────────┐
    │      │    │  Show Access    │
    │      │    │  Denied Page    │
    │      │    │  (Admin Only)   │
    │      │    └─────────────────┘
    │      │
    │      ▼
    │    ┌─────────────────────┐
    │    │  Allow Access ✓     │
    │    │  Render Component   │
    │    └─────────────────────┘
    │
    ▼
┌──────────────────────────────┐
│ Redirect to /login           │
└──────────────────────────────┘
    ▲                    ▲
    │                    │
    └────────────────────┘
         │
    ┌────┴──────────────────────┐
    │                           │
    ▼                           ▼
┌──────────────────────┐  ┌──────────────────────┐
│ Show Rejection Page  │  │ Show Pending Page     │
│ "❌ Access Denied"  │  │ "⏳ Pending Approval" │
│ "Registration       │  │ "Your registration   │
│ rejected"           │  │ is waiting for       │
│ "Contact support"   │  │ admin review"        │
└──────────────────────┘  └──────────────────────┘
```

---

## Token Storage and Persistence

```
┌──────────────────────────────────────────┐
│ User Logs In Successfully                 │
│ Response includes JWT token              │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ AuthContext: Store in localStorage       │
│ Key: "token"                              │
│ Value: "eyJhbGc..."  (JWT)                │
│                                          │
│ Also store:                              │
│ Key: "user"                              │
│ Value: {user data JSON}                  │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ Page Refresh/Reload                      │
│ useEffect in AuthContext runs            │
│ Checks localStorage for token            │
└──────────┬───────────────────────────────┘
           │
    ┌──────┴──────┐
    │             │
   NO            YES
    │             │ Found token
    │             │
    │             ▼
    │      ┌─────────────────────┐
    │      │ Verify Token Valid  │
    │      │ Send to backend for │
    │      │ verification        │
    │      └────┬────────────────┘
    │           │
    │      ┌────┴────┐
    │     VALID    INVALID
    │      │         │
    │      │         ▼
    │      │    ┌──────────────────┐
    │      │    │ Clear localStorage│
    │      │    │ Redirect /login    │
    │      │    └──────────────────┘
    │      │
    │      ▼
    │   ┌─────────────────────────┐
    │   │ Restore User State      │
    │   │ isAuthenticated = true  │
    │   │ user = {data}           │
    │   └─────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────┐
│ User Remains Logged In ✓                 │
│ Protected routes accessible             │
│ No need to login again                   │
└──────────────────────────────────────────┘
```

---

## Admin Panel Workflow

```
┌──────────────────────────────────┐
│ Admin Logs In                    │
│ role: "admin", status: "approved"│
└──────────┬──────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ Navigate to /admin               │
│ ProtectedRoute checks:           │
│ - authenticated? ✓              │
│ - role="admin"? ✓               │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│ AdminPanel Component Loads              │
│ Three tabs available                    │
└──────────┬──────────────────────────────┘
           │
    ┌──────┼──────┬──────────┐
    │      │      │          │
    ▼      ▼      ▼          ▼
┌────────┐ ┌─────────┐ ┌───────────┐
│Pending │ │All Users│ │Analytics  │
│Users   │ │         │ │           │
└────────┘ └─────────┘ └───────────┘
    │
    │ GET /api/admin/pending-users
    ▼
┌──────────────────────────────────────────┐
│ Display Pending Users Table              │
│ Columns: Name, Email, Role, Applied, ...│
│ Buttons: Review (each user)              │
└──────────┬───────────────────────────────┘
           │
           │ Click "Review" Button
           ▼
┌──────────────────────────────────────────┐
│ Modal Opens: User Details                │
│ - Full name                              │
│ - Email address                          │
│ - Role                                   │
│ - Advocate Type (if applicable)          │
│ - Applied date/time                      │
│ - Action buttons: Approve, Reject, Close │
└──────────┬───────────────────────────────┘
           │
    ┌──────┴──────────┬──────────┐
    │                 │          │
    ▼                 ▼          ▼
┌────────────┐  ┌───────────┐  ┌──────┐
│  Approve   │  │  Reject   │  │Close │
└────┬───────┘  └───┬───────┘  └──────┘
     │              │
     │              │  Textarea appears
     │              │  "Enter rejection reason"
     │              │  (min 5 chars)
     │              │
     ▼              ▼
POST /api/admin/users/:id/approve   POST /api/admin/users/:id/reject
                                    {reason: "..."}
     │              │
     ▼              ▼
Backend validates  Backend validates
Updates user       Updates user
status="approved"  status="rejected"

     │              │
     ▼              ▼
┌────────────┐  ┌──────────────────┐
│ 200 OK     │  │ 200 OK           │
│ User list  │  │ User list        │
│ updated    │  │ updated          │
└────────────┘  └──────────────────┘
     │              │
     ▼              ▼
┌─────────────────────────────────┐
│ Show Success Notification       │
│ - Green box                     │
│ - "User approved!" or "rejected"│
│ - Auto-dismiss (3 sec)          │
└─────────────────────────────────┘
```

---

## Status Code Response Guide

```
POST /api/auth/signup
├─ 201 Created: User created successfully (regular user with token)
├─ 201 Created: User created, pending approval (advocate, no token)
├─ 400 Bad Request: Invalid form data
├─ 409 Conflict: Email already registered
└─ 500 Server Error: Database error

POST /api/auth/login
├─ 200 OK: Login successful, user approved
│         Response includes token
├─ 202 Accepted: User exists but pending approval
│              Response has NO token
├─ 403 Forbidden: User rejected
│                Response has error message
├─ 401 Unauthorized: Invalid credentials
└─ 500 Server Error: Server issue

POST /api/admin/users/{id}/approve
├─ 200 OK: User approved
├─ 403 Forbidden: Not admin
├─ 404 Not Found: User not found
└─ 500 Server Error: Database error

GET /api/admin/pending-users
├─ 200 OK: List of pending users
├─ 403 Forbidden: Not admin
└─ 500 Server Error: Server issue
```

---

## Summary

The RBAC system provides:
- ✅ Clear role-based access control
- ✅ Status-based user workflows
- ✅ Admin approval functionality
- ✅ Protected routes with appropriate messages
- ✅ Token-based authentication
- ✅ Session persistence
- ✅ Comprehensive error handling

All components work together to provide a secure, role-based access control system with admin approval workflows.
