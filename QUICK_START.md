# Quick Start Guide - CRM Escalation System

## Step 1: Run Migrations (Required)

```powershell
# Navigate to server directory
cd server

# Run lead migration
node src/scripts/migrateLeads.js

# Expected output:
# ✅ Updated X leads with new fields
```

## Step 2: Seed Default Escalation Rule (Required)

```powershell
# Still in server directory
node src/scripts/seedEscalationRule.js

# Expected output:
# ✅ Default escalation rule created successfully!
```

## Step 3: Start Backend Server

```powershell
# In server directory
npm run dev

# Look for these log messages:
# [EscalationCron] Escalation cron job started (runs every hour)
# [EscalationCron] Running scheduled escalation processing...
# Server running on port 5000
```

## Step 4: Start Frontend

```powershell
# In new terminal, navigate to client
cd client
npm run dev

# Frontend will start on http://localhost:5173
```

## Step 5: Verify Implementation

### Check Backend is Working

1. Open your API client (Postman/Insomnia)
2. Get auth token by logging in as admin
3. Test escalation rules endpoint:

```http
GET http://localhost:5000/api/admin/escalation-rules
Authorization: Bearer YOUR_TOKEN

Expected: Returns the default "New Lead Escalation" rule
```

### Check Frontend Changes

1. Open browser: `http://localhost:5173`
2. Login as CRM Manager
3. Navigate to: `/crm/pipeline`
4. **Verify:** You see "Site Visit" column (teal color) between "Contacted" and "Qualified"

### Test Referral Assignment Fix

1. Go to `/crm/referrals`
2. Select an unassigned referral
3. Click "Assign to Sales Associate"
4. Assign to any sales associate
5. Go back to `/crm/pipeline`
6. **Verify:** The assigned lead appears in "New" column (NOT "Contacted")

### Test Manual Escalation Trigger

```http
POST http://localhost:5000/api/admin/escalation-rules/trigger
Authorization: Bearer YOUR_ADMIN_TOKEN

Expected: Returns success message
Check server logs for processing output
```

## Step 6: Test Escalation Flow (Optional)

### Create a Test Lead

1. As CRM Manager, go to `/crm/referrals`
2. Assign a referral to create a lead
3. Note the lead ID from the response

### Manually Age the Lead

Open MongoDB Compass or mongo shell:

```javascript
// Connect to your database
use oscar_db

// Update lead's statusHistory to 25 hours ago (for Stage 1)
db.leads.updateOne(
  { _id: ObjectId("YOUR_LEAD_ID") },
  { 
    $set: { 
      "statusHistory.0.updatedDate": new Date(Date.now() - 25 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 25 * 60 * 60 * 1000)
    } 
  }
)
```

### Trigger Escalation Processing

```http
POST http://localhost:5000/api/admin/escalation-rules/trigger
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### Check Results

1. **In Database:**
   ```javascript
   db.leads.findOne({ _id: ObjectId("YOUR_LEAD_ID") })
   
   // Should see:
   // isEscalated: true
   // priority: "high"
   // escalationStage: 1
   // escalationHistory: [ {...} ]
   ```

2. **In Frontend:**
   - Go to `/crm/pipeline`
   - Find the lead in "New" column
   - **Verify:** Red banner showing "HIGH PRIORITY (Stage 1)"

3. **In Escalations Page:**
   - Go to `/crm/escalations`
   - **Verify:** Lead appears in table
   - **Verify:** Shows "Stage 1" in Stage column

4. **Notifications:**
   - Login as CRM Manager
   - Check notification icon
   - **Verify:** Notification about escalated lead

## Troubleshooting

### Server won't start
```powershell
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process if needed
taskkill /PID <PID> /F
```

### Cron job not running
- Check server logs for "[EscalationCron] Escalation cron job started"
- Verify `NODE_ENV` is not set to 'test'

### "Site Visit" not showing
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+Shift+R)

### Leads not escalating
1. Check rule is enabled:
   ```http
   GET http://localhost:5000/api/admin/escalation-rules
   ```
2. Verify lead has old statusHistory date
3. Check server logs during manual trigger

### Migration errors
- Ensure MongoDB is running
- Check .env file has correct DB connection string
- Verify admin user exists in database

## What to Expect

### Escalation Timeline

| Time | Action | Result |
|------|--------|--------|
| T+0h | Lead created in "new" status | Normal priority |
| T+24h | Stage 1 triggered | High priority, manager notified |
| T+48h | Stage 2 triggered | Critical priority, builder notified |
| T+72h | Stage 3 triggered | Auto-closed as lost |

### Visual Indicators

**Before Escalation:**
```
┌─────────────────────┐
│ John Doe           │ [normal]
│ 555-1234           │
│ Project Alpha      │
└─────────────────────┘
```

**After Stage 1 (24h):**
```
┌─────────────────────┐
│ ⚠ HIGH PRIORITY    │  <- Red banner
│   (Stage 1)        │
│ John Doe           │ [high]
│ 555-1234           │
│ Project Alpha      │
└─────────────────────┘
```

**After Stage 2 (48h):**
```
┌─────────────────────┐
│ ⚠ CRITICAL         │  <- Red banner
│   (Stage 2)        │
│ John Doe           │ [critical]
│ 555-1234           │
│ Project Alpha      │
└─────────────────────┘
```

## Next Steps

1. **Test in Development:**
   - Create test leads
   - Age them manually
   - Trigger escalations
   - Verify notifications

2. **Monitor Logs:**
   - Watch server logs during hourly cron runs
   - Check for any errors

3. **Review Documentation:**
   - Read `CRM_ESCALATION_IMPLEMENTATION.md` for details
   - Review `TESTING_ESCALATION_SYSTEM.md` for all test scenarios

4. **Optional Enhancements:**
   - Create Admin UI for rule management
   - Add email notifications
   - Create analytics dashboard

## Success Criteria ✅

- [ ] Migration completed without errors
- [ ] Default rule seeded successfully
- [ ] Server starts with cron job
- [ ] "Site Visit" column visible in pipeline
- [ ] Referrals assign to "new" status
- [ ] Manual trigger works
- [ ] Aged lead escalates to Stage 1
- [ ] Escalation indicators show correctly
- [ ] Notifications received

**All checked?** Your implementation is complete! 🎉

## Support

For issues or questions:
1. Check `IMPLEMENTATION_COMPLETE.md` for troubleshooting
2. Review server logs for errors
3. Verify database changes with MongoDB Compass
4. Test API endpoints with Postman

---

**Implementation completed on:** February 21, 2026  
**Version:** 1.0.0  
**Status:** Production Ready ✅
