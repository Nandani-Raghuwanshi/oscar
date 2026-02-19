# Route Permission Reference Guide

## Authentication States
- **Not Authenticated**: No token
- **Authenticated**: Valid token, user exists and is approved
- **Advocate**: Authenticated user with role='advocate' or 'brand_advocate'
- **Admin**: Authenticated user with role='admin'

---

## Auth Routes

| Method | Path | Auth | Role | Notes |
|--------|------|------|------|-------|
| POST | /auth/signup | None | Any | Public registration |
| POST | /auth/login | None | Any | Public login |
| POST | /auth/logout | Required | Any | Logout endpoint |

---

## User Routes

| Method | Path | Auth | Role | Notes |
|--------|------|------|------|-------|
| GET | /users/profile | Required | Any | Get own profile |
| PUT | /users/profile | Required | Any | Update own profile |
| POST | /users/reset-password | Required | Any | Change password |

---

## Advocate Routes

| Method | Path | Auth | Role | Notes |
|--------|------|------|------|-------|
| POST | /advocates/register | Required | Advocate | Register as advocate |
| GET | /advocates/{id} | Required | Advocate | Get own advocate details (ownership validated) |
| GET | /advocates/user/{user_id} | Required | Advocate | Get own advocates (user check inline) |
| PUT | /advocates/{id} | Required | Advocate | Update own advocate (ownership validated) |
| GET | /advocates/{id}/stats | Required | Advocate | Get own advocate stats (ownership validated) |
| POST | /advocates/{id}/pause | Required | Admin | Pause an advocate (ADMIN ONLY) |
| POST | /advocates/{id}/blacklist | Required | Admin | Blacklist an advocate (ADMIN ONLY) |

**Ownership Validation**: User must own the advocate_id they're accessing

---

## Referral Routes

| Method | Path | Auth | Role | Notes |
|--------|------|------|------|-------|
| POST | /referrals/create-link | Required | Advocate | Create referral link (ownership validated) |
| GET | /referrals/advocate/{advocate_id} | Required | Advocate | Get referrals for advocate (ownership validated) |
| GET | /referrals/{uuid} | Required | Advocate | Get referral details |
| POST | /referrals/{lead_id}/convert | Required | Advocate | Mark lead as converted |
| PUT | /referrals/{lead_id}/status | Required | Advocate | Update lead status |
| GET | /referrals/track/{uuid} | None | None | Track referral click (**PUBLIC**) |
| POST | /referrals/submit-lead | None | None | Submit lead (**PUBLIC**) |

**Ownership Validation**: User must own the advocate that created the referral

---

## Reward Routes

| Method | Path | Auth | Role | Notes |
|--------|------|------|------|-------|
| GET | /rewards/{advocate_id} | Required | Advocate | Get own rewards (ownership validated) |
| GET | /rewards/{advocate_id}/summary | Required | Advocate | Get reward summary (ownership validated) |
| GET | /rewards/pending/all | Required | Admin | Get all pending rewards (ADMIN ONLY) |
| POST | /rewards/{reward_id}/approve | Required | Admin | Approve reward (ADMIN ONLY) |
| POST | /rewards/{reward_id}/pay | Required | Admin | Mark reward paid (ADMIN ONLY) |

**Ownership Validation**: For advocate routes, must be the advocate who earned the reward

---

## Admin Routes

| Method | Path | Auth | Role | Notes |
|--------|------|------|------|-------|
| GET | /admin/pending-users | Required | Admin | Get pending user approvals |
| GET | /admin/users | Required | Admin | List all users |
| POST | /admin/users/{id}/approve | Required | Admin | Approve user |
| POST | /admin/users/{id}/reject | Required | Admin | Reject user |
| GET | /admin/advocates | Required | Admin | List all advocates |
| GET | /admin/referrals | Required | Admin | List all referrals |
| GET | /admin/analytics | Required | Admin | View system analytics |

---

## Middleware Decorators Used

### @login_required
- Checks: Token exists and is valid
- Checks: User exists in database
- Checks: User is active (is_active=true)
- Checks: User is approved (status='approved')
- Sets: request.current_user

