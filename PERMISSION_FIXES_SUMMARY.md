# Permission and Auth Fixes Summary

## Problem
User was getting logged out when navigating to "/referral/link-qr" due to authorization issues and improper permission checking across routes.

## Root Causes Identified
1. **Inconsistent Auth Middleware**: Routes were using local `@verify_token` decorators that only checked token validity, not user roles or advocate ownership
2. **Missing Advocate Ownership Validation**: No checks to ensure users could only access their own advocates
3. **Overly Aggressive Auto-Logout**: API interceptor was logging out on any 401 error with "token/authorization" in the message, including permission errors
4. **Admin Route Protection Missing**: Advocate pause/blacklist operations had no admin-only checks

## Changes Made

### 1. Backend Auth Middleware (server/middleware/auth_middleware.py)
✅ Added new decorators:
- `@advocate_required` - Checks if user has advocate role and is approved
- `@advocate_owns_resource` - Validates user owns the advocate_id in request

### 2. Referral Routes (server/routes/referral_routes.py)
✅ Updated from local `@verify_token` to proper middleware:
- Removed local verify_token decorator definition
- `POST /referrals/create-link` → `@advocate_required @advocate_owns_resource`
- `GET /referrals/advocate/<advocate_id>` → `@advocate_required @advocate_owns_resource`
- `GET /referrals/<referral_uuid>` → `@advocate_required` with inline ownership check
- `POST /referrals/<lead_id>/convert` → `@advocate_required`
- `PUT /referrals/<lead_id>/status` → `@advocate_required`
- `GET /track/<referral_uuid>` → Remains PUBLIC (public tracking endpoint)
- `POST /submit-lead` → Remains PUBLIC (public lead submission)

### 3. Advocate Routes (server/routes/advocate_routes.py)
✅ Updated from local `@verify_token` to proper middleware:
- Removed local verify_token decorator definition
- `POST /advocates/register` → `@advocate_required`
- `GET /advocates/<advocate_id>` → `@advocate_required @advocate_owns_resource`
- `GET /advocates/user/<user_id>` → `@advocate_required` with inline user check
- `PUT /advocates/<advocate_id>` → `@advocate_required @advocate_owns_resource`
- `GET /advocates/<advocate_id>/stats` → `@advocate_required @advocate_owns_resource`
- `POST /advocates/<advocate_id>/pause` → `@admin_required` (FIXED: was missing)
- `POST /advocates/<advocate_id>/blacklist` → `@admin_required` (FIXED: was missing)

### 4. Reward Routes (server/routes/reward_routes.py)
✅ Updated from local `@verify_token` to proper middleware:
- Removed local verify_token decorator definition
- `GET /rewards/<advocate_id>` → `@advocate_required @advocate_owns_resource`
- `GET /rewards/<advocate_id>/summary` → `@advocate_required @advocate_owns_resource`
- `GET /rewards/pending/all` → `@admin_required` (FIXED: was missing)
- `POST /rewards/<reward_id>/approve` → `@admin_required` (FIXED: was missing)
- `POST /rewards/<reward_id>/pay` → `@admin_required` (FIXED: was missing)

### 5. User Routes (server/routes/user_routes.py)
✅ Updated from local `@verify_token` to proper middleware:
- Removed local verify_token decorator definition
- `GET /users/profile` → `@login_required`
- `PUT /users/profile` → `@login_required`
- `POST /users/reset-password` → `@login_required`

### 6. API Interceptor (src/services/api.js)
✅ Improved logout logic:
- Only logout on genuine token/auth errors
- Don't logout on permission (403) or validation errors
- More precise detection of token validity issues

## Permission Hierarchy

| Role | Can Access |
|------|-----------|
| Guest | Public routes (home, login, signup, referral tracking) |
| User (Pending) | ProtectedRoute redirects to pending approval page |
| User (Rejected) | ProtectedRoute redirects to rejection page |
| User (Approved) | Profile, password reset |
| Advocate (Approved) | All above + create referrals, link generation, dashboard |
| Admin (Approved) | All above + user approval, advocate management, rewards |

## Testing Checklist

### Advocate Routes (Private)
- [ ] Advocate can GET their own advocate details
- [ ] Advocate can GET their own referrals
- [ ] Advocate can CREATE referral links for their advocates
- [ ] Advocate CANNOT access other users' advocates (403)
- [ ] Non-advocate user CANNOT access (403)

### Admin Routes (Private)
- [ ] Admin can approve rewards
- [ ] Admin can pay rewards
- [ ] Admin can pause advocates
- [ ] Admin can blacklist advocates
- [ ] Non-admin user CANNOT access (403)

### Public Routes (No Auth Needed)
- [ ] GET /referrals/track/<uuid> - works without auth
- [ ] POST /referrals/submit-lead - works without auth
- [ ] Home, login, signup - work without auth

### Error Handling
- [ ] 403 errors do NOT cause logout
- [ ] Expired token DOES cause logout
- [ ] Invalid token DOES cause logout
- [ ] Permission errors are clearly displayed to user

## Known Edge Cases Handled

1. **ObjectId Conversion**: Advocate ownership checks properly handle both ObjectId and string formats
2. **User Not Found**: Returns 401 with proper error message
3. **Inactive Account**: Returns 403 with "Account is inactive"
4. **Unapproved Account**: Returns 403 with "Account not approved"
5. **Wrong Role**: Returns 403 with specific role requirement message

## Next Steps for Testing
1. Create test accounts with different roles
2. Attempt to access routes with/without proper permissions
3. Verify logout behavior on token expiration
4. Verify permission errors show proper UI messages instead of logout
