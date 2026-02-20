# BuiltCred - Master Implementation Plan: Phase 6 & 7 (CRM/Sales Module)

**Project:** BuiltCred - Construction Referral Program  
**Phase:** 6 & 7 - CRM/Sales Core & Advanced  
**Start Date:** February 21, 2026  
**Target:** Production-Ready Application  
**Status:** 🚀 IN PROGRESS

---

## 📋 Table of Contents
1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Phase 6 & 7 Requirements](#phase-6-7-requirements)
4. [Database Architecture](#database-architecture)
5. [Backend Implementation Plan](#backend-implementation-plan)
6. [Frontend Implementation Plan](#frontend-implementation-plan)
7. [Implementation Sequence](#implementation-sequence)
8. [Testing & Validation](#testing-validation)

---

## 📊 Executive Summary

### What's Already Done (Phases 1-5) ✅
- ✅ **Phase 1:** Infrastructure, Authentication, JWT, Role-Based Access Control
- ✅ **Phase 2:** Admin Module - User Management, Project Management, Audit Logs
- ✅ **Phase 3:** Builder Module - Customer Upload, Auto-Advocate Creation, Reports
- ✅ **Phase 4:** Project Advocates - Referral Submission, Reward Tracking, Documentation
- ✅ **Phase 5:** Brand Advocates - Cross-Project Referrals, Separate Dashboard

### What Needs Implementation (Phases 6 & 7) 🔨
- 🔨 **Phase 6 Core:** CRM Manager Dashboard, Referral Assignment, Sales Pipeline, Call Logging
- 🔨 **Phase 7 Advanced:** Auto-Escalation, Note Validation, Payment Tracking, Analytics

### Key Stakeholders
1. **CRM Manager:** Manages advocates, assigns referrals to sales associates
2. **Sales Associate:** Handles calls, updates status, logs interactions, marks payments
3. **Builder/Admin:** Views CRM performance, escalations, conversion metrics

---

## 🔍 Current State Analysis

### ✅ Existing Infrastructure
1. **Database Models:**
   - ✅ User (with roles: crm_manager, sales_associate)
   - ✅ Project (builder assignments)
   - ✅ Customer (uploaded by builders)
   - ✅ Referral (created by project advocates)
   - ✅ Reward (commission tracking)
   - ✅ Escalation (issue tracking)
   - ✅ BrandReferral (cross-project)
   - ✅ AuditLog (system tracking)

2. **Backend Routes:**
   - ✅ `/api/auth/*` - Authentication
   - ✅ `/api/admin/*` - Admin operations
   - ✅ `/api/projects/*` - Project management
   - ✅ `/api/builder/*` - Builder operations
   - ✅ `/api/advocate/*` - Project advocate operations
   - ✅ `/api/brand/*` - Brand advocate operations
   - ❌ `/api/crm/*` - **NEEDS CREATION**

3. **Frontend Pages (CRM):**
   - ✅ CRMDashboard - Placeholder
   - ✅ CRMAdvocatesPage - Placeholder
   - ✅ CRMReferralsPage - Placeholder
   - ✅ CRMPipelinePage - Placeholder
   - ✅ CRMPaymentsPage - Placeholder
   - ✅ CRMNavbar - Navigation ready
   - ✅ CRMOutlet - Routing ready

### ❌ What's Missing

#### Backend (0% Complete)
- No `/api/crm/*` routes
- No CRM-specific middleware
- No referral assignment logic
- No sales pipeline status tracking
- No interaction/call logging
- No auto-escalation system
- No payment status tracking

#### Frontend (5% Complete)
- Placeholder pages only
- No data fetching
- No forms for assignment
- No pipeline visualization
- No interaction logging UI
- No payment tracking UI

---

## 📐 Phase 6 & 7 Requirements

### Phase 6: CRM Core Module

#### 6.1 CRM Manager Dashboard
- **Stats Cards:**
  - Total advocates (project + brand)
  - Active referrals count
  - Conversion rate %
  - Pending assignments
- **Recent Activity Feed**
- **Quick Actions:** Assign referral, view pipeline

#### 6.2 Advocates Management
- **List View:**
  - All project advocates with performance stats
  - Referral count, conversion rate, rewards earned
  - Filter by project, status, performance
  - Search by name/phone/email
- **Performance Tiers:**
  - 🌟 Gold: 10+ referrals
  - 🥈 Silver: 5-9 referrals
  - 🥉 Bronze: 1-4 referrals
  - 📭 Inactive: 0 referrals

#### 6.3 Referrals Management (CRM Manager View)
- **Master Referrals List:**
  - All referrals from all advocates
  - Status: pending, contacted, qualified, converted, lost
  - Assignment status: unassigned, assigned
  - Filter by status, project, advocate, sales associate
  - Search by customer name/phone
- **Assignment Interface:**
  - Dropdown per referral to select sales associate
  - Bulk assignment capability
  - Auto-assignment rules (round-robin/load-based)
- **Actions:**
  - Assign/Re-assign referral
  - View interaction history
  - Escalate manually
  - Mark as lost (with reason)

#### 6.4 Sales Pipeline (Kanban View)
- **Columns:**
  1. Pending (unassigned)
  2. Assigned (to sales associate)
  3. Contacted (first touch made)
  4. Qualified (interested customer)
  5. Converted (sale completed)
  6. Lost (deal lost)
- **Card Details:**
  - Customer name, phone
  - Advocate name
  - Assigned sales associate
  - Days in current status
  - Last interaction date
  - Quick actions: Call, Note, Status Update
- **Drag & Drop:** Move cards between columns

#### 6.5 Sales Associate Dashboard
- **My Assigned Referrals:**
  - List of referrals assigned to logged-in sales associate
  - Pending actions highlighted
  - Call reminders for follow-ups
- **Daily Activity Log:**
  - Calls made today
  - Status updates made
  - Notes added
- **Quick Actions:**
  - Log call
  - Update status
  - Mark payment

#### 6.6 Call & Interaction Logging
- **Call Log Form:**
  - Referral selection
  - Call duration
  - Call outcome (answered, busy, no answer, callback requested)
  - Notes (minimum 50 words for specific outcomes)
  - Next follow-up date
- **Interaction History:**
  - Timeline view per referral
  - All calls, notes, status changes
  - Associated sales associate
  - Timestamps

### Phase 7: CRM Advanced Module

#### 7.1 Auto-Escalation System
- **Triggers:**
  - No contact within 48 hours of assignment
  - No status update in 72 hours
  - Stuck in "qualified" for 7+ days
  - Sales associate adds < 50 words note
- **Escalation Actions:**
  - Create escalation record
  - Notify CRM manager
  - Flag in dashboard
  - Auto-reassign option

#### 7.2 Note Validation
- **Rules:**
  - Minimum 50 words for unattended leads
  - Mandatory notes when marking as "lost"
  - Quality check for generic notes
- **Frontend Validation:**
  - Live word counter
  - Character counter
  - Submit disabled until criteria met
- **Backend Validation:**
  - Word count check
  - Return 400 error if invalid

#### 7.3 Payment Tracking
- **Payment Status Workflow:**
  - Pending → Processed → Failed/Completed
- **Payment Form:**
  - Amount
  - Payment method (bank transfer, check, cash, online)
  - Payment date
  - Transaction ID
  - Notes
- **Payment Dashboard:**
  - Total payments pending
  - Total payments processed
  - Payment history by referral
  - Export to CSV

#### 7.4 Analytics & Reports
- **CRM Manager Reports:**
  - Sales associate performance comparison
  - Conversion rates by project
  - Average time to conversion
  - Escalation trends
  - Payment collection efficiency
- **Charts:**
  - Referral funnel visualization
  - Time-series conversion graph
  - Sales associate leaderboard
  - Advocate performance distribution

---

## 🗄️ Database Architecture

### New Models Required

#### 1. ReferralAssignment
```javascript
{
  referralId: ObjectId (Referral),
  salesAssociateId: ObjectId (User),
  assignedBy: ObjectId (User - CRM Manager),
  assignedAt: Date,
  status: enum ['active', 'reassigned', 'completed'],
  notes: String
}
```

#### 2. Interaction
```javascript
{
  referralId: ObjectId (Referral),
  salesAssociateId: ObjectId (User),
  interactionType: enum ['call', 'email', 'whatsapp', 'meeting', 'note'],
  outcome: enum ['answered', 'no_answer', 'busy', 'callback_requested', 'other'],
  duration: Number (seconds),
  notes: String (min 50 words for specific types),
  nextFollowUpDate: Date,
  createdAt: Date
}
```

#### 3. PaymentRecord
```javascript
{
  referralId: ObjectId (Referral),
  customerId: ObjectId (Customer),
  projectId: ObjectId (Project),
  amount: Number,
  currency: String (default: 'INR'),
  paymentMethod: enum ['bank_transfer', 'check', 'cash', 'online'],
  paymentDate: Date,
  transactionId: String,
  status: enum ['pending', 'processed', 'failed', 'completed'],
  processedBy: ObjectId (User - Sales Associate),
  notes: String,
  receiptUrl: String
}
```

### Updates to Existing Models

#### Referral Model Updates
```javascript
// Add fields:
assignedTo: ObjectId (User - Sales Associate)
assignedAt: Date
lastContactedAt: Date
lastInteractionAt: Date
daysInCurrentStatus: Number (virtual)
escalationFlag: Boolean (default: false)
escalationReason: String
```

---

## 🔧 Backend Implementation Plan

### Step 1: Create New Models
1. **File:** `server/src/models/ReferralAssignment.js`
2. **File:** `server/src/models/Interaction.js`
3. **File:** `server/src/models/PaymentRecord.js`
4. Update `server/src/models/Referral.js` with new fields

### Step 2: Create CRM Middleware
**File:** `server/src/middleware/crm.js`
- `verifyCRMManager` - Ensures user is crm_manager
- `verifySalesAssociate` - Ensures user is sales_associate
- `verifyCRMAccess` - Allows both crm_manager and sales_associate

### Step 3: Create CRM Routes
**File:** `server/src/routes/crm.js`

#### CRM Manager Endpoints (14 endpoints)
1. `GET /api/crm/dashboard/stats` - Dashboard statistics
2. `GET /api/crm/advocates` - List all advocates with performance
3. `GET /api/crm/advocates/:id` - Advocate details
4. `GET /api/crm/referrals` - All referrals (with filters)
5. `GET /api/crm/referrals/:id` - Single referral details
6. `POST /api/crm/referrals/:id/assign` - Assign referral to sales associate
7. `PUT /api/crm/referrals/:id/reassign` - Reassign referral
8. `GET /api/crm/pipeline` - Pipeline view data
9. `GET /api/crm/escalations` - All escalations
10. `POST /api/crm/escalations` - Manual escalation
11. `GET /api/crm/analytics/conversion-rate` - Conversion analytics
12. `GET /api/crm/analytics/sales-associates` - Sales associate performance
13. `GET /api/crm/payments` - All payment records
14. `GET /api/crm/reports/export` - Export reports (CSV)

#### Sales Associate Endpoints (10 endpoints)
1. `GET /api/crm/associate/dashboard` - Sales associate dashboard
2. `GET /api/crm/associate/referrals` - My assigned referrals
3. `GET /api/crm/associate/referrals/:id` - Referral details
4. `PATCH /api/crm/associate/referrals/:id/status` - Update referral status
5. `POST /api/crm/associate/interactions` - Log interaction/call
6. `GET /api/crm/associate/interactions/:referralId` - Interaction history
7. `POST /api/crm/associate/payments` - Mark payment
8. `GET /api/crm/associate/payments` - My payment records
9. `GET /api/crm/associate/activity-log` - Daily activity
10. `GET /api/crm/associate/performance` - My performance stats

### Step 4: Implement Auto-Escalation Logic
**File:** `server/src/utils/autoEscalation.js`
- Cron job or periodic check
- Detect referrals meeting escalation criteria
- Create escalation records
- Send notifications

### Step 5: Update Server Index
**File:** `server/src/index.js`
- Import and mount `/api/crm` routes

---

## 🎨 Frontend Implementation Plan

### Step 1: Update API Client
**File:** `client/src/api/client.js`
Add `crmAPI` object with all 24 endpoints

### Step 2: Create Shared Components

#### 2.1 ReferralCard Component
**File:** `client/src/components/crm/ReferralCard.jsx`
- Display referral info
- Status badge
- Quick actions menu
- Used in multiple pages

#### 2.2 InteractionTimeline Component
**File:** `client/src/components/crm/InteractionTimeline.jsx`
- Display interaction history
- Timeline view with icons
- Expandable notes

#### 2.3 AssignmentDropdown Component
**File:** `client/src/components/crm/AssignmentDropdown.jsx`
- Dropdown to select sales associate
- Shows current assignment
- Confirm dialog

#### 2.4 CallLogModal Component
**File:** `client/src/components/crm/CallLogModal.jsx`
- Form to log call/interaction
- Note validation (50 words)
- Follow-up date picker

#### 2.5 PaymentModal Component
**File:** `client/src/components/crm/PaymentModal.jsx`
- Payment entry form
- Amount, method, date
- Transaction ID

#### 2.6 StatsCard Component
**File:** `client/src/components/crm/StatsCard.jsx`
- Reusable stat display
- Icon, title, value, trend

### Step 3: Implement CRM Manager Pages

#### 3.1 CRMDashboard (Replace Placeholder)
**File:** `client/src/pages/dashboards/CRMDashboard.jsx`
- Dashboard stats (4-6 cards)
- Recent activity feed
- Quick actions section
- Charts (if time permits)

#### 3.2 CRMAdvocatesPage (Replace Placeholder)
**File:** `client/src/pages/crm/CRMAdvocatesPage.jsx`
- Table of all advocates
- Performance metrics columns
- Tier badges (Gold, Silver, Bronze)
- Filters (project, status)
- Search bar
- Click to view advocate details

#### 3.3 CRMReferralsPage (Replace Placeholder)
**File:** `client/src/pages/crm/CRMReferralsPage.jsx`
- Master referrals table
- Columns: Customer, Advocate, Status, Assigned To, Actions
- Assignment dropdown in each row
- Filters (status, project, assigned/unassigned)
- Search bar
- Bulk actions (assign multiple)
- Click row to view details

#### 3.4 CRMPipelinePage (Replace Placeholder)
**File:** `client/src/pages/crm/CRMPipelinePage.jsx`
- Kanban board with 6 columns
- Drag & drop referral cards
- Card shows: customer, advocate, sales associate, days in status
- Quick actions on card hover
- Filter by project/sales associate
- Auto-refresh every 30 seconds

#### 3.5 CRMPaymentsPage (Replace Placeholder)
**File:** `client/src/pages/crm/CRMPaymentsPage.jsx`
- Payment records table
- Summary cards (pending, processed, total)
- Filters (status, date range, project)
- Search by customer/transaction ID
- Export to CSV button
- Click to view payment details

### Step 4: Implement Sales Associate Pages

#### 4.1 SalesAssociateDashboard (New)
**File:** `client/src/pages/dashboards/SalesAssociateDashboard.jsx`
- My assigned referrals count
- Pending actions list
- Daily activity summary
- Performance metrics (this month)
- Quick action buttons

#### 4.2 SalesAssociateReferralsPage (New)
**File:** `client/src/pages/crm/SalesAssociateReferralsPage.jsx`
- My assigned referrals table
- Status badges
- Days since assignment
- Quick actions: Log Call, Update Status
- Click to view interaction history

### Step 5: Update Navigation & Routing

#### 5.1 Update CRMNavbar (Conditional Items)
**File:** `client/src/components/navbars/CRMNavbar.jsx`
- Show different menu items for CRM Manager vs Sales Associate
- Manager: Dashboard, Advocates, Referrals, Pipeline, Payments
- Associate: Dashboard, My Referrals, Activity Log

#### 5.2 Update App.jsx Routing
**File:** `client/src/App.jsx`
- Add conditional routes based on role
- CRM Manager routes
- Sales Associate routes

---

## 🔄 Implementation Sequence

### Day 1: Database & Backend Foundation
**Tasks:**
1. Create 3 new models (ReferralAssignment, Interaction, PaymentRecord)
2. Update Referral model with new fields
3. Create CRM middleware (verifyCRMManager, verifySalesAssociate)
4. Create `/api/crm` route file structure
5. Implement 5 basic endpoints (dashboard stats, advocates list, referrals list)

### Day 2: Backend - CRM Manager Endpoints
**Tasks:**
1. Implement referral assignment endpoint
2. Implement pipeline view endpoint
3. Implement escalation endpoints
4. Implement analytics endpoints
5. Test all CRM Manager endpoints with Postman

### Day 3: Backend - Sales Associate Endpoints
**Tasks:**
1. Implement sales associate dashboard endpoint
2. Implement interaction logging endpoint
3. Implement status update endpoint
4. Implement payment marking endpoint
5. Test all Sales Associate endpoints

### Day 4: Frontend - Shared Components
**Tasks:**
1. Create ReferralCard component
2. Create InteractionTimeline component
3. Create AssignmentDropdown component
4. Create CallLogModal component
5. Create PaymentModal component
6. Create StatsCard component

### Day 5: Frontend - CRM Manager Pages (Part 1)
**Tasks:**
1. Update CRMDashboard with real data
2. Implement CRMAdvocatesPage
3. Update API client with crmAPI methods
4. Test data fetching and display

### Day 6: Frontend - CRM Manager Pages (Part 2)
**Tasks:**
1. Implement CRMReferralsPage with assignment
2. Implement CRMPipelinePage (Kanban board)
3. Implement CRMPaymentsPage
4. Test all CRM Manager flows

### Day 7: Frontend - Sales Associate Pages
**Tasks:**
1. Create SalesAssociateDashboard
2. Create SalesAssociateReferralsPage
3. Update CRMNavbar with conditional rendering
4. Update App.jsx routing
5. Test all Sales Associate flows

### Day 8: Auto-Escalation & Validation
**Tasks:**
1. Implement auto-escalation logic
2. Implement note validation (50 words)
3. Add escalation notifications
4. Test escalation triggers

### Day 9: Integration Testing
**Tasks:**
1. End-to-end testing (Builder → CRM → Sales Associate)
2. Test referral assignment flow
3. Test interaction logging
4. Test payment tracking
5. Test escalation system

### Day 10: Polish & Production Ready
**Tasks:**
1. Bug fixes from testing
2. Error handling improvements
3. Loading states and skeleton screens
4. Responsive design adjustments
5. Documentation updates
6. Final deployment check

---

## ✅ Testing & Validation

### Backend Testing Checklist
- [ ] All 24 CRM endpoints return correct data
- [ ] Role-based access control works (manager vs associate)
- [ ] Referral assignment persists correctly
- [ ] Interaction logs are saved with proper validation
- [ ] Payment records are created correctly
- [ ] Auto-escalation triggers work
- [ ] Note validation (50 words) works
- [ ] Error handling for all edge cases

### Frontend Testing Checklist
- [ ] CRM Manager can view all advocates
- [ ] CRM Manager can assign referrals
- [ ] CRM Manager can view pipeline
- [ ] Sales Associate sees only assigned referrals
- [ ] Sales Associate can log calls
- [ ] Sales Associate can update status
- [ ] Sales Associate can mark payments
- [ ] Note validation shows word count
- [ ] All forms validate correctly
- [ ] Loading states display properly
- [ ] Error messages are user-friendly

### Integration Testing Checklist
- [ ] Builder uploads customers → Creates advocates
- [ ] Advocate submits referral → Appears in CRM
- [ ] CRM Manager assigns referral → Sales Associate sees it
- [ ] Sales Associate logs call → Appears in history
- [ ] Sales Associate updates status → Pipeline updates
- [ ] Sales Associate marks payment → Reward generated
- [ ] Auto-escalation creates escalation record
- [ ] Builder sees escalations in their dashboard

### User Acceptance Testing Scenarios

#### Scenario 1: CRM Manager Assigns Referral
1. Login as CRM Manager
2. Navigate to Referrals page
3. See list of unassigned referrals
4. Click assignment dropdown on a referral
5. Select sales associate from list
6. Confirm assignment
7. Verify referral moves to "Assigned" status
8. Logout

#### Scenario 2: Sales Associate Handles Referral
1. Login as Sales Associate
2. Navigate to My Referrals
3. See assigned referrals
4. Click on a referral
5. Click "Log Call" button
6. Fill in call details and notes (50+ words)
7. Set next follow-up date
8. Submit call log
9. Update referral status to "Contacted"
10. Verify status updates in pipeline

#### Scenario 3: Payment Tracking
1. Login as Sales Associate
2. Navigate to converted referral
3. Click "Mark Payment"
4. Fill in payment details
5. Submit payment record
6. Verify payment appears in CRM Payments page
7. Verify reward is generated for advocate

#### Scenario 4: Auto-Escalation
1. Assign referral to sales associate
2. Wait 48 hours without interaction
3. Verify escalation is auto-created
4. Verify CRM Manager sees escalation flag
5. Verify Builder sees escalation in their dashboard

---

## 📈 Success Metrics

### Phase 6 & 7 Completion Criteria
- ✅ 24 CRM API endpoints implemented and tested
- ✅ 3 new database models created
- ✅ 6 shared CRM components built
- ✅ 5 CRM Manager pages fully functional
- ✅ 2 Sales Associate pages fully functional
- ✅ Auto-escalation system operational
- ✅ Note validation (50 words) enforced
- ✅ Payment tracking complete
- ✅ All integration tests passing
- ✅ Production-ready code (no bugs)

### Code Quality Standards
- All backend routes have error handling
- All frontend components have loading states
- All forms have client & server validation
- All API calls have proper error messages
- All user actions have feedback (success/error toasts)
- Code follows existing project conventions
- No console errors or warnings
- Responsive design for mobile/tablet/desktop

---

## 🚀 Next Steps After Phase 6 & 7

### Phase 8: Notifications & Communication
- WhatsApp integration (Gupshup API)
- Bulk messaging to advocates
- Automated reminders for sales associates
- Notification center

### Phase 9: Reporting & Analytics
- Advanced charts and graphs
- Custom report builder
- Export functionality (PDF, Excel)
- Performance dashboards

### Phase 10: System Optimization & Testing
- Unit tests for all components
- Integration tests for all flows
- Performance optimization
- Security audit
- Production deployment

---

## 📝 Notes & Considerations

### Design Decisions
1. **Referral Assignment:** One-to-one (one sales associate per referral) vs one-to-many (multiple associates). **Decision:** One-to-one for accountability.
2. **Pipeline View:** Real-time vs polling. **Decision:** Polling every 30 seconds for simplicity.
3. **Auto-Escalation:** Cron job vs event-driven. **Decision:** Event-driven on status update checks.
4. **Payment Tracking:** Separate model vs embedded in Referral. **Decision:** Separate for detailed tracking.

### Potential Challenges
1. **Large Datasets:** Pagination and filtering are critical for performance
2. **Real-time Updates:** Consider WebSocket for future if needed
3. **Note Validation:** Client-side only vs server-side. **Solution:** Both for security.
4. **Escalation Rules:** Configurable vs hardcoded. **Solution:** Hardcoded for now, configurable in Phase 9.

### Dependencies
- No external libraries required beyond existing stack
- Existing Referral model can be extended without breaking changes
- Builder module integration is already in place

---

**Document Version:** 1.0  
**Last Updated:** February 21, 2026  
**Author:** Development Team  
**Status:** Master Plan Approved - Ready for Implementation
