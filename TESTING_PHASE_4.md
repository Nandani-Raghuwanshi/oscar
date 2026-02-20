# Phase 4 Testing Guide

> Quick reference for testing the Project Advocates module

## Prerequisites

1. Backend running on port 5000
2. Frontend running on appropriate dev server
3. MongoDB with existing admin user
4. Access to admin panel

---

## Step 1: Create a Test Project Advocate

### Via Admin Panel

1. Login as Admin
2. Navigate to "Users" section
3. Click "Create New User"
4. Fill in the form:
   ```
   First Name: John
   Last Name: Doe
   Email: john.advocate@example.com
   Phone: 9876543210
   Password: JohnAdv2026
   Role: Project Advocate
   Project: Select a project
   ```
5. Click "Create User"
6. Verify user was created

---

## Step 2: Login as Advocate

1. Go to login page
2. Enter credentials:
   ```
   Email/Phone: 9876543210
   Password: JohnAdv2026
   ```
3. Click "Login"
4. Should redirect to advocate dashboard

---

## Step 3: Test Dashboard

### Verify Dashboard Elements
- [ ] Page title shows "Project Advocate Dashboard"
- [ ] 4 metric cards visible:
  - Total Referrals (should be 0)
  - Conversion Rate (should be 0%)
  - Total Rewards (should be ₹0)
  - Pending Rewards (should be ₹0)
- [ ] Profile information displayed correctly
- [ ] No loading errors

### Expected Data
```
Referrals: {total: 0, converted: 0, pending: 0, conversionRate: 0}
Rewards: {totalEarned: 0, totalClaimed: 0, pendingAmount: 0, pendingCount: 0}
```

---

## Step 4: Test Referral Submission

### Open Referral Form
1. Navigate to "My Referrals" page
2. Click "New Referral" button
3. Form should appear with fields:
   - Full Name *
   - Phone Number *
   - Email (optional)
   - City (optional)
   - Notes (optional)

### Submit Valid Referral #1
```
Full Name: Rahul Sharma
Phone: 9123456789
Email: rahul@example.com
City: Bangalore
Notes: Met at construction site, interested in the project
```
1. Fill in form
2. Click "Submit Referral"
3. Should see confirmation
4. Form should clear
5. Referral should appear in list

### Verify Referral in List
- [ ] Referral appears with status "pending" (yellow badge)
- [ ] Shows referrer name "Rahul Sharma"
- [ ] Shows phone "9123456789"
- [ ] Shows submission date
- [ ] Shows notes

### Submit Referral #2 (Minimal)
```
Full Name: Priya Patel
Phone: 9234567890
```
1. Fill only required fields
2. Submit
3. Should create successfully
4. Should appear in list

---

## Step 5: Test Referral Filtering

### Filter by Status
1. Click "pending" filter button
2. Should show only pending referrals (both referrals from earlier)
3. Click "contacted" - should show empty state
4. Click "all" - should show all referrals again

---

## Step 6: Test Referral Pagination

### Add Multiple Referrals
1. Submit 15+ referrals (fill in minimum required fields)
2. Note: Use different phone numbers

### Verify Pagination
- [ ] Page shows "Page 1 of 2" (with 10 per page)
- [ ] "Previous" button is disabled on page 1
- [ ] "Next" button is enabled
- [ ] Click "Next" shows referrals 11-15
- [ ] "Previous" button is now enabled
- [ ] Click "Previous" goes back to page 1

---

## Step 7: Test Rewards Page

### View Rewards Summary
1. Navigate to "My Rewards"
2. Should see 4 summary cards:
   ```
   Earned: ₹0 (0 rewards)
   Processed: ₹0 (0 rewards)
   Claimed: ₹0 (0 rewards)
   Grand Total: ₹0
   ```

### View Rewards List
- [ ] Empty state message displayed
- [ ] Message: "No rewards found. Convert referrals to earn rewards!"
- [ ] All filter buttons visible

---

## Step 8: Test Documentation Page

### Tab 1: Project Overview
1. Navigate to "Project Documentation"
2. Click "Project Overview" tab
3. Should display:
   - [ ] Project name
   - [ ] Project status (green indicator if active)
   - [ ] Project description
   - [ ] Location (if available)

### Tab 2: Documents
1. Click "Documents" tab
2. If project has documents:
   - [ ] Shows document name
   - [ ] Shows description
   - [ ] "View" link to download/open
3. If no documents:
   - [ ] Shows "No documents available yet"

### Tab 3: Certifications
1. Click "Certifications" tab
2. If project has certifications:
   - [ ] Shows certification cards in grid
   - [ ] Green checkmark icon
   - [ ] Certification name
   - [ ] Issuer name
   - [ ] Valid until date
