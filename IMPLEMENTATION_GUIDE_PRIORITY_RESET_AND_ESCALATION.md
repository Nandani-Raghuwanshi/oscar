# Lead Priority Reset & Contacted-to-Site Visit Escalation Implementation

> **Date Implemented:** February 21, 2026  
> **Status:** Ready for Testing & Deployment  

## Overview

Two major updates have been implemented to improve the CRM pipeline management system:

1. **Priority Tag Reset**: When any lead moves to the next bucket/card/status, the priority tags are automatically reset to "medium" for all leads
2. **Contacted-to-Site Visit Escalation Rule**: New escalation workflow for leads stuck in the "contacted" status

---

## Update 1: Priority Tag Reset on Status Change

### What Changed

When a lead's status is updated (moved to the next bucket), the system now automatically:
- Resets the priority to `'medium'` 
- Clears any existing escalation state (escalationStage = 0, isEscalated = false)

**This applies to all status transitions:**
- `new` → `contacted`
- `contacted` → `site_visit`
- `site_visit` → `qualified`
- `qualified` → `negotiating`
- `negotiating` → `proposal_sent`
- `proposal_sent` → `converted`
- Any status → `lost`

### Implementation Details

**File Modified:** `server/src/routes/crm.js`  
**Endpoint:** `PATCH /crm/leads/:id/status`

**Code Changes:**
```javascript
// Check if status is changing (moving to next bucket)
const statusChanging = lead.status !== status;

// Reset priority to 'medium' when lead moves to next bucket/status
if (statusChanging) {
    lead.priority = 'medium';
    // Also reset escalation state on status change
    lead.escalationStage = 0;
    lead.isEscalated = false;
    lead.escalationReason = null;
}
```

### Why This Matters

- **Fresh Priority Assessment**: Each stage of the sales pipeline gets a fresh priority assessment
- **Prevents Stale Escalations**: Clears old escalation flags when lead progresses
- **Consistent Workflow**: All leads start at "medium" priority in their new status, giving equal attention initially

### Testing Guide

1. Create or select a lead in "new" status with "high" or "critical" priority
2. Update the lead's status to "contacted"
3. Verify: The priority should be reset to "medium" in the database
4. Verify: escalationStage should be 0 and isEscalated should be false

---

## Update 2: Contacted-to-Site Visit Escalation Rule

### What Changed

A new escalation rule has been created that automatically escalates leads stuck in the "contacted" status that haven't moved to "site_visit". This follows the same pattern as the existing "New Lead Escalation" rule.

### Escalation Timeline

| Stage | Timeline | Action | Priority | Notification |
|-------|----------|--------|----------|--------------|
| **Stage 1** | 0-7 days | Escalate to CRM Manager | HIGH | Update manager's dashboard KPI as "escalated" |
| **Stage 2** | 7-14 days | Escalate to Builder/Admin | CRITICAL | Update builder's "escalated page" |
| **Stage 3** | 14-21 days | Auto-close as "Lost" | N/A | Notify all relevant stakeholders |

### How It Works

**Trigger:** A lead remains in "contacted" status  
**Prevention:** Moving the lead to "site_visit" status cancels escalation  

**Example Timeline:**
- Day 0: Lead moves to "contacted" status
- Day 7: If still in "contacted" → Stage 1 triggers (HIGH priority, manager notified)
- Day 14: If still in "contacted" → Stage 2 triggers (CRITICAL priority, builder notified)
- Day 21: If still in "contacted" → Stage 3 triggers (Auto-closes as LOST)

### Rule Details

**Rule Name:** `Contacted to Site Visit Escalation`  
**Source Status:** `contacted`  
**Target Status:** `site_visit`  
**Enabled:** Yes (active by default)

### Implementation Files

#### 1. Seeding Script
**File:** `server/src/scripts/seedContactedToSiteVisitRule.js`

This script creates the escalation rule in the database. 

**Run the script:**
```bash
# From the server directory
npm run seed:contacted-site-visit
# or
node src/scripts/seedContactedToSiteVisitRule.js
```

#### 2. Escalation Processing

The rule is automatically processed by the existing escalation system:
- **File:** `server/src/services/escalationProcessor.js`
- **Trigger:** Runs every hour via `server/src/jobs/escalationCron.js`
- **Database Model:** `server/src/models/EscalationRule.js`

### How the Escalation Works Behind the Scenes

1. **Hourly Check**: Every hour (configurable), the escalation processor queries all leads in "contacted" status
2. **Time Calculation**: For each lead, it calculates how long they've been in "contacted" status
3. **Stage Matching**: Compares elapsed time against each escalation stage threshold
4. **Action Execution**: When a threshold is met:
   - Sets priority level
   - Creates notification for relevant role
   - Updates KPI metrics
   - Records escalation history
