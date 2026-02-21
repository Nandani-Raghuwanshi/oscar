# Escalations - Builder & Admin Updates

## Summary
This document tracks the completion of 5 major updates to the escalation system.

## Completed Updates

### ✅ Update 1: Builder Escalations - Project List Fix
**Issue:** Builder's escalation page was not getting project list from database.

**Solution:**
- Modified `/server/src/routes/builder.js` - GET `/builder/escalations` endpoint
- Changed from using old `Escalation` model to `Lead` model
- Added filter for `escalationStage >= 2` (builder-level escalations)
- Leads are populated with `referralId`, `assignedToId`, and sorted by priority/date

**File Modified:** `server/src/routes/builder.js` (lines ~567-585)

### ✅ Update 2: Builder Escalations - Project-Wise Display
**Issue:** CRM/Sales manager's escalations should appear project-wise for builders.

**Solution:**
- Builder escalations endpoint already filters by `projectId` from auth context
- Frontend updated to display escalations with proper Lead model fields
- Table columns updated: Customer, Status, Priority, Stage, Assigned To, Escalated Date
- Status colors mapped to Lead status enum (new, contacted, site_visit, etc.)

**File Modified:** `client/src/pages/builder/BuilderEscalationsPage.jsx`

### ✅ Update 3: Builder Dashboard - KPIs Update
**Issue:** Update builder's dashboard to show open escalations count AND converted leads count.

**Solution:**
- Modified `/server/src/routes/builder.js` - GET `/builder/dashboard/stats` endpoint
- Added `escalations` count: Leads with `escalationStage >= 2`
- Added `convertedLeads` count: Leads with `status === 'converted'`
- Frontend updated to display both KPIs

**Files Modified:**
- `server/src/routes/builder.js` (lines ~542-559)
- `client/src/pages/dashboards/BuilderDashboard.jsx`

### ✅ Update 4: Admin Escalations Page
**Issue:** Create new Admin's escalation page with same functionalities as builder's page.

**Solution:**
- Created 2 new API endpoints in `server/src/routes/admin.js`:
  - GET `/admin/escalations` - Returns all escalated leads with `escalationStage >= 1`
  - GET `/admin/escalations/stats` - Returns summary statistics
- Both endpoints support filtering by `projectId`
- Completely rebuilt `client/src/pages/admin/AdminEscalationsPage.jsx`:
  - Replaced audit log functionality with escalations
  - Added project filter dropdown (loads all projects)
  - Added status and priority filters
  - Table columns: Customer, Project, Status, Priority, Stage, Assigned To, Escalated Date
  - Pagination support

**Files Modified:**
- `server/src/routes/admin.js` (added 2 endpoints before line ~453)
- `client/src/pages/admin/AdminEscalationsPage.jsx` (complete rewrite)

### ⏳ Update 5: CRM Pipeline - Time Tracking
**Issue:** In CRM/Sales manager's pipeline, show total days/hours spent in each status for each lead.

**Status:** NOT YET IMPLEMENTED

**Plan:**
- Calculate time spent in each status using `statusHistory` array
- Display "Time in status: X days Y hours" on each lead card in CRM pipeline
- Consider showing breakdown: "New (2d) → Contacted (7d) → Site Visit (3d)"

## Key Technical Details

### Lead Model Fields Used
```javascript
{
  isEscalated: Boolean,         // true if escalated
  escalationStage: Number,      // 0=none, 1=manager, 2=builder, 3=auto-closed
  escalationHistory: Array,     // escalation event log
  statusHistory: Array,         // status change history with updatedDate
  priority: String,             // low, medium, high, critical
  status: String,              // new, contacted, site_visit, qualified, etc.
  escalatedDate: Date,         // when escalation occurred
  projectId: ObjectId,         // reference to Project
  referralId: ObjectId,        // reference to customer/referral
  assignedToId: ObjectId       // reference to User
}
```

### Escalation Stage Mapping
- **Stage 0:** No escalation
- **Stage 1:** Escalated to Manager (HIGH priority)
- **Stage 2:** Escalated to Builder (CRITICAL priority)
- **Stage 3:** Auto-closed (status changed to LOST)

### Data Model Notes
- **OLD Model:** `Escalation` collection (separate, not used for CRM escalations)
- **NEW Model:** `Lead` collection with escalation fields (used for CRM escalations)
- Builder sees escalations with `escalationStage >= 2`
- Admin sees escalations with `escalationStage >= 1`

## API Endpoints

### Builder Endpoints
```
GET /builder/escalations
- Filters by projectId from auth context
- Returns leads with escalationStage >= 2
- Populates referralId, assignedToId

GET /builder/dashboard/stats
- Returns: escalations, convertedLeads, totalLeads, etc.
```

### Admin Endpoints
```
GET /admin/escalations?projectId=...
- Returns all escalated leads (escalationStage >= 1)
- Optional projectId filter
- Populates referralId, assignedToId, projectId

GET /admin/escalations/stats?projectId=...
- Returns: totalEscalations, byStage breakdown, byPriority breakdown
- Optional projectId filter
```

## Frontend Components

### Builder
- **BuilderEscalationsPage.jsx** - Displays escalations for builder's project
- **BuilderDashboard.jsx** - Shows KPIs including escalations and converted leads

### Admin
- **AdminEscalationsPage.jsx** - Displays all escalations across all projects with project filter

## Testing Checklist

### Builder
- [ ] Builder can see escalations page with project list
- [ ] Escalations table shows correct data (Customer, Status, Priority, Stage, etc.)
- [ ] Status colors display correctly
- [ ] Filters work (status, priority)
- [ ] Pagination works
- [ ] Dashboard shows escalations count
- [ ] Dashboard shows converted leads count

### Admin
- [ ] Admin can access escalations page
- [ ] Projects dropdown loads all projects
- [ ] Filter by project works
- [ ] Filter by status works
- [ ] Filter by priority works
- [ ] Clear filters button works
- [ ] Escalations table shows correct data with Project column
- [ ] Pagination works
- [ ] Admin sees escalations from all projects (stage 1+)

## Next Steps
1. Test all builder functionality
2. Test all admin functionality
3. Implement Update 5: CRM Pipeline Time Tracking
4. Run full end-to-end escalation scenarios

## Related Documents
- `ESCALATION_RULES_COMPLETE.md` - Escalation rules implementation
- `CRM_ESCALATION_IMPLEMENTATION.md` - Original escalation system documentation
