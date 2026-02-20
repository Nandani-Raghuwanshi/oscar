# Phase 2: Role-Based Routing & Navigation Setup

> **Status:** ✅ Frontend routing and navigation complete  
> **Date:** February 20, 2026

## Overview

Phase 2 begins with establishing role-based routing and separate navigation interfaces for each user type. This foundation enables seamless user experience tailored to different roles: Admin, Builder/Developer, CRM/Sales, and Advocates (Project & Brand).

## Architecture

### Role-Based Outlet Structure

Each role has a dedicated outlet that wraps child routes with the appropriate navbar:

```
/admin/*          → AdminOutlet → AdminNavbar
/builder/*        → BuilderOutlet → BuilderNavbar
/crm/*            → CRMOutlet → CRMNavbar
/advocate/*       → AdvocateOutlet → AdvocateNavbar
```

### Component Hierarchy

```
App (Router & Routes)
├── AuthRoutes (/login, /register, /dashboard)
├── AdminOutlet (ProtectedRoute: admin)
│   ├── AdminNavbar
│   ├── Navbar links: Dashboard, Users, Projects, Escalations
│   └── Child routes...
├── BuilderOutlet (ProtectedRoute: builder)
│   ├── BuilderNavbar
│   ├── Navbar links: Dashboard, Customers, Reports, Escalations
│   └── Child routes...
├── CRMOutlet (ProtectedRoute: crm_manager, sales_associate)
│   ├── CRMNavbar
│   ├── Navbar links: Dashboard, Advocates, Referrals, Pipeline, Payments
│   └── Child routes...
└── AdvocateOutlet (ProtectedRoute: project_advocate, brand_advocate)
    ├── AdvocateNavbar
    ├── Navbar links: Dashboard, Referrals, Rewards, Docs
    └── Child routes...
```

## Components Created

### Navigation Components ([`Components/navbars/`](../../client/src/components/navbars/))

- **AdminNavbar.jsx**: Blue gradient navbar with Admin-specific links
- **BuilderNavbar.jsx**: Green gradient navbar with Builder-specific links
- **CRMNavbar.jsx**: Purple gradient navbar with CRM/Sales-specific links
- **AdvocateNavbar.jsx**: Amber gradient navbar with Advocate-specific links

### Layout Components

- **RoleBasedLayout.jsx**: Main layout wrapper that selects the correct navbar based on user role

### Outlet Pages ([`pages/outlets/`](../../client/src/pages/outlets/))

- **AdminOutlet.jsx**
- **BuilderOutlet.jsx**
- **CRMOutlet.jsx**
- **AdvocateOutlet.jsx**

### Dashboard Pages ([`pages/dashboards/`](../../client/src/pages/dashboards/))

- **AdminDashboard.jsx**: Total Users, Active Projects, Escalations stats
- **BuilderDashboard.jsx**: Total Customers, Active Referrals, Conversions stats
- **CRMDashboard.jsx**: Advocates, Active Referrals, Conversions stats
- **AdvocateDashboard.jsx**: Referrals Sent, Conversions, Rewards Earned stats

### Feature Pages

**Admin Pages** ([`pages/admin/`](../../client/src/pages/admin/))
- AdminUsersPage.jsx
- AdminProjectsPage.jsx
- AdminEscalationsPage.jsx

**Builder Pages** ([`pages/builder/`](../../client/src/pages/builder/))
- BuilderCustomersPage.jsx
- BuilderReportsPage.jsx
- BuilderEscalationsPage.jsx

**CRM Pages** ([`pages/crm/`](../../client/src/pages/crm/))
- CRMAdvocatesPage.jsx
- CRMReferralsPage.jsx
- CRMPipelinePage.jsx
- CRMPaymentsPage.jsx

**Advocate Pages** ([`pages/advocate/`](../../client/src/pages/advocate/))
- AdvocateReferralsPage.jsx
- AdvocateRewardsPage.jsx
- AdvocateDocumentationPage.jsx

## Updated Components

### ProtectedRoute.jsx

Enhanced to support multiple role specification methods:

