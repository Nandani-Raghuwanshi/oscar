# Testing Guide: Permission and Authorization Fixes

## Overview
This document provides step-by-step testing procedures to verify that all permission issues have been resolved.

## Test Setup
1. **Clear browser cache and localStorage**:
   - Open DevTools (F12)
   - Application tab → Clear storage
   - Restart browser

2. **Have test accounts ready**:
   - Admin account (role: 'admin', status: 'approved')
   - Advocate 1 (role: 'advocate', status: 'approved')
   - Advocate 2 (role: 'advocate', status: 'approved')
   - Regular user (role: 'user', status: 'approved')
   - Pending user (role: 'advocate', status: 'pending')

---

## Test Case 1: Create New Link - No Logout
### Scenario: User navigates to /referral/link-qr
### Expected: Page loads successfully without logout

**Steps:**
1. Login as Advocate 1
2. Go to Dashboard
3. Click "Create New Link" button
4. **Verify**: Page loads to /referral/link-qr WITHOUT logout
5. **Check Console**: No login redirects or 401 errors
6. Open DevTools → Application → Local Storage
7. **Verify**: authToken and user are still present

**Pass Criteria:**
- ✅ Page loads without redirect to login
- ✅ authToken remains in localStorage
- ✅ No console errors related to authorization

---

## Test Case 2: Advocate Ownership Validation
### Scenario: User tries to access another user's advocate
### Expected: 403 Permission Denied (NOT logged out)

**Steps:**
1. Login as Advocate 1 and get their advocate_id from localStorage
2. Note: Let's call it ADVOCATE_1_ID
3. Login as Advocate 2 and get their advocate_id
4. Call API directly: `GET /api/advocates/ADVOCATE_1_ID` with Advocate 2's token
5. **Verify**: Get 403 error with message "You do not have permission to access this advocate"
6. **Check**: User is NOT logged out (authToken still in localStorage)

**Using CURL:**
```bash
curl -H "Authorization: Bearer ADVOCATE_2_TOKEN" \
  http://localhost:5000/api/advocates/ADVOCATE_1_ID
```

**Expected Response:**
```json
{
  "error": "You do not have permission to access this advocate"
}
```

**Pass Criteria:**
- ✅ Returns 403 (not 401)
- ✅ Error message is clear
- ✅ User NOT logged out

---

## Test Case 3: Role-Based Access Control
### Scenario: Regular user tries to create referral link
### Expected: 403 Forbidden (Advocate role required)

**Steps:**
1. Login as regular user (role: 'user')
2. Navigate to /referral/link-qr
3. **Verify**: ProtectedRoute shows "Access Denied" message
4. Message should say "You do not have advocate permissions"

**Pass Criteria:**
- ✅ Shows permission denied page (not blank/error)
- ✅ Clear message about advocate requirement
- ✅ Not logged out

---

## Test Case 4: Admin-Only Operations
### Scenario: Non-admin tries to approve reward
### Expected: 403 Forbidden (Admin only)

**Steps:**
1. Get a reward_id from database
2. Login as Advocate (not admin)
3. Call API: `POST /api/rewards/{reward_id}/approve`
4. **Verify**: Get 403 error "Admin access required"
5. **Check**: User NOT logged out

**CURL:**
```bash
curl -X POST -H "Authorization: Bearer ADVOCATE_TOKEN" \
  http://localhost:5000/api/rewards/REWARD_ID/approve
```

**Pass Criteria:**
- ✅ Returns 403 with admin error
- ✅ Not logged out
- ✅ User can still browse their own data

---

## Test Case 5: Token Expiration - Should Logout
### Scenario: Token expires during session
### Expected: Automatic redirect to login

**Steps:**
1. Login as any user
2. Edit the authToken in localStorage to be invalid/expired
3. Try to access protected route or make API call
4. **Verify**: User is automatically logged out and sent to /login
5. **Check**: authToken removed from localStorage

**Pass Criteria:**
- ✅ Logged out on true token error
- ✅ Redirected to /login
- ✅ localStorage cleared

---

## Test Case 6: Multiple Advocates Per User
### Scenario: User has multiple advocates (PROJECT + BRAND)
### Expected: Can switch between advocates, no logout

**Steps:**
1. Create multiple advocates for same user
2. Get referrals for advocate 1
3. Switch to advocate 2 (update localStorage.advocateId)
4. Get referrals for advocate 2
5. **Verify**: Both calls succeed, no logout between switches

**Pass Criteria:**
- ✅ Can access both advocates' data
- ✅ No logout during switching
- ✅ Proper ownership validation for each

---