3. If no certifications:
   - [ ] Shows "No certifications available yet"

---

## Step 9: Test Duplicate Detection

### Try Submitting Duplicate
1. Try to submit referral with same phone as earlier:
   ```
   Full Name: Different Name
   Phone: 9123456789 (same as earlier)
   ```
2. Should show error:
   ```
   "This contact has already been referred by you"
   ```
3. Referral should not be created

---

## Step 10: Test Error Scenarios

### Missing Required Field
```
Full Name: (empty)
Phone: 9987654321
```
1. Click submit
2. Should show validation error: "Full Name is required"

### Invalid Email Format
```
Full Name: Test User
Phone: 9998887776
Email: invalid-email (missing @)
```
1. Click submit
2. Should show validation error: "Valid email required"

### Missing Phone
```
Full Name: Test User
Phone: (empty)
```
1. Click submit
2. Should show validation error: "Phone is required"

---

## Step 11: Verify Database Data

### Check MongoDB

```javascript
// Count referrals
db.referrals.count()
// Should be 15+

// Check referral by phone
db.referrals.findOne({referrerPhone: "9123456789"})

// Check by advocate
db.referrals.find({
  advocateId: ObjectId("..."),
  projectId: ObjectId("...")
})

// Verify status distribution
db.referrals.aggregate([
  {$match: {isDeleted: false}},
  {$group: {_id: "$status", count: {$sum: 1}}}
])

// Check rewards collection
db.rewards.count()
// Should be 0 (no conversions yet)
```

---

## Step 12: Test Multiple Advocates

### Create Second Advocate
1. Go back to admin panel
2. Create another advocate:
   ```
   First Name: Priya
   Phone: 9876543201
   Password: PriyaAdv2026
   ```

### Login as Second Advocate
1. Logout from first advocate
2. Login with new credentials
3. Dashboard should show:
   - [ ] 0 referrals
   - [ ] 0% conversion rate
   - [ ] Different profile info
4. Referral list should be empty
5. Previously created referrals should NOT appear

### Isolation Test
- First advocate can only see their referrals
- Second advocate can only see their referrals
- Each has separate reward tracking

---

## Performance Testing

### Measure Load Times
1. Dashboard load: Should be <500ms
2. Referral submission: Should be <200ms
3. List load: Should be <300ms

### Check Network Tab (Browser DevTools)
- [ ] All API calls return 200 (success)
- [ ] No 4xx or 5xx errors
- [ ] Response times reasonable

---

## API Testing (Optional - Using Postman/cURL)

### Get Dashboard
```bash
curl -X GET http://localhost:5000/api/advocate/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected 200 response with stats.

### Submit Referral
```bash
curl -X POST http://localhost:5000/api/advocate/referrals \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "referrerName": "Test User",
    "referrerPhone": "9876543210",
    "referrerEmail": "test@example.com",
    "referrerCity": "Mumbai",
    "notes": "Great candidate"
  }'
```

Expected 201 response with created referral.

### Get Referrals
```bash
curl -X GET http://localhost:5000/api/advocate/referrals?page=1&limit=10 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected 200 response with paginated list.

### Get Rewards Summary
```bash
curl -X GET http://localhost:5000/api/advocate/rewards/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected 200 response with summary stats.

---

## Checklist: All Tests Passing ✓

- [ ] Dashboard loads and displays stats
- [ ] Can submit new referrals
- [ ] Can view referral list
- [ ] Can filter by status
- [ ] Pagination works correctly
- [ ] Duplicate detection prevents duplicates
- [ ] Rewards page displays correctly
- [ ] Documentation pages load
- [ ] Multiple advocates are isolated
- [ ] Form validation works
- [ ] Database data persists correctly
- [ ] API errors handled gracefully
- [ ] All page styling is responsive
- [ ] No console errors

---

## Known Issues (If Any)

Document any issues encountered during testing:

```
Issue: [Description]
Steps to reproduce: [Steps]
Expected: [What should happen]
Actual: [What happens]
```

---

## Next Steps After Testing

1. **Create advocate users for production**
2. **Populate with sample referral data**
3. **Train advocate users on the interface**
4. **Monitor performance and logs**
5. **Begin Phase 5 (Brand Advocates Module)**

---

## Support Resources

- API Documentation: [PHASE_4_PROJECT_ADVOCATES.md](docs/PHASE_4_PROJECT_ADVOCATES.md)
- Database Schema: See PHASE_4_PROJECT_ADVOCATES.md
- Frontend Code: `client/src/pages/advocate/`
- Backend Code: `server/src/routes/advocate.js`

---

## Questions or Issues?

Refer to:
1. Phase 4 documentation
2. Error messages in browser console
3. MongoDB logs for database issues
4. Server logs for API issues

Good luck with testing! 🚀
