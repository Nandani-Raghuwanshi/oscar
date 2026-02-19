# BuiltCred Referral System - Quick Start Guide

## 🚀 Getting Started

### 1. Backend Setup

```bash
# Install dependencies
cd server/
pip install -r requirements.txt

# Ensure MongoDB is running on localhost:27017
# Start Flask server
python app.py
```

The backend will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5174`

---

## 📋 Testing Workflow

### Test 1: User Registration & Advocate Setup

1. **Sign Up**: Go to `/signup` → Create a test user account
2. **Login**: Use the credentials to log in
3. **Become Advocate**: Navigate to `/referral/select-type`
4. **Choose Type**: Select "Project Advocate" or "Brand Advocate"
5. **Verify**: Check localStorage for `advocateId`

**Expected**: User should be registered in `advocates` collection

---

### Test 2: Create Referral Link

1. **Go to Dashboard**: Visit `/referral/dashboard`
2. **Click "Create New Referral Link"** or navigate to `/referral/create-link`
3. **Select Project**: Choose "Oscar Sanctuary" (or available project)
4. **Select Channel**: Choose "WhatsApp", "Email", or "QR"
5. **Create**: Submit the form

**Expected**:
- UUID generated (e.g., `f47ac10b-58cc-4372-a567-0e02b2c3d479`)
- Link created: `builtcred.com/ref/{uuid}`
- QR code displayed (PNG image)
- Link stored in `referrals` collection

---

### Test 3: Share Link & Lead Submission

#### Option A: Direct Link Share
```
1. Copy the referral link
2. Share manually with someone
3. They click link → see referral form
4. Fill form with: name, phone (10 digits), email, budget
5. Submit → Lead created in database
```

#### Option B: QR Code
```
1. Download/print the QR code
2. Have someone scan it with phone camera
3. Opens referral form
4. Submit lead information
```

#### Option C: WhatsApp
```
1. Click "Share on WhatsApp"
2. Select contact from WhatsApp
3. Send message with link
4. Recipient opens link
5. Fills & submits lead form
```

**Expected**: Lead record created in `leads` collection with status "NEW"

---

### Test 4: View Referral Details

1. **Dashboard**: Go back to `/referral/dashboard`
2. **Referrals Tab**: View your referral links
3. **Click "View Details"**: See referral with associated leads
4. **Check Stats**: View click count, lead count

**Expected**:
- Referral shown with UUID
- Click count incremented (from link access)
- Associated leads listed
- Lead status visible

---

### Test 5: Update Lead Status (Simulated Sales CRM)

Note: This requires backend API call simulation (use Postman or cURL)

```bash
# Update lead status
curl -X PUT http://localhost:5000/api/referrals/{lead_id}/status \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CONTACTED",
    "notes": "Called at 10:00 AM"
  }'
```

**Repeat for**: SITE_VISIT, NEGOTIATION, LOST/CONVERTED

**Expected**:
- Status updated in database
- New entry added to `status_history`
- Dashboard shows updated status

---

### Test 6: Convert Lead & Trigger Reward

When a lead converts to booking:

```bash
curl -X POST http://localhost:5000/api/referrals/{lead_id}/convert \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "plot_number": "A-101",
    "plot_value": 5000000,
    "booking_date": "2025-02-17"
  }'
```

**Expected**:
- Lead status → "CONVERTED"
- Conversion record created
- Reward created with:
  - Gross: ₹50,000 (1% of 50L)
  - TDS: ₹5,000 (10%)
  - Net: ₹45,000
- Reward status: "ELIGIBLE" (after 30 days → "APPROVED" → "PAID")

---

### Test 7: View Rewards

1. **Dashboard**: Go to `/referral/dashboard`
2. **Rewards Tab**: View all rewards
3. **Summary Cards**: See pending, approved, paid counts
4. **Earnings**: View total paid earnings

**Expected**:
- Rewards displayed with status badges
- Gross, TDS, and Net amounts shown
- Status timeline visible

---

### Test 8: Admin Reward Approval

Backend only (requires admin token):

```bash
# Get pending rewards
curl -X GET 'http://localhost:5000/api/rewards/pending/all?limit=50' \
  -H "Authorization: Bearer {admin_token}"