```javascript
<ProtectedRoute requiredRole="admin" />
<ProtectedRoute requiredRoles={['crm_manager', 'sales_associate']} />
<ProtectedRoute allowedRoles={['project_advocate', 'brand_advocate']} />
```

### App.jsx

Refactored routing structure with role-based outlets and nested routes:
  - 4 main outlet routes (admin, builder, crm, advocate)
- 13 child routes across all roles
- Role-based access control on each outlet

## Features Implemented

✅ **Auth Persistence**: Users stay logged in and role is maintained  
✅ **Role Detection**: System automatically detects user role on login  
✅ **Navbar Switching**: Different navbar displayed based on user role  
✅ **Route Protection**: Unauthorized role access redirects to dashboard  
✅ **Responsive Design**: All navbars and pages use Tailwind CSS responsive classes  
✅ **Placeholder Navigation**: All role-specific navigation links work

## Testing the Setup

### 1. Admin User
```bash
npm start
# Login with admin credentials
# Verify: Blue navbar appears with "Admin" badge
# Test: Click Dashboard, Users, Projects, Escalations
```

### 2. Builder User
```bash
# Login with builder credentials
# Verify: Green navbar appears with "Builder/Developer" badge
# Test: Click Dashboard, Customers, Reports, Escalations
```

### 3. CRM User
```bash
# Login with crm_manager or sales_associate credentials
# Verify: Purple navbar appears with "CRM/Sales" badge
# Test: Click Dashboard, Advocates, Referrals, Pipeline, Payments
```

### 4. Advocate User
```bash
# Login with project_advocate or brand_advocate credentials
# Verify: Amber navbar appears with role-specific badge
# Test: Click Dashboard, Referrals, Rewards, Docs
```

## Next Steps (Phase 2 - Backend)

1. **User Management API**: Create endpoints for user CRUD operations
   - POST `/api/users` - Create user
   - GET `/api/users` - List users with filters
   - GET `/api/users/:id` - Get user details
   - PUT `/api/users/:id` - Update user
   - DELETE `/api/users/:id` - Delete user

2. **Role & Permission Management**: Implement role-level controls
   - Role assignment endpoints
   - Permission checking middleware

3. **Project Management API**: Create project CRUD endpoints
4. **Audit Logging**: Log all admin actions
5. **Dashboard Stats API**: Create aggregation endpoints for stats

## File Structure

```
client/src/
├── components/
│   ├── navbars/          # NEW: Role-specific navbars
│   │   ├── AdminNavbar.jsx
│   │   ├── BuilderNavbar.jsx
│   │   ├── CRMNavbar.jsx
│   │   └── AdvocateNavbar.jsx
│   ├── RoleBasedLayout.jsx  # NEW: Layout selector
│   └── ProtectedRoute.jsx   # UPDATED: supports multiple role configs
├── pages/
│   ├── outlets/          # NEW: Role-based outlet wrappers
│   │   ├── AdminOutlet.jsx
│   │   ├── BuilderOutlet.jsx
│   │   ├── CRMOutlet.jsx
│   │   └── AdvocateOutlet.jsx
│   ├── dashboards/       # NEW: Role-specific dashboards
│   │   ├── AdminDashboard.jsx
│   │   ├── BuilderDashboard.jsx
│   │   ├── CRMDashboard.jsx
│   │   └── AdvocateDashboard.jsx
│   ├── admin/            # NEW: Admin feature pages
│   ├── builder/          # NEW: Builder feature pages
│   ├── crm/              # NEW: CRM feature pages
│   ├── advocate/         # NEW: Advocate feature pages
│   └── ... (existing auth pages)
└── App.jsx               # UPDATED: role-based routing
```

## Known Limitations & TODOs

- [ ] Dashboard stats are placeholders (API integration pending)
- [ ] Feature pages show "coming soon" messages
- [ ] Mobile navbar (hamburger menu) not yet implemented
- [ ] User profile/settings pages not yet created
- [ ] Logout functionality available but profile page still links to old dashboard

## Related Documentation

- [Architecture Overview](../ARCHITECTURE.md)
- [To-Do List](./to-do-list.md)