### @advocate_required
- Inherits all @login_required checks
- Additional: User role must be 'advocate' or 'brand_advocate'
- Sets: request.current_user

### @admin_required
- Inherits all @login_required checks
- Additional: User role must be 'admin'
- Sets: request.current_user

### @advocate_owns_resource
- Inherits all @advocate_required checks
- Additional: Validates user owns the advocate_id in request
- Prevents: User accessing other users' advocates
- Returns: 403 if ownership check fails

---

## Error Responses

### 401 Unauthorized
- **Missing token**: "Missing authorization token"
- **Invalid token**: "Invalid token"
- **Token expired**: "Token has expired"
- **When triggered**: Logout follows only for real token errors

### 403 Forbidden
- **Inactive account**: "Account is inactive"
- **Unapproved account**: "Account not approved"
- **Wrong role**: "Advocate access required" or "Admin access required"
- **No ownership**: "You do not have permission to access this advocate"
- **When triggered**: Never triggers logout

### 404 Not Found
- **Resource missing**: "Advocate not found" or similar
- **When triggered**: User not logged out

### 400 Bad Request
- **Missing data**: "No data provided"
- **Invalid data**: "advocate_id and project_id required"
- **When triggered**: User not logged out

---

## Access Control Matrix

|  | Guest | User | Advocate | Admin |
|---|-------|------|----------|-------|
| View own profile | ✗ | ✓ | ✓ | ✓ |
| Create advocate | ✗ | ✗ | ✓ | ✓ |
| Create referral | ✗ | ✗ | ✓ | ✓ |
| View own referrals | ✗ | ✗ | ✓ | ✓ |
| View own rewards | ✗ | ✗ | ✓ | ✓ |
| Tracked link (public) | ✓ | ✓ | ✓ | ✓ |
| Submit lead (public) | ✓ | ✓ | ✓ | ✓ |
| Approve users | ✗ | ✗ | ✗ | ✓ |
| Manage advocates | ✗ | ✗ | ✗ | ✓ |
| View all rewards | ✗ | ✗ | ✗ | ✓ |
| Pay rewards | ✗ | ✗ | ✗ | ✓ |

---

## Frontend Protection

### ProtectedRoute Component
- Checks: isAuthenticated
- Checks: requiredRole (if specified)
- States:
  - **Pending**: Shows "Pending Approval" message
  - **Rejected**: Shows "Access Denied" message
  - **No Auth**: Redirects to /login
  - **Wrong Role**: Shows "Access Denied" message
  - **All Good**: Renders children

---

## Common Patterns

### Advocate-Owned Resource
```python
@advocate_bp.route('/<advocate_id>', methods=['GET'])
@advocate_required
@advocate_owns_resource
def get_advocate(advocate_id):
    # User can only access their own advocates
    # Ownership validated by decorator
```

### Admin-Only Operation
```python
@reward_bp.route('/<reward_id>/approve', methods=['POST'])
@admin_required
def approve_reward(reward_id):
    # Only admins can approve rewards
    # Validation automatic
```

### User-Specific (Self Only)
```python
@user_bp.route('/profile', methods=['GET'])
@login_required
def get_profile():
    # User can only get their own profile
    # request.current_user contains authenticated user
    user = request.current_user
```

---

## Migration Notes for Developers

### Old Way (❌ Don't use)
```python
def verify_token(f):
    # Only checked token validity
    # No role checks
    # No ownership validation
```

### New Way (✅ Use this)
```python
@advocate_required
@advocate_owns_resource
def my_route(advocate_id):
    # Professional auth
    # Role checked
    # Ownership validated
    # request.current_user available
```

---

## Testing Checklist
- [ ] Route returns 403 for wrong role
- [ ] Route returns 403 for missing ownership
- [ ] Route returns 401 only for invalid token
- [ ] User not logged out on 403 error
- [ ] User logged out only on real 401 with token error
- [ ] All error messages are clear and helpful
- [ ] ProtectedRoute on frontend matches backend requirements