5. **Completion Check**: If lead moves to "site_visit", escalation resets (priority reset to medium, stage cleared)

### Database Collections

The rule is stored in the `escalationrules` collection with structure:
```javascript
{
    ruleName: "Contacted to Site Visit Escalation",
    sourceStatus: "contacted",
    targetStatus: "site_visit",
    enabled: true,
    stages: [
        {
            stageNumber: 1,
            waitHours: 168,      // 7 days
            priority: "high",
            actionType: "escalate_to_manager",
            notifyRoles: ["crm_manager"],
            kpiField: "escalated"
        },
        {
            stageNumber: 2,
            waitHours: 336,      // 14 days
            priority: "critical",
            actionType: "escalate_to_builder",
            notifyRoles: ["builder"],
            kpiField: "escalated"
        },
        {
            stageNumber: 3,
            waitHours: 504,      // 21 days
            actionType: "auto_close",
            targetStatus: "lost",
            lostReason: "Automatically closed - No progress to site visit for 21 days"
        }
    ],
    createdBy: ObjectId,
    createdAt: Date,
    updatedAt: Date
}
```

### Frontend Changes

No frontend changes are required. The existing escalation pages automatically display escalated leads:

- **Manager Dashboard**: `/crm/escalations` - Shows HIGH and CRITICAL priority escalations
- **Builder Dashboard**: `/builder/escalations` - Shows CRITICAL priority escalations
- **Admin Dashboard**: `/admin/escalations` - Shows all escalations

The escalation display will automatically include leads escalated by the new "Contacted to Site Visit" rule.

---

## Setup & Deployment Instructions

### Prerequisites
- Server running with MongoDB connection
- Admin user created in the system
- Current escalation system working (verify `/api/health` returns status OK)

### Step 1: Verify Current System

Check that the existing "New Lead Escalation" rule exists:
```bash
# Via MongoDB Compass or your preferred client:
# Query: escalationrules collection
# Find rule with ruleName = "New Lead Escalation"
```

Or via API:
```bash
curl http://localhost:5000/api/admin/escalation-rules
```

### Step 2: Deploy Code Changes

1. Update `server/src/routes/crm.js` with priority reset logic ✅
2. Create `server/src/scripts/seedContactedToSiteVisitRule.js` ✅

### Step 3: Run Seeding Script

```bash
# From oscar/server directory
cd server

# Option 1: Using npm script (add to package.json if not present)
npm run seed:contacted-site-visit

# Option 2: Direct Node execution
node src/scripts/seedContactedToSiteVisitRule.js

# Expected output:
# ✅ Contacted to Site Visit escalation rule created successfully!
# Rule Name: Contacted to Site Visit Escalation
# Rule ID: [ObjectId]
# Stages: 3
# Stage Details:
#   Stage 1: 7 days (168 hours) - Escalate to Manager (HIGH priority)
#   Stage 2: 14 days (336 hours) - Escalate to Builder (CRITICAL priority)
#   Stage 3: 21 days (504 hours) - Auto-close as Lost
```

### Step 4: Restart Server

```bash
# Stop existing server process
# Restart with:
npm run dev
# or
npm start
```

The escalation cron job will automatically start and begin processing rules.

### Step 5: Verify Deployment

Check the Rules API:
```bash
curl http://localhost:5000/api/admin/escalation-rules
```

Should return both:
1. "New Lead Escalation" rule
2. "Contacted to Site Visit Escalation" rule

---

## Testing & Validation

### Manual Testing: Priority Reset

1. **Setup**: Create a test lead or use existing lead
2. **Initial State**: Ensure lead is in "new" status with priority "high" or "critical"
3. **Action**: Update lead status to "contacted" via:
   ```bash
   PATCH /crm/leads/{leadId}/status
   Body: { status: "contacted", notes: "50+ character test notes..." }
   ```
4. **Verification**: Check lead in database/API - should see:
   - `status: "contacted"`
   - `priority: "medium"`
   - `isEscalated: false`
   - `escalationStage: 0`

### Manual Testing: Escalation Rule

**Timeline Test (using system clock):**

1. **Setup**: Create test lead, assign to sales associate
2. **Stage 1 Test**: 
   - Move lead to "contacted" status (creates status entry timestamp)
   - Wait 168+ hours OR manually set `statusHistory` timestamp to 168+ hours ago
   - Manually trigger: `POST /api/admin/escalation-cron/trigger` (if endpoint exists)
   - Or wait for next hourly cron run
   - Verify: Lead should have `priority: "high"`, `isEscalated: true`
   