# Approve a reward
curl -X POST http://localhost:5000/api/rewards/{reward_id}/approve \
  -H "Authorization: Bearer {admin_token}"

# Mark as paid
curl -X POST http://localhost:5000/api/rewards/{reward_id}/pay \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_reference": "TRF-2025-001",
    "notes": "Bank transfer completed"
  }'
```

**Expected**: Reward status changes → PAID

---

## 🔍 Debugging Tips

### Check Database State
```javascript
// MongoDB queries in mongo shell

// View advocates
db.advocates.find({ user_id: "..." })

// View referrals
db.referrals.find({ advocate_id: "..." })

// View leads
db.leads.find({ referral_uuid: "..." })

// View rewards
db.rewards.find({ advocate_id: "..." })

// View conversions
db.conversions.find({ lead_id: "..." })
```

### Check localStorage (Browser Console)
```javascript
console.log(localStorage.getItem('advocateId'))
console.log(localStorage.getItem('advocateType'))
console.log(localStorage.getItem('authToken'))
```

### Check API Responses (Browser Network Tab)
1. Open DevTools → Network tab
2. Perform action (create link, submit lead, etc.)
3. Check request/response JSON
4. Verify status codes (200, 201, 400, 401, etc.)

---

## 🐛 Common Issues

### Issue: "No data provided" Error
**Solution**: Ensure JSON payload is sent correctly
```javascript
// ❌ Wrong
api.post('/referrals/create-link', null)

// ✅ Correct
api.post('/referrals/create-link', {
  advocate_id: '...',
  project_id: '...'
})
```

### Issue: "Missing authorization token"
**Solution**: 
- Ensure logged in and token in localStorage
- Check token hasn't expired
- Verify Authorization header: `Bearer {token}`

### Issue: "Referral link not found"
**Solution**:
- Verify UUID is correct
- Check referral status is "ACTIVE"
- Ensure referral exists in database

### Issue: "Lead with this phone already exists"
**Solution**:
- Use different phone number
- Or check database for existing lead
- Clear test data before retesting

---

## 📊 Sample Data for Testing

### Create Test Advocate
```javascript
db.advocates.insertOne({
  user_id: "test-user-123",
  name: "John Developer",
  email: "john@example.com",
  phone: "9876543210",
  type: "PROJECT_ADVOCATE",
  source_project_id: "project-1",
  status: "ACTIVE",
  created_at: new Date(),
  updated_at: new Date(),
  referral_count: 0,
  conversion_count: 0,
  total_earnings: 0
})
```

### Create Test Lead
```javascript
db.leads.insertOne({
  referral_uuid: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  advocate_id: "advocate-123",
  project_id: "project-1",
  lead_name: "Jane Buyer",
  lead_phone: "9123456789",
  lead_email: "jane@example.com",
  budget_range: "100-200L",
  created_at: new Date(),
  status: "NEW",
  status_history: [{
    status: "NEW",
    timestamp: new Date(),
    notes: "Lead created from referral"
  }],
  converted: false
})
```

---

## ✅ Validation Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads on localhost:5174
- [ ] User can register and login
- [ ] Can select advocate type
- [ ] Can create referral link
- [ ] QR code generates
- [ ] Link format is correct
- [ ] Lead form accessible from link
- [ ] Lead submission creates database record
- [ ] Dashboard shows referrals
- [ ] Dashboard shows rewards
- [ ] Status updates work
- [ ] Conversion triggers reward
- [ ] Reward shows correct calculations
- [ ] Admin can approve/pay rewards

---

## 📞 Quick Reference

| Endpoint | Purpose |
|----------|---------|
| `POST /api/advocates/register` | Register as advocate |
| `POST /api/referrals/create-link` | Create referral link |
| `POST /api/referrals/submit-lead` | Submit lead form |
| `GET /api/referrals/advocate/{id}` | View referrals |
| `POST /api/referrals/{id}/convert` | Convert lead |
| `GET /api/rewards/{id}` | View rewards |
| `POST /api/rewards/{id}/approve` | Approve reward |
| `POST /api/rewards/{id}/pay` | Pay reward |

---

**Ready to test! 🚀**