## Test Case 7: Unapproved User Access
### Scenario: User with status='pending' tries to access advocate routes
### Expected: Shows pending approval message (not logged out)

**Steps:**
1. Create account as advocate but don't approve it
2. Login (should show pending approval message)
3. Try to navigate to /referral/link-qr
4. **Verify**: Shows "Pending Approval" message
5. **Check**: Not logged out, just blocked

**Pass Criteria:**
- ✅ Shows pending message (not error)
- ✅ User NOT logged out
- ✅ Can return to home

---

## Test Case 8: Public Endpoints (No Auth)
### Scenario: Unauthenticated users can track and submit leads
### Expected: Works without login

**Steps:**
1. Open new incognito window (no auth)
2. Try: `GET /api/referrals/track/{referral_uuid}`
3. **Verify**: Works and returns tracking info
4. Try: `POST /api/referrals/submit-lead` with lead data
5. **Verify**: Works and creates lead

**Pass Criteria:**
- ✅ Public endpoints work without auth token
- ✅ No errors about missing authorization
- ✅ Proper response returned

---

## Test Case 9: Permission Error vs Auth Error
### Scenario: Different 401 errors handled properly
### Expected: Only real token errors cause logout

**Test 9a - Permission denied (should not logout):**
```bash
# Call with valid token but wrong advocate_id
curl -H "Authorization: Bearer VALID_TOKEN" \
  http://localhost:5000/api/advocates/OTHER_USER_ADVOCATE_ID
# Returns: 403 (permission error)
# Result: NOT logged out
```

**Test 9b - Token expired (should logout):**
Edit localStorage to have invalid/expired token, then make any API call
- Returns: 401 with "token" or "expired" in message
- Result: LOGGED OUT ✅

**Pass Criteria:**
- ✅ Permission errors (403) don't logout
- ✅ Token errors (401 with "token") DO logout
- ✅ Different scenarios handled correctly

---

## Quick Test: "Create New Link" Flow
### Full end-to-end test of the original issue

**Steps:**
1. Clear localStorage
2. Login as advocate
3. Go to Dashboard
4. **Verify**: Dashboard loads with stats and recent referrals
5. Click "Create New Link" button
6. **Verify**: Navigate to /referral/link-qr successfully
7. **Verify**: Form loads to select project
8. Select a project (e.g., "Oscar Sanctuary")
9. Click generate button
10. **Verify**: QR code and link generated successfully
11. **Verify**: Still logged in (check localStorage)
12. Go back to dashboard
13. **Verify**: Can see updated referral in "Recent Referrals"

**Pass Criteria:**
- ✅ Entire flow works without logout
- ✅ No 401 errors in network tab
- ✅ Can perform multiple operations
- ✅ Data persists across page navigation

---

## Debugging Checklist

If tests fail, check these:

### 1. Check middleware imports
```python
# In route files, should have:
from middleware.auth_middleware import advocate_required, advocate_owns_resource
```

### 2. Verify decorators applied
```python
@advocatE_required
@advocate_owns_resource
def get_advocate(advocate_id):
    # ...
```

### 3. Check advocate_id database existence
```bash
# In MongoDB:
db.advocates.findOne({_id: ObjectId("ADVOCATE_ID")})
# Should show: { user_id: ObjectId("..."), ... }
```

### 4. Check token validity
- Open DevTools → Network tab → any API call
- Click on request → Headers
- Should have: `Authorization: Bearer <valid_jwt_token>`

### 5. Check user status in database
```bash
db.users.findOne({_id: ObjectId("USER_ID")})
# Should have: { status: "approved", role: "advocate", ... }
```

### 6. Review console logs
- Look for specific error messages
- Check if it's a 401 vs 403
- Look for "You do not have permission" messages

---

## Common Issues and Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Still getting logged out | Old code still running | Clear server cache, restart Flask |
| 500 error on advocate access | advocate_owns_resource decorator error | Check advocate exists in DB, check user_id field |
| 403 not appearing | Route not using advocate_owns_resource | Verify decorator is applied to endpoint |
| Login loop | Invalid token in localStorage | Clear localStorage in DevTools |
| Still seeing old endpoints | Browser caching | Hard refresh (Ctrl+Shift+R) |

---

## Success Indicators
✅ User can navigate /referral/link-qr without logout
✅ Permission errors show clear messages
✅ Only token errors cause logout
✅ Advocate ownership is validated
✅ Role-based access control works
✅ Multiple advocates per user handled correctly
✅ Admin operations properly restricted

---

## Next Steps After Testing
1. Monitor error logs for any 401/403 mismatches
2. Test with different user scenarios
3. Stress test with multiple concurrent users
4. Document any edge cases found
5. Update production environment with new code