3. **Stage 2 Test**:
   - Continue from Stage 1
   - Wait 336+ hours total from "contacted" entry
   - Trigger escalation
   - Verify: Priority should be "critical"
   
4. **Stage 3 Test**:
   - Continue from Stage 2
   - Wait 504+ hours total from "contacted" entry
   - Trigger escalation
   - Verify: Lead status should be "lost"

**Prevention Test:**
- Create lead in "contacted"
- Within 7 days, move to "site_visit"
- Verify: Escalation does NOT trigger (manager/builder not notified)

### Automated Testing

Backend test suite should include:
```javascript
describe('Lead Priority Reset', () => {
    test('Should reset priority to medium when status changes', async () => {
        // Create lead with high priority
        // Update status
        // Assert priority === 'medium'
    });
    
    test('Should clear escalation state when status changes', async () => {
        // Create escalated lead
        // Update status
        // Assert escalationStage === 0 && isEscalated === false
    });
});

describe('Contacted-to-Site Visit Escalation', () => {
    test('Should escalate to manager at 7 days', async () => {
        // Create rule
        // Create lead in contacted for 7+ days
        // Process escalations
        // Assert priority === 'high' && isEscalated === true
    });
    
    test('Should escalate to builder at 14 days', async () => {
        // Create lead in contacted for 14+ days
        // Process escalations
        // Assert priority === 'critical'
    });
    
    test('Should auto-close as lost at 21 days', async () => {
        // Create lead in contacted for 21+ days
        // Process escalations
        // Assert status === 'lost'
    });
    
    test('Should prevent escalation if moved to site_visit within 7 days', async () => {
        // Create lead in contacted
        // Move to site_visit within 7 days
        // Process escalations
        // Assert isEscalated === false
    });
});
```

---

## Monitoring & Operations

### Checking Escalation Status

**Via API:**
```bash
# Get all escalation rules
GET /api/admin/escalation-rules

# Get escalated leads
GET /crm/escalations
GET /builder/escalations
GET /admin/escalations
```

**Via MongoDB:**
```javascript
// Check rules
db.escalationrules.find()

// Check leads with escalation
db.leads.find({ 
    status: "contacted", 
    escalationStage: { $gt: 0 } 
})

// Check lead escalation history
db.leads.findOne({ _id: ObjectId("...") }).escalationHistory
```

### Troubleshooting

**Escalation Not Triggering:**
1. Verify rule is enabled: `escalationrules.findOne({ ruleName: "Contacted to Site Visit Escalation" }) -> enabled: true`
2. Check cron job is running: Look for log messages "[EscalationCron] Running scheduled escalation processing..."
3. Verify lead time calculation: Check statusHistory timestamp is older than stage threshold

**Notifications Not Appearing:**
1. Verify Notification model is working
2. Check user roles exist (crm_manager, builder)
3. Verify users are marked isActive: true

---

## Future Enhancements

### Additional Escalation Rules (To Be Implemented)

Following the same pattern, you can create similar rules for other status transitions:

- **Site Visit to Qualified**: 7-14-21 day escalation
- **Qualified to Negotiating**: 7-14-21 day escalation
- **Negotiating to Proposal Sent**: 7-14-21 day escalation
- **Proposal Sent to Converted**: Custom timeline based on business rules

Use the same seeding script pattern:
```bash
npm run seed:site-visit-qualified
npm run seed:qualified-negotiating
# etc.
```

### Dynamic Configuration

The system supports per-project escalation rules via `projectId` field in EscalationRule. This allows:
- Different escalation timelines per project
- Project-specific escalation policies
- A/B testing different escalation strategies

---

## Summary of Changes

### Code Changes Summary
| File | Change | Impact |
|------|--------|--------|
| `server/src/routes/crm.js` | Added priority reset logic in PATCH /crm/leads/:id/status | All status changes now reset priority to medium |
| `server/src/scripts/seedContactedToSiteVisitRule.js` | New file - Seeding script | Creates Contacted-to-Site Visit escalation rule |

### Database Changes Summary
| Collection | Change | Impact |
|------------|--------|--------|
| `escalationrules` | New rule added | New "Contacted to Site Visit Escalation" rule active |

### No Breaking Changes ✅
- Existing APIs remain unchanged
- Backward compatible with existing leads
- Can be deployed without data migration
- Escalation processor handles both old and new rules seamlessly

---

**Implementation Status:** ✅ Complete  
**Ready for Testing:** ✅ Yes  
**Ready for Production:** ✅ Yes (after testing)  

For questions or issues, refer to:
- [CRM Escalation Implementation Guide](CRM_ESCALATION_IMPLEMENTATION.md)
- [Backend Testing Guide](docs/BACKEND_TESTING.md)
- [Architecture Documentation](ARCHITECTURE.md)
