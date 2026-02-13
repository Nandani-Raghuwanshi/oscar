# BuiltCred Product Backlog
## Complete Feature List - MVP v2.0 (Phase 1: Months 1-3)

**Last Updated:** February 13, 2026  
**Version:** 2.0  
**Status:** Development Phase - MVP Implementation

---

## 🎯 Product Vision

BuiltCred is a referral management platform for real estate developers that enables customer advocacy through a dual-advocate system (Project Advocates & Brand Advocates), providing validation, tracking, and reward management with CRM integration.

---

## 📊 Epic Overview

### Epic 1: Core Advocate System
- **Priority:** P0 (Critical)
- **Story Points:** 89
- **Sprint:** 1-3

### Epic 2: Referral Engine
- **Priority:** P0 (Critical)
- **Story Points:** 144
- **Sprint:** 2-5

### Epic 3: Homeowner Portal
- **Priority:** P0 (Critical)
- **Story Points:** 103
- **Sprint:** 4-7

### Epic 4: Admin Panel
- **Priority:** P0 (Critical)
- **Story Points:** 121
- **Sprint:** 6-9

### Epic 5: CRM Integration
- **Priority:** P1 (High)
- **Story Points:** 89
- **Sprint:** 8-10

### Epic 6: Notifications & Communication
- **Priority:** P1 (High)
- **Story Points:** 55
- **Sprint:** 9-11

---

## 📋 Detailed Product Backlog

---

## EPIC 1: CORE ADVOCATE SYSTEM

### 1.1 Advocate Type Classification

**Priority:** P0 | **Story Points:** 13 | **Sprint:** 1

#### User Story
**As a** developer/admin  
**I want** the system to automatically classify customers as Project or Brand Advocates  
**So that** we can apply proper eligibility rules and track performance by advocate type

#### Acceptance Criteria
- [ ] System defines two advocate types: PROJECT_ADVOCATE and BRAND_ADVOCATE
- [ ] PROJECT_ADVOCATE = customer who owns in the same NEW project they're referring to
- [ ] BRAND_ADVOCATE = customer who owns in other projects by same developer
- [ ] Advocate type stored in customer profile database
- [ ] Advocate type badge displays on all relevant interfaces
- [ ] Historical advocate type data maintained for analytics

#### Technical Requirements
- Database schema includes `advocate_type` enum field
- Enum values: `PROJECT_ADVOCATE`, `BRAND_ADVOCATE`
- Foreign key relationship to customer table
- Index on advocate_type for filtering performance
- Migration script to classify existing customers

#### Definition of Done
- [ ] Database schema implemented
- [ ] API returns advocate_type in customer object
- [ ] Unit tests for classification logic (95% coverage)
- [ ] Integration tests for advocate type queries
- [ ] Documentation updated

---

### 1.2 Advocate Type Validation Engine

**Priority:** P0 | **Story Points:** 21 | **Sprint:** 1-2

#### User Story
**As a** backend system  
**I want** to validate advocate type selection against customer profile and target project  
**So that** only eligible customers can make referrals

#### Acceptance Criteria
- [ ] Validation runs on every referral submission
- [ ] Validates customer exists in database
- [ ] Validates same developer (rejects cross-developer)
- [ ] PROJECT_ADVOCATE validation: customer.project === target_project
- [ ] BRAND_ADVOCATE validation: customer.project !== target_project
- [ ] Returns specific error messages for each validation failure
- [ ] Auto-correction applied when possible
- [ ] Validation log created for audit trail

#### Technical Requirements
- Validation function: `validateAdvocateEligibility(userId, selectedType, targetProjectId)`
- Database queries optimized with proper indexes
- Response time < 200ms for validation
- Error codes: CUSTOMER_NOT_FOUND, CROSS_DEVELOPER_NOT_PERMITTED, INVALID_ADVOCATE_TYPE, PROJECT_MISMATCH
- Idempotent validation (can be called multiple times safely)

#### Edge Cases
- Customer owns multiple plots in same project
- Customer owns in multiple projects by same developer
- Customer recently purchased but not yet in database
- Target project status changed to closed/sold out
- Developer changed ownership of project

#### Definition of Done
- [ ] Validation function implemented
- [ ] All error codes handled
- [ ] Unit tests for all validation scenarios (100% coverage)
- [ ] Performance tests (< 200ms validation time)
- [ ] Edge case handling verified
- [ ] API documentation complete

---

### 1.3 Advocate Type Selection UI

**Priority:** P0 | **Story Points:** 8 | **Sprint:** 2

#### User Story
**As a** customer making a referral  
**I want** to select my advocate type  
**So that** the system validates my eligibility correctly

#### Acceptance Criteria
- [ ] Radio button selection for advocate types
- [ ] Clear visual distinction between types
- [ ] PROJECT_ADVOCATE option shows: "I own a plot/unit in the project I'm referring to"
- [ ] BRAND_ADVOCATE option shows: "I'm an existing customer from another project by this developer"
- [ ] Icon for each type (🏘️ for Project, ⭐ for Brand)
- [ ] Help text/tooltip explaining difference
- [ ] Mobile responsive design
- [ ] Accessible (WCAG 2.1 AA compliant)

#### Technical Requirements
- React component: `AdvocateTypeSelector`
- Props: `value`, `onChange`, `disabled`
- State management with controlled component pattern
- CSS styling matches design system
- Touch-friendly target size (44x44px minimum)

#### Design Specifications
- Radio button size: 20x20px
- Touch target: 44x44px
- Font size: 16px (title), 14px (description)
- Colors: #667eea (Project), #11998e (Brand)
- Border: 3px solid when selected
- Animation: 0.3s ease transition

#### Definition of Done
- [ ] Component implemented
- [ ] Storybook story created
- [ ] Visual regression tests pass
- [ ] Accessibility audit complete (Lighthouse score 100)
- [ ] Cross-browser tested (Chrome, Safari, Firefox, Edge)
- [ ] Mobile tested (iOS, Android)

---

### 1.4 Advocate Dashboard Differentiation

**Priority:** P0 | **Story Points:** 13 | **Sprint:** 2-3

#### User Story
**As a** customer advocate  
**I want** my dashboard to show information relevant to my advocate type  
**So that** I understand what I can do and see

#### Acceptance Criteria
- [ ] Dashboard header shows advocate type badge
- [ ] PROJECT_ADVOCATE sees: "You can refer to: [Your Project Name]"
- [ ] BRAND_ADVOCATE sees: "You can refer to: [List of active projects by your developer]"
- [ ] PROJECT_ADVOCATE sees project-specific updates/news
- [ ] BRAND_ADVOCATE sees developer-wide updates only
- [ ] Referral link generated for eligible projects only
- [ ] Statistics filtered by advocate type

#### Technical Requirements
- Dashboard component: `AdvocateDashboard`
- Role-based rendering logic
- API endpoint: GET `/api/v1/advocates/me/eligible-projects`
- Response caching (5 minutes TTL)
- Real-time updates via WebSocket (optional for MVP)

#### Data Privacy
- PROJECT_ADVOCATE cannot see other projects' customer data
- BRAND_ADVOCATE cannot see any project's customer data
- Both can only see their own referrals
- No cross-project data leakage

#### Definition of Done
- [ ] Dashboard UI implemented
- [ ] API endpoint created
- [ ] Privacy rules enforced
- [ ] Unit tests for role-based rendering
- [ ] Integration tests for data access
- [ ] Security audit passed

---

### 1.5 Advocate Type Reporting & Analytics

**Priority:** P1 | **Story Points:** 13 | **Sprint:** 3

#### User Story
**As a** developer admin  
**I want** to see performance metrics by advocate type  
**So that** I can understand which type drives better results

#### Acceptance Criteria
- [ ] Admin dashboard shows advocate type distribution
- [ ] Metrics: Total advocates by type
- [ ] Metrics: Referrals per advocate by type
- [ ] Metrics: Conversion rate by type
- [ ] Metrics: Average referral value by type
- [ ] Comparative charts (Project vs Brand)
- [ ] Export to CSV with advocate type column
- [ ] Date range filter
- [ ] Project filter

#### Technical Requirements
- Analytics service: `AdvocateAnalyticsService`
- Database aggregation queries optimized
- Caching strategy (15 minutes for dashboard)
- Chart library: Recharts
- CSV export with proper headers

#### Metrics Calculated
```
PROJECT_ADVOCATE:
- Total count
- Active advocates (made >= 1 referral in last 30 days)
- Avg referrals per advocate
- Conversion rate
- Total rewards paid
- Avg reward per conversion

BRAND_ADVOCATE:
- Total count
- Active advocates
- Avg referrals per advocate
- Conversion rate
- Total rewards paid
- Avg reward per conversion
```

#### Definition of Done
- [ ] Analytics queries implemented
- [ ] Dashboard charts rendered
- [ ] Export functionality working
- [ ] Performance optimized (< 2s load time)
- [ ] Unit tests for calculations
- [ ] QA approval

---

### 1.6 Advocate Type in Sales Communication

**Priority:** P0 | **Story Points:** 8 | **Sprint:** 2

#### User Story
**As a** sales representative  
**I want** to see the advocate type when receiving a referral  
**So that** I can position my conversation appropriately

#### Acceptance Criteria
- [ ] Lead record shows advocate type badge
- [ ] PROJECT_ADVOCATE displays: "Referred by a fellow resident"
- [ ] BRAND_ADVOCATE displays: "Referred by existing [Developer Name] customer"
- [ ] Sales context field populated with relationship description
- [ ] Email notification includes advocate type context
- [ ] CRM integration sends advocate type field

#### Technical Requirements
- Field: `sales_context` (string, 255 chars)
- Auto-generated from advocate_type and project data
- Templates for context messages
- Email template includes advocate context

#### Context Generation Logic
```
if advocate_type == PROJECT_ADVOCATE:
  context = f"Referred by {referrer_name} who owns {plot_number} in {project_name}"
else:
  context = f"Referred by {referrer_name}, an existing {developer_name} customer from {source_project}"
```

#### Definition of Done
- [ ] Context generation implemented
- [ ] UI displays context
- [ ] Email template updated
- [ ] CRM webhook includes field
- [ ] Unit tests for context generation
- [ ] Sales team trained on interpretation

---

### 1.7 Cross-Developer Validation

**Priority:** P0 | **Story Points:** 13 | **Sprint:** 1

#### User Story
**As a** system admin  
**I want** to prevent cross-developer referrals  
**So that** advocates can only refer to their own developer's projects

#### Acceptance Criteria
- [ ] Validation checks customer.developer === target_project.developer
- [ ] Rejects referral if developers don't match
- [ ] Error message: "You can only refer to [Your Developer] projects"
- [ ] Logs cross-developer attempts for monitoring
- [ ] Admin alert if multiple cross-developer attempts detected

#### Technical Requirements
- Database schema includes `developer_id` foreign key
- Index on developer_id for query performance
- Validation function: `validateSameDeveloper(customerId, projectId)`
- Audit log table for failed attempts
- Rate limiting to prevent abuse

#### Security Considerations
- Prevent SQL injection on developer_id comparison
- Sanitize error messages (don't leak internal IDs)
- Rate limit: Max 5 validation failures per hour per user

#### Definition of Done
- [ ] Validation implemented
- [ ] Audit logging active
- [ ] Security review passed
- [ ] Unit tests for validation
- [ ] Integration tests for cross-developer scenarios
- [ ] Documentation updated

---

## EPIC 2: REFERRAL ENGINE

### 2.1 Referral Submission Form

**Priority:** P0 | **Story Points:** 13 | **Sprint:** 2

#### User Story
**As a** customer advocate  
**I want** to submit a referral through a simple form  
**So that** I can recommend friends and family

#### Acceptance Criteria
- [ ] Form fields: Referred person's name, phone, email (optional), budget range, notes
- [ ] Advocate type selection (radio buttons)
- [ ] Target project selection (dropdown)
- [ ] Client-side validation for required fields
- [ ] Phone number format validation
- [ ] Email format validation
- [ ] Character limits enforced
- [ ] Submit button disabled during submission
- [ ] Loading indicator during API call
- [ ] Success message on submission
- [ ] Error handling with user-friendly messages

#### Technical Requirements
- React component: `ReferralSubmissionForm`
- Form library: React Hook Form
- Validation library: Yup schema validation
- API endpoint: POST `/api/v1/referrals`
- Request payload max size: 10KB
- Response time SLA: < 1 second

#### Field Specifications
```
name: string, required, 2-100 chars
phone: string, required, E.164 format validation
email: string, optional, RFC 5322 format
budget_range: enum, optional, values: [50L-75L, 75L-1Cr, 1Cr-1.5Cr, 1.5Cr+]
notes: string, optional, max 500 chars
advocate_type: enum, required, values: [PROJECT_ADVOCATE, BRAND_ADVOCATE]
target_project_id: uuid, required
```

#### Definition of Done
- [ ] Form component implemented
- [ ] Validation working
- [ ] API integration complete
- [ ] Error handling tested
- [ ] Accessibility compliant
- [ ] Mobile responsive
- [ ] Unit tests (90% coverage)
- [ ] E2E tests for happy path and error scenarios

---

### 2.2 Backend Referral Processing

**Priority:** P0 | **Story Points:** 21 | **Sprint:** 2-3

#### User Story
**As a** backend system  
**I want** to process referral submissions with full validation  
**So that** only valid referrals are created

#### Acceptance Criteria
- [ ] Receives referral submission payload
- [ ] Validates advocate eligibility
- [ ] Checks for duplicate referrals (same phone + project)
- [ ] Generates unique referral ID (format: REF-YYYY-NNNNNN)
- [ ] Records first-touch attribution
- [ ] Stores complete referral record
- [ ] Triggers CRM webhook
- [ ] Sends confirmation email to referrer
- [ ] Sends notification email to sales team
- [ ] Returns success response with referral ID

#### Technical Requirements
- Service: `ReferralProcessingService`
- Database: PostgreSQL with ACID transactions
- Duplicate detection: Check phone + project_id within last 90 days
- Referral ID generation: Sequential with year prefix
- Asynchronous webhook calls (don't block response)
- Email queue for reliable delivery

#### Database Schema
```sql
CREATE TABLE referrals (
  id UUID PRIMARY KEY,
  referral_id VARCHAR(20) UNIQUE NOT NULL,
  referrer_id UUID REFERENCES customers(id),
  advocate_type VARCHAR(20) NOT NULL,
  source_project_id UUID REFERENCES projects(id),
  target_project_id UUID REFERENCES projects(id),
  developer_id UUID REFERENCES developers(id),
  lead_name VARCHAR(100) NOT NULL,
  lead_phone VARCHAR(20) NOT NULL,
  lead_email VARCHAR(255),
  budget_range VARCHAR(20),
  notes TEXT,
  channel VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'NEW',
  sales_context TEXT,
  first_touch_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_status ON referrals(status);
CREATE INDEX idx_referrals_advocate_type ON referrals(advocate_type);
CREATE INDEX idx_referrals_project ON referrals(target_project_id);
CREATE UNIQUE INDEX idx_referrals_duplicate ON referrals(lead_phone, target_project_id) 
  WHERE status != 'DUPLICATE';
```

#### Error Handling
- Duplicate: Return 409 Conflict with existing referral ID
- Validation failure: Return 400 Bad Request with specific error
- CRM webhook failure: Log error, queue retry, don't fail request
- Email failure: Log error, queue retry, don't fail request

#### Definition of Done
- [ ] Service implemented
- [ ] Database schema created
- [ ] Duplicate detection working
- [ ] Webhook integration complete
- [ ] Email notifications working
- [ ] Unit tests (95% coverage)
- [ ] Integration tests for all scenarios
- [ ] Load tests (100 concurrent requests)
- [ ] Error handling verified
- [ ] Documentation complete

---

### 2.3 Referral Link Generation

**Priority:** P0 | **Story Points:** 13 | **Sprint:** 3

#### User Story
**As a** customer advocate  
**I want** a unique referral link  
**So that** I can share it easily and track my referrals

#### Acceptance Criteria
- [ ] Each advocate gets project-specific referral links
- [ ] Link format: https://builtcred.com/ref/{PROJECT_CODE}-{UUID}
- [ ] UUID is unique per advocate-project combination
- [ ] Links never expire
- [ ] Links track: referrer, project, channel, timestamp
- [ ] Copy button with success feedback
- [ ] Share buttons for WhatsApp, SMS, Email, Social
- [ ] Analytics tracking for link usage

#### Technical Requirements
- UUID generation: UUID v4
- Database table: `referral_links`
- URL shortening (optional for MVP)
- Click tracking with UTM parameters
- API endpoint: GET `/api/v1/advocates/me/referral-links`

#### Database Schema
```sql
CREATE TABLE referral_links (
  id UUID PRIMARY KEY,
  advocate_id UUID REFERENCES customers(id),
  project_id UUID REFERENCES projects(id),
  link_code VARCHAR(50) UNIQUE NOT NULL,
  full_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP,
  total_clicks INTEGER DEFAULT 0
);

CREATE INDEX idx_referral_links_code ON referral_links(link_code);
CREATE INDEX idx_referral_links_advocate ON referral_links(advocate_id);
```

#### Link Format Examples
```
https://builtcred.com/ref/OSANC-a8f4e2d9-c1b3-4567
https://builtcred.com/ref/GFTVP-b9e5f3c0-d2a4-5678
https://builtcred.com/ref/MPHTS-c0f6g4d1-e3b5-6789
```

#### Definition of Done
- [ ] Link generation implemented
- [ ] Database schema created
- [ ] Copy functionality working
- [ ] Share buttons functional
- [ ] Click tracking active
- [ ] Unit tests complete
- [ ] E2E tests for link sharing
- [ ] Performance optimized

---

### 2.4 QR Code Generation

**Priority:** P1 | **Story Points:** 8 | **Sprint:** 3

#### User Story
**As a** customer advocate  
**I want** a QR code for my referral link  
**So that** I can share it in-person or in print

#### Acceptance Criteria
- [ ] QR code generated for each referral link
- [ ] QR code resolution: 512x512px (high quality)
- [ ] Format: PNG with transparent background
- [ ] Download button available
- [ ] QR code includes error correction (Level H)
- [ ] Preview displays on dashboard
- [ ] QR code encodes full referral URL

#### Technical Requirements
- QR code library: qrcode (Node.js) or qrcode.react (React)
- Error correction: Level H (30% damage tolerance)
- File size optimization (< 50KB per QR)
- CDN storage for generated QR codes
- API endpoint: GET `/api/v1/advocates/me/qr-code/{project_id}`

#### QR Code Specifications
- Size: 512x512px
- Format: PNG
- Error correction: Level H
- Margin: 4 modules
- Color: Black on white
- Encoding: URL (referral link)

#### Definition of Done
- [ ] QR generation implemented
- [ ] Download functionality working
- [ ] Preview displays correctly
- [ ] CDN upload working
- [ ] Unit tests complete
- [ ] Visual quality verified
- [ ] Cross-device tested

---

### 2.5 Lead Capture Landing Page

**Priority:** P0 | **Story Points:** 21 | **Sprint:** 3-4

#### User Story
**As a** referred person  
**I want** to land on a friendly page when I click a referral link  
**So that** I can learn about the project and submit my interest

#### Acceptance Criteria
- [ ] Landing page shows project information
- [ ] Shows referrer's first name only (privacy)
- [ ] Lead capture form with fields: name, phone, email
- [ ] Project image carousel
- [ ] Key highlights (amenities, location, pricing range)
- [ ] Call-to-action: "Schedule Site Visit"
- [ ] Mobile-first responsive design
- [ ] Load time < 2 seconds
- [ ] SEO optimized for project keywords

#### Technical Requirements
- Next.js server-side rendering
- Dynamic route: `/ref/[linkCode]`
- Image optimization with Next.js Image
- Form submission: POST `/api/v1/leads/capture`
- Analytics tracking: Google Analytics + Mixpanel
- A/B testing capability (optional for MVP)

#### Content Structure
```
1. Hero Section
   - Project hero image
   - Headline: "Welcome to [Project Name]"
   - Subheadline: "Recommended by [Referrer First Name]"

2. Project Overview
   - 3-5 key highlights
   - Location map embed
   - Starting price range

3. Lead Capture Form
   - Name (required)
   - Phone (required)
   - Email (optional)
   - Preferred contact time
   - Submit button

4. Trust Indicators
   - Developer credentials
   - Certifications/approvals
   - Testimonials (optional)
```

#### Definition of Done
- [ ] Landing page implemented
- [ ] Form submission working
- [ ] Analytics tracking active
- [ ] SEO tags configured
- [ ] Performance optimized (Lighthouse > 90)
- [ ] Mobile tested
- [ ] A/B test framework ready
- [ ] Content reviewed and approved

---

### 2.6 Duplicate Detection

**Priority:** P0 | **Story Points:** 13 | **Sprint:** 2

#### User Story
**As a** system admin  
**I want** to prevent duplicate referrals  
**So that** we don't process the same lead multiple times

#### Acceptance Criteria
- [ ] Check for existing referral with same phone + project
- [ ] Time window: 90 days
- [ ] If duplicate within 90 days: reject with error message
- [ ] If duplicate after 90 days: allow (re-engagement)
- [ ] Show referrer the existing referral details
- [ ] Admin can manually override duplicate detection
- [ ] Log all duplicate attempts for analysis

#### Technical Requirements
- Duplicate check query optimized with composite index
- Query execution time < 50ms
- Grace period: 90 days (configurable)
- Admin override API: POST `/api/v1/referrals/{id}/override-duplicate`
- Audit log for all override actions

#### Duplicate Detection Logic
```sql
SELECT id, referral_id, referrer_id, created_at, status
FROM referrals
WHERE lead_phone = :phone
  AND target_project_id = :project_id
  AND created_at > NOW() - INTERVAL '90 days'
  AND status != 'DUPLICATE'
LIMIT 1;
```

#### Error Response
```json
{
  "error": "DUPLICATE_REFERRAL",
  "message": "This person has already been referred to this project",
  "existing_referral": {
    "referral_id": "REF-2026-001234",
    "submitted_on": "2026-01-15T10:30:00Z",
    "status": "CONTACTED",
    "can_override": false
  }
}
```

#### Definition of Done
- [ ] Duplicate detection implemented
- [ ] Query performance optimized
- [ ] Override functionality working
- [ ] Audit logging active
- [ ] Unit tests for all scenarios
- [ ] Integration tests complete
- [ ] Admin training document created

---

### 2.7 First-Touch & Last-Touch Attribution

**Priority:** P0 | **Story Points:** 13 | **Sprint:** 3

#### User Story
**As a** system admin  
**I want** to track both first and last referrals  
**So that** we can analyze the customer journey

#### Acceptance Criteria
- [ ] First referral recorded as first-touch
- [ ] Subsequent referrals update last-touch
- [ ] Both first and last touch stored in lead record
- [ ] Attribution includes: referrer, date, channel, advocate type
- [ ] First-touch referrer gets reward (MVP rule)
- [ ] Last-touch tracked for future analytics
- [ ] Admin can view attribution history

#### Technical Requirements
- Database fields: `first_touch_referrer_id`, `last_touch_referrer_id`
- Attribution history table for full journey
- API returns both attributions
- Reward calculation uses first-touch only (MVP)

#### Database Schema
```sql
CREATE TABLE lead_attribution (
  id UUID PRIMARY KEY,
  lead_id UUID REFERENCES leads(id),
  referrer_id UUID REFERENCES customers(id),
  advocate_type VARCHAR(20),
  attribution_type VARCHAR(20), -- 'FIRST_TOUCH' or 'LAST_TOUCH'
  channel VARCHAR(50),
  attribution_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_attribution_lead ON lead_attribution(lead_id);
CREATE INDEX idx_attribution_referrer ON lead_attribution(referrer_id);
```

#### Attribution Update Logic
```javascript
function updateAttribution(leadId, referrerId, channel) {
  const lead = getLead(leadId);
  
  if (!lead.first_touch_referrer_id) {
    // First referral - set first touch
    lead.first_touch_referrer_id = referrerId;
    lead.first_touch_date = NOW();
    lead.first_touch_channel = channel;
  }
  
  // Always update last touch
  lead.last_touch_referrer_id = referrerId;
  lead.last_touch_date = NOW();
  lead.last_touch_channel = channel;
  
  // Save attribution history
  saveAttributionHistory(leadId, referrerId, channel);
}
```

#### Definition of Done
- [ ] Attribution tracking implemented
- [ ] Database schema created
- [ ] Both first and last touch recorded
- [ ] Attribution history stored
- [ ] Admin UI shows attribution
- [ ] Unit tests complete
- [ ] Integration tests verify accuracy

---

### 2.8 Multi-Channel Referral Tracking

**Priority:** P1 | **Story Points:** 13 | **Sprint:** 4

#### User Story
**As a** system admin  
**I want** to track which channels drive referrals  
**So that** we can optimize advocate engagement

#### Acceptance Criteria
- [ ] Track referral source channel
- [ ] Channels: web_portal, whatsapp, sms, email, qr_code, social_media, direct
- [ ] Channel stored with each referral
- [ ] Channel analytics in admin dashboard
- [ ] Channel comparison reports
- [ ] UTM parameter support for link tracking

#### Technical Requirements
- Database field: `channel` (varchar 50)
- UTM parameter parsing from referral links
- Channel enum validation
- Analytics query: referrals by channel
- Chart component for channel distribution

#### Channel Detection Logic
```javascript
function detectChannel(request) {
  if (request.utm_source) {
    return mapUtmToChannel(request.utm_source);
  }
  
  if (request.referrer.includes('whatsapp')) return 'whatsapp';
  if (request.referrer.includes('facebook')) return 'social_media';
  if (request.referrer.includes('twitter')) return 'social_media';
  
  if (request.user_agent.includes('WhatsApp')) return 'whatsapp';
  
  return 'direct';
}
```

#### Analytics Metrics
- Total referrals by channel
- Conversion rate by channel
- Average time to conversion by channel
- Most popular channel by advocate type

#### Definition of Done
- [ ] Channel tracking implemented
- [ ] UTM parsing working
- [ ] Analytics dashboard showing channel data
- [ ] Export includes channel column
- [ ] Unit tests for detection logic
- [ ] Integration tests complete

---

### 2.9 Referral Status Management

**Priority:** P0 | **Story Points:** 13 | **Sprint:** 4

#### User Story
**As a** sales representative  
**I want** to update referral status as I work the lead  
**So that** advocates can track progress

#### Acceptance Criteria
- [ ] Status enum: NEW, CONTACTED, SITE_VISIT_SCHEDULED, SITE_VISIT_COMPLETED, NEGOTIATING, CONVERTED, DECLINED, LOST
- [ ] Status update API endpoint
- [ ] Status change triggers notification to advocate
- [ ] Status history tracked (audit trail)
- [ ] Sub-status field for additional context
- [ ] Notes field for sales rep comments
- [ ] Status timestamps recorded

#### Technical Requirements
- API: PATCH `/api/v1/referrals/{id}/status`
- Database table: `referral_status_history`
- Notification queue: Redis/RabbitMQ
- Email templates for each status update

#### Status Workflow
```
NEW → CONTACTED → SITE_VISIT_SCHEDULED → SITE_VISIT_COMPLETED → 
  → NEGOTIATING → CONVERTED (success path)
  OR
  → DECLINED / LOST (failure path)
```

#### Database Schema
```sql
CREATE TABLE referral_status_history (
  id UUID PRIMARY KEY,
  referral_id UUID REFERENCES referrals(id),
  status VARCHAR(50) NOT NULL,
  sub_status VARCHAR(100),
  notes TEXT,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_status_history_referral ON referral_status_history(referral_id);
```

#### Notification Templates
- NEW: "Your referral has been received"
- CONTACTED: "We've reached out to [Lead Name]"
- SITE_VISIT_SCHEDULED: "Site visit scheduled for [Date]"
- SITE_VISIT_COMPLETED: "Site visit completed"
- CONVERTED: "Congratulations! [Lead Name] has booked a plot"
- DECLINED/LOST: "[Lead Name] has decided not to proceed"

#### Definition of Done
- [ ] Status update API implemented
- [ ] Status history tracked
- [ ] Notifications working
- [ ] Email templates created
- [ ] Unit tests complete
- [ ] Integration tests verify workflow
- [ ] Sales team trained

---

### 2.10 Referral Reward Calculation

**Priority:** P0 | **Story Points:** 21 | **Sprint:** 5

#### User Story
**As a** system admin  
**I want** automatic reward calculation on conversion  
**So that** advocates know their earnings

#### Acceptance Criteria
- [ ] Reward calculation triggered on status = CONVERTED
- [ ] Phase 1 rule: 1% of plot value (same for both advocate types)
- [ ] Tiered rewards: ₹25K (base), ₹35K (₹1Cr+), ₹50K (₹1.5Cr+)
- [ ] Buyer discount: 1% of base price
- [ ] TDS calculation (10% on rewards)
- [ ] Reward eligibility validation
- [ ] Reward payout timeline: 30 days post-booking
- [ ] Reward record created in database

#### Technical Requirements
- Service: `RewardCalculationService`
- Database table: `rewards`
- API: POST `/api/v1/referrals/{id}/calculate-reward`
- Configurable reward rules (for future changes)

#### Reward Calculation Logic
```javascript
function calculateReward(conversion) {
  const plotValue = conversion.plot_value;
  let reward;
  
  if (plotValue >= 15000000) {
    reward = 50000; // ₹50K for ₹1.5Cr+ plots
  } else if (plotValue >= 10000000) {
    reward = 35000; // ₹35K for ₹1Cr+ plots
  } else {
    reward = 25000; // ₹25K base reward
  }
  
  const buyerDiscount = plotValue * 0.01; // 1%
  const tds = reward * 0.10; // 10% TDS
  const netReward = reward - tds;
  
  return {
    gross_reward: reward,
    tds_amount: tds,
    net_reward: netReward,
    buyer_discount: buyerDiscount,
    plot_value: plotValue,
    payment_due_date: addDays(conversion.booking_date, 30)
  };
}
```

#### Database Schema
```sql
CREATE TABLE rewards (
  id UUID PRIMARY KEY,
  referral_id UUID REFERENCES referrals(id),
  referrer_id UUID REFERENCES customers(id),
  advocate_type VARCHAR(20),
  plot_value DECIMAL(12,2),
  gross_reward DECIMAL(10,2),
  tds_amount DECIMAL(10,2),
  net_reward DECIMAL(10,2),
  buyer_discount DECIMAL(10,2),
  payment_due_date DATE,
  payment_status VARCHAR(20) DEFAULT 'PENDING',
  paid_on DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rewards_referrer ON rewards(referrer_id);
CREATE INDEX idx_rewards_status ON rewards(payment_status);
```

#### Definition of Done
- [ ] Calculation service implemented
- [ ] Database schema created
- [ ] Tiered rewards working correctly
- [ ] TDS calculated accurately
- [ ] Unit tests for all reward tiers
- [ ] Integration tests with conversion flow
- [ ] Financial audit approved

---

## EPIC 3: HOMEOWNER PORTAL

### 3.1 Advocate Dashboard - Main View

**Priority:** P0 | **Story Points:** 21 | **Sprint:** 4

#### User Story
**As a** customer advocate  
**I want** a personalized dashboard  
**So that** I can see my referral activity and rewards

#### Acceptance Criteria
- [ ] Dashboard shows advocate type badge prominently
- [ ] Welcome message with name and advocate type
- [ ] Project ownership details (project name, plot number)
- [ ] Stats cards: Total referrals, Converted, In Progress, Total rewards
- [ ] Eligible projects list
- [ ] Quick action buttons: Make Referral, View Referrals, Download QR
- [ ] Recent activity feed (last 5 referrals)
- [ ] Responsive design (mobile, tablet, desktop)

#### Technical Requirements
- React component: `AdvocateDashboard`
- API: GET `/api/v1/advocates/me/dashboard`
- State management: React Context or Redux
- Caching: 5 minutes TTL
- Real-time updates: WebSocket (optional for MVP)

#### Dashboard Layout
```
+------------------------------------------+
| Welcome back, [Name]!                    |
| [Advocate Type Badge]                    |
| [Project] • [Plot Number] • Active       |
+------------------------------------------+
| [Total]  [Converted]  [Progress] [Rewards]|
+------------------------------------------+
| You can refer to:                        |
| [Project List with Referral Buttons]     |
+------------------------------------------+
| My Referral Link                         |
| [Link] [Copy] [Share] [QR Code]          |
+------------------------------------------+
| Recent Referrals                         |
| [Referral List - Last 5]                 |
+------------------------------------------+
```

#### Performance Requirements
- Initial load < 1.5 seconds
- Time to interactive < 2 seconds
- Lighthouse performance score > 90

#### Definition of Done
- [ ] Dashboard UI implemented
- [ ] All stats displaying correctly
- [ ] Real-time updates working (if implemented)
- [ ] Performance targets met
- [ ] Unit tests complete
- [ ] E2E tests for dashboard flow
- [ ] Accessibility audit passed
- [ ] User testing completed

---

### 3.2 Referral List View

**Priority:** P0 | **Story Points:** 13 | **Sprint:** 4-5

#### User Story
**As a** customer advocate  
**I want** to view all my referrals in a list  
**So that** I can track their status and progress

#### Acceptance Criteria
- [ ] Table view with columns: Lead Name, Phone, Date, Status, Reward
- [ ] Status badge with color coding
- [ ] Sort by: Date (default newest), Status, Name
- [ ] Filter by: Status, Date range
- [ ] Search by lead name or phone
- [ ] Pagination (20 per page)
- [ ] Click row to view details
- [ ] Export to CSV button
- [ ] Mobile: Card layout instead of table

#### Technical Requirements
- React component: `ReferralListView`
- API: GET `/api/v1/advocates/me/referrals`
- Query parameters: page, limit, sort, filter, search
- Response includes: data[], total, page, limit

#### Table Columns
| Column | Width | Sortable | Filterable |
|--------|-------|----------|------------|
| Lead Name | 20% | Yes | No |
| Phone | 15% | No | No |
| Referred Date | 15% | Yes | Yes |
| Status | 15% | Yes | Yes |
| Project | 20% | No | Yes |
| Reward | 15% | Yes | No |

#### Status Color Coding
- NEW: Yellow (#ffc107)
- CONTACTED: Blue (#007bff)
- SITE_VISIT: Purple (#6f42c1)
- CONVERTED: Green (#28a745)
- DECLINED/LOST: Red (#dc3545)

#### Definition of Done
- [ ] List view implemented
- [ ] Sorting working
- [ ] Filtering working
- [ ] Search functional
- [ ] Pagination working
- [ ] Export to CSV working
- [ ] Mobile layout responsive
- [ ] Unit tests complete
- [ ] E2E tests for list operations

---

### 3.3 Referral Detail View

**Priority:** P1 | **Story Points:** 13 | **Sprint:** 5

#### User Story
**As a** customer advocate  
**I want** to view detailed information about a specific referral  
**So that** I can understand its progress

#### Acceptance Criteria
- [ ] Shows all lead information: name, phone, email
- [ ] Timeline of status changes
- [ ] Current status with last update date
- [ ] Estimated reward amount (if applicable)
- [ ] Sales representative contact (if assigned)
- [ ] Next action expected
- [ ] Back button to referral list
- [ ] Contact support button

#### Technical Requirements
- React component: `ReferralDetailView`
- API: GET `/api/v1/advocates/me/referrals/{id}`
- Dynamic route: `/referrals/{id}`
- Breadcrumb navigation

#### Detail View Layout
```
+------------------------------------------+
| [Back to Referrals]                      |
| Referral #REF-2026-001234                |
+------------------------------------------+
| Lead Information                         |
| Name: [Name]                             |
| Phone: [Phone]                           |
| Email: [Email]                           |
| Budget: [Range]                          |
| Project: [Project Name]                  |
+------------------------------------------+
| Status Timeline                          |
| [Timeline Component]                     |
+------------------------------------------+
| Reward Information                       |
| Estimated Reward: ₹25,000                |
| Status: Pending Conversion               |
+------------------------------------------+
| Need Help?                               |
| [Contact Support]                        |
+------------------------------------------+
```

#### Timeline Component
- Vertical timeline showing status history
- Each entry: date, status, notes (if any)
- Visual indicator for current status

#### Definition of Done
- [ ] Detail view implemented
- [ ] Timeline component working
- [ ] Navigation functional
- [ ] Unit tests complete
- [ ] E2E tests for detail view
- [ ] Mobile responsive

---

### 3.4 Referral Link Sharing Interface

**Priority:** P0 | **Story Points:** 8 | **Sprint:** 5

#### User Story
**As a** customer advocate  
**I want** easy ways to share my referral link  
**So that** I can reach more people

#### Acceptance Criteria
- [ ] Copy link button with success feedback
- [ ] WhatsApp share button (opens WhatsApp with pre-filled message)
- [ ] SMS share button (opens SMS app)
- [ ] Email share button (opens email client)
- [ ] Social media share buttons (Facebook, Twitter, LinkedIn)
- [ ] QR code download button
- [ ] Share count displayed
- [ ] Click analytics tracked

#### Technical Requirements
- Component: `ReferralLinkSharing`
- Web Share API for mobile devices
- Fallback for desktop browsers
- Pre-filled message templates
- Analytics event tracking

#### Share Message Templates
**WhatsApp:**
```
Hey! I'm part of [Project Name] and loving it. Check it out: [Link]

You'll get 1% discount and I highly recommend it! Let me know if you have questions.
```

**SMS:**
```
Check out [Project Name]: [Link]
You'll get 1% off. Contact me for details!
```

**Email:**
```
Subject: Recommended Property at [Project Name]

Hi,

I recently purchased a plot at [Project Name] and wanted to share it with you. It's an excellent development with [key features].

If you're interested, use this link to learn more: [Link]

You'll receive 1% discount on the base price. Feel free to reach out if you have any questions!

Best regards,
[Name]
```

#### Definition of Done
- [ ] All share methods implemented
- [ ] Message templates created
- [ ] Web Share API integrated
- [ ] Analytics tracking active
- [ ] Cross-platform tested
- [ ] Unit tests complete

---

### 3.5 Rewards Dashboard

**Priority:** P0 | **Story Points:** 13 | **Sprint:** 5-6

#### User Story
**As a** customer advocate  
**I want** to see my reward earnings and payment status  
**So that** I know how much I've earned

#### Acceptance Criteria
- [ ] Total earned displayed prominently
- [ ] Breakdown: Paid rewards vs Pending rewards
- [ ] List of rewards with: Date, Referral, Amount, Status, Payment date
- [ ] Filter by payment status
- [ ] Download reward statements (PDF)
- [ ] Tax information notice (TDS deduction)
- [ ] Payment timeline explained

#### Technical Requirements
- Component: `RewardsDashboard`
- API: GET `/api/v1/advocates/me/rewards`
- PDF generation: jsPDF or backend service
- Chart: Recharts for rewards over time

#### Rewards Display
```
+------------------------------------------+
| Total Earned                             |
| ₹75,000                                  |
| From 3 successful conversions            |
+------------------------------------------+
| Paid: ₹50,000  |  Pending: ₹25,000      |
+------------------------------------------+
| Rewards History                          |
| [Table with rewards]                     |
+------------------------------------------+
| Tax Information                          |
| TDS (10%) is deducted before payment    |
| [Learn More]                             |
+------------------------------------------+
```

#### Reward Statement PDF
- Header: BuiltCred logo, advocate details
- Table: All rewards with dates and amounts
- Footer: Total paid, total pending, tax information
- Generated on-demand

#### Definition of Done
- [ ] Rewards dashboard implemented
- [ ] Breakdown calculation correct
- [ ] PDF generation working
- [ ] Tax information displayed
- [ ] Unit tests complete
- [ ] E2E tests for rewards flow

---

### 3.6 Document Repository

**Priority:** P1 | **Story Points:** 13 | **Sprint:** 6

#### User Story
**As a** customer advocate  
**I want** access to my ownership documents  
**So that** I can download them when needed

#### Acceptance Criteria
- [ ] List of documents: Allotment letter, Payment receipts, Registry docs, Construction plans
- [ ] Document categories
- [ ] Download button for each document
- [ ] Document preview (if PDF)
- [ ] Upload date displayed
- [ ] File size displayed
- [ ] Search documents by name

#### Technical Requirements
- Component: `DocumentRepository`
- API: GET `/api/v1/advocates/me/documents`
- File storage: AWS S3 or similar
- Signed URLs for secure download (1 hour expiry)
- PDF preview: react-pdf library

#### Document Types
- Allotment Letter
- Payment Receipts
- Registry Documents
- Construction Plans
- NOC Certificates
- Completion Certificate
- Maintenance Documents

#### Document Access Control
- Advocates can only see their own documents
- Documents linked to customer_id
- No direct URL access (signed URLs only)
- Audit log for document downloads

#### Definition of Done
- [ ] Document list implemented
- [ ] Download functionality working
- [ ] PDF preview working
- [ ] Search functional
- [ ] Security audit passed
- [ ] Unit tests complete

---

### 3.7 Profile Management

**Priority:** P1 | **Story Points:** 8 | **Sprint:** 6

#### User Story
**As a** customer advocate  
**I want** to view and update my profile  
**So that** my information is current

#### Acceptance Criteria
- [ ] View profile: Name, Email, Phone, Address
- [ ] Edit mode for updatable fields
- [ ] Email change requires verification
- [ ] Phone change requires OTP verification
- [ ] Password change functionality
- [ ] Notification preferences
- [ ] Profile picture upload (optional)

#### Technical Requirements
- Component: `ProfileManagement`
- API: GET/PATCH `/api/v1/advocates/me/profile`
- Email verification: Send verification link
- Phone verification: Send OTP via SMS
- Image upload: S3 with size limit (2MB)

#### Editable Fields
- Email (requires verification)
- Phone (requires OTP)
- Address
- Notification preferences (email, SMS, WhatsApp)
- Profile picture

#### Non-Editable Fields
- Name (admin only)
- Advocate type (system determined)
- Project ownership (system determined)

#### Definition of Done
- [ ] Profile view implemented
- [ ] Edit functionality working
- [ ] Verification flows complete
- [ ] Image upload working
- [ ] Unit tests complete
- [ ] E2E tests for profile updates

---

### 3.8 Notifications Center

**Priority:** P1 | **Story Points:** 8 | **Sprint:** 7

#### User Story
**As a** customer advocate  
**I want** to see all my notifications in one place  
**So that** I don't miss important updates

#### Acceptance Criteria
- [ ] List of all notifications (last 30 days)
- [ ] Notification types: Referral status updates, Reward payments, System announcements
- [ ] Mark as read functionality
- [ ] Mark all as read button
- [ ] Unread count badge on header
- [ ] Filter by notification type
- [ ] Click notification to view details

#### Technical Requirements
- Component: `NotificationsCenter`
- API: GET `/api/v1/advocates/me/notifications`
- WebSocket for real-time notifications (optional)
- Database table: `notifications`

#### Database Schema
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES customers(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  link VARCHAR(500),
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, read_at);
```

#### Notification Types
- REFERRAL_STATUS_UPDATED
- REWARD_CALCULATED
- REWARD_PAID
- SYSTEM_ANNOUNCEMENT
- DOCUMENT_UPLOADED
- PROFILE_UPDATED

#### Definition of Done
- [ ] Notifications center implemented
- [ ] Mark as read working
- [ ] Unread count badge functional
- [ ] Real-time updates working (if implemented)
- [ ] Unit tests complete
- [ ] E2E tests for notifications

---

## EPIC 4: ADMIN PANEL

### 4.1 Admin Dashboard Overview

**Priority:** P0 | **Story Points:** 21 | **Sprint:** 6

#### User Story
**As a** developer admin  
**I want** a comprehensive dashboard  
**So that** I can monitor referral program performance

#### Acceptance Criteria
- [ ] Key metrics: Total advocates, Active referrals, Conversions, Rewards paid
- [ ] Advocate type distribution (Project vs Brand)
- [ ] Performance by advocate type
- [ ] Referral pipeline visualization
- [ ] Recent activity feed
- [ ] Conversion rate trends (chart)
- [ ] Revenue attributed to referrals
- [ ] Date range filter

#### Technical Requirements
- Component: `AdminDashboard`
- API: GET `/api/v1/admin/dashboard`
- Charts: Recharts library
- Real-time updates: WebSocket (optional)
- Caching: 15 minutes TTL

#### Dashboard Metrics
```
Total Metrics:
- Total Advocates: 342 (187 Project + 155 Brand)
- Active Referrals: 456
- Conversions (MTD): 82
- Rewards Paid (MTD): ₹20.5L

Performance Comparison:
- Project Advocates: 1.4 referrals/advocate, 16.9% conversion
- Brand Advocates: 1.2 referrals/advocate, 19.6% conversion

Pipeline:
- New Leads: 156
- In Progress: 119
- Converted: 82
```

#### Charts
1. Conversion Rate Trend (last 6 months)
2. Advocate Type Distribution (pie chart)
3. Referrals by Channel (bar chart)
4. Revenue Attributed (line chart)

#### Definition of Done
- [ ] Dashboard UI implemented
- [ ] All metrics calculating correctly
- [ ] Charts rendering properly
- [ ] Date filter working
- [ ] Performance optimized (< 2s load)
- [ ] Unit tests complete
- [ ] Admin user testing approved

---

### 4.2 Advocate Management List

**Priority:** P0 | **Story Points:** 13 | **Sprint:** 6-7

#### User Story
**As a** developer admin  
**I want** to view and manage all advocates  
**So that** I can monitor their activity

#### Acceptance Criteria
- [ ] Table with: Name, Advocate Type, Project, Plot, Referrals, Conversions
- [ ] Filter by advocate type
- [ ] Filter by project
- [ ] Search by name, phone, or plot number
- [ ] Sort by any column
- [ ] Pagination (50 per page)
- [ ] Click row to view advocate details
- [ ] Export to CSV
- [ ] Bulk actions: Send notification, Update status

#### Technical Requirements
- Component: `AdvocateManagementList`
- API: GET `/api/v1/admin/advocates`
- Query parameters: page, limit, sort, filter, search, advocate_type
- Export: Backend CSV generation

#### Table Columns
| Column | Width | Sortable | Filterable |
|--------|-------|----------|------------|
| Name | 20% | Yes | No |
| Advocate Type | 15% | Yes | Yes |
| Source Project | 15% | No | Yes |
| Plot No. | 10% | Yes | No |
| Referrals | 10% | Yes | No |
| Conversions | 10% | Yes | No |
| Status | 10% | Yes | Yes |
| Actions | 10% | No | No |

#### Bulk Actions
- Send custom notification to selected advocates
- Update advocate status (active/inactive)
- Export selected advocates to CSV
- Assign to sales team member

#### Definition of Done
- [ ] List view implemented
- [ ] All filters working
- [ ] Search functional
- [ ] Sorting working
- [ ] Export to CSV working
- [ ] Bulk actions implemented
- [ ] Unit tests complete
- [ ] E2E tests for list operations

---

### 4.3 Advocate Detail View (Admin)

**Priority:** P1 | **Story Points:** 13 | **Sprint:** 7

#### User Story
**As a** developer admin  
**I want** to view complete advocate details  
**So that** I can understand their profile and activity

#### Acceptance Criteria
- [ ] Advocate profile: Name, Contact, Advocate type, Project, Plot
- [ ] Ownership history
- [ ] All referrals list
- [ ] Conversion summary
- [ ] Total rewards earned/paid
- [ ] Activity timeline
- [ ] Edit advocate details button
- [ ] Send notification button
- [ ] View documents button

#### Technical Requirements
- Component: `AdvocateDetailView`
- API: GET `/api/v1/admin/advocates/{id}`
- Dynamic route: `/admin/advocates/{id}`
- Breadcrumb navigation

#### Detail View Sections
1. Profile Card (top)
2. Statistics Cards (referrals, conversions, rewards)
3. Referrals List (tabbed view)
4. Activity Timeline
5. Documents
6. Admin Actions

#### Admin Actions
- Edit profile
- Change advocate type (with validation)
- Send custom notification
- View audit log
- Deactivate advocate

#### Definition of Done
- [ ] Detail view implemented
- [ ] All sections displaying correctly
- [ ] Admin actions functional
- [ ] Unit tests complete
- [ ] E2E tests for admin actions

---

### 4.4 Referral Management (Admin)

**Priority:** P0 | **Story Points:** 21 | **Sprint:** 7-8

#### User Story
**As a** developer admin  
**I want** to manage all referrals across all advocates  
**So that** I can ensure proper processing

#### Acceptance Criteria
- [ ] Master list of all referrals
- [ ] Filter by: Advocate type, Status, Project, Date range
- [ ] Search by: Lead name, phone, referrer name
- [ ] Assign to sales rep
- [ ] Update status (with notes)
- [ ] Mark as converted (capture plot details)
- [ ] Mark as duplicate
- [ ] Validation override
- [ ] Export filtered list

#### Technical Requirements
- Component: `ReferralManagementList`
- API: GET `/api/v1/admin/referrals`
- Multiple filter parameters support
- Optimized queries for large datasets

#### Advanced Filters
- Advocate Type: [All, Project, Brand]
- Status: [Multiple select]
- Project: [Multiple select]
- Date Range: [Custom range picker]
- Sales Rep: [Assigned/Unassigned/Specific rep]
- Channel: [Multiple select]

#### Bulk Actions
- Assign selected to sales rep
- Update status for selected
- Export selected to CSV
- Send notification to referrers

#### Status Update Modal
- Status dropdown
- Sub-status field
- Notes textarea (required)
- Updated by (auto-filled)
- Timestamp (auto-filled)

#### Definition of Done
- [ ] Referral management list implemented
- [ ] All filters working
- [ ] Search functional
- [ ] Status updates working
- [ ] Bulk actions implemented
- [ ] Unit tests complete
- [ ] E2E tests for management flows

---

### 4.5 Conversion Management

**Priority:** P0 | **Story Points:** 21 | **Sprint:** 8

#### User Story
**As a** developer admin  
**I want** to mark referrals as converted and capture booking details  
**So that** rewards can be calculated

#### Acceptance Criteria
- [ ] Conversion form: Plot number, Plot value, Booking date, Booking amount
- [ ] Automatic reward calculation displayed
- [ ] Confirmation screen showing reward breakdown
- [ ] Email notifications sent (advocate, sales, admin)
- [ ] Conversion record created
- [ ] Reward record created with PENDING status
- [ ] Referral status updated to CONVERTED
- [ ] Booking details stored

#### Technical Requirements
- Component: `ConversionManagement`
- API: POST `/api/v1/admin/referrals/{id}/convert`
- Validation: Plot number unique per project
- Reward calculation service integration

#### Conversion Form Fields
```
- Referral ID (auto-filled, read-only)
- Lead Name (auto-filled, read-only)
- Plot Number (required, dropdown from available plots)
- Plot Value (required, number, min ₹50L)
- Booking Date (required, date picker, <= today)
- Booking Amount (required, number)
- Payment Mode (dropdown)
- Notes (optional, textarea)
```

#### Reward Calculation Preview
```
+------------------------------------------+
| Reward Calculation                       |
+------------------------------------------+
| Plot Value: ₹85,00,000                   |
| Referrer Reward (1%): ₹25,000           |
| Less: TDS (10%): ₹2,500                  |
| Net Reward: ₹22,500                      |
| Buyer Discount (1%): ₹85,000             |
| Payment Due: [30 days from booking]      |
+------------------------------------------+
```

#### Post-Conversion Actions
1. Create conversion record
2. Calculate and create reward record
3. Update referral status to CONVERTED
4. Send notification to advocate
5. Send notification to sales rep
6. Send notification to finance team
7. Trigger CRM webhook update

#### Definition of Done
- [ ] Conversion form implemented
- [ ] Reward calculation working
- [ ] All notifications sending
- [ ] Database records created correctly
- [ ] Unit tests complete
- [ ] Integration tests for conversion flow
- [ ] Finance team approval

---

### 4.6 Reward Management & Payment Tracking

**Priority:** P0 | **Story Points:** 21 | **Sprint:** 8-9

#### User Story
**As a** developer admin  
**I want** to track and manage reward payments  
**So that** advocates receive timely payments

#### Acceptance Criteria
- [ ] List of all rewards with payment status
- [ ] Filter by: Payment status, Advocate type, Date range
- [ ] Payment status: PENDING, APPROVED, PAID, CANCELLED
- [ ] Mark as paid (capture payment date, reference)
- [ ] Bulk payment processing
- [ ] Generate payment report (PDF)
- [ ] TDS certificate generation
- [ ] Export payment list for finance

#### Technical Requirements
- Component: `RewardManagement`
- API: GET `/api/v1/admin/rewards`
- API: POST `/api/v1/admin/rewards/{id}/mark-paid`
- PDF generation: Backend service
- Bulk update transaction support

#### Reward List Table
| Column | Width | Sortable | Filterable |
|--------|-------|----------|------------|
| Reward ID | 10% | Yes | No |
| Advocate Name | 20% | Yes | No |
| Advocate Type | 12% | Yes | Yes |
| Referral | 15% | No | No |
| Gross Amount | 10% | Yes | No |
| TDS | 8% | No | No |
| Net Amount | 10% | Yes | No |
| Status | 10% | Yes | Yes |
| Actions | 5% | No | No |

#### Payment Marking Modal
```
- Reward ID (read-only)
- Advocate Name (read-only)
- Net Amount (read-only)
- Payment Date (required, date picker)
- Payment Reference (required, text)
- Payment Mode (dropdown: Bank Transfer, Cheque, Online)
- Notes (optional)
```

#### Bulk Payment Processing
- Select multiple pending rewards
- Upload CSV with payment references
- Mark all as paid with single date
- Generate bulk TDS certificates

#### Definition of Done
- [ ] Reward management list implemented
- [ ] Mark as paid functionality working
- [ ] Bulk payment processing working
- [ ] PDF generation working
- [ ] Export to CSV working
- [ ] Unit tests complete
- [ ] Integration tests for payment flow
- [ ] Finance team training complete

---

### 4.7 Project Configuration

**Priority:** P0 | **Story Points:** 13 | **Sprint:** 9

#### User Story
**As a** developer admin  
**I want** to configure projects and their referral settings  
**So that** I can control which projects accept referrals

#### Acceptance Criteria
- [ ] List of all projects
- [ ] Project details: Name, Code, Status, Developer
- [ ] Referral settings: Accepts referrals (Yes/No)
- [ ] Reward configuration per project (future)
- [ ] Available plots count
- [ ] Project advocates count
- [ ] Active referrals count
- [ ] Edit project details
- [ ] Enable/disable referrals

#### Technical Requirements
- Component: `ProjectConfiguration`
- API: GET `/api/v1/admin/projects`
- API: PATCH `/api/v1/admin/projects/{id}`
- Validation: Cannot disable if active referrals exist

#### Project Configuration Fields
```
- Project Name (required)
- Project Code (required, unique)
- Developer (required, dropdown)
- Status (dropdown: Active, Sold Out, Upcoming, Cancelled)
- Accepts Referrals (toggle)
- Referral Start Date (date)
- Referral End Date (date, optional)
- Location (text)
- Total Plots (number)
- Available Plots (number)
```

#### Project Status Rules
- Active: Accepts referrals
- Sold Out: No referrals, existing referrals can convert
- Upcoming: No referrals yet
- Cancelled: No referrals, existing referrals marked as LOST

#### Definition of Done
- [ ] Project list implemented
- [ ] Configuration form working
- [ ] Status rules enforced
- [ ] Validation working
- [ ] Unit tests complete
- [ ] Integration tests for project updates

---

### 4.8 Analytics & Reports

**Priority:** P1 | **Story Points:** 21 | **Sprint:** 9-10

#### User Story
**As a** developer admin  
**I want** comprehensive analytics and reports  
**So that** I can measure program success

#### Acceptance Criteria
- [ ] Dashboard with key charts
- [ ] Advocate performance report
- [ ] Referral pipeline report
- [ ] Conversion funnel analysis
- [ ] Channel performance report
- [ ] Reward payout report
- [ ] Custom date range selection
- [ ] Export all reports to PDF/CSV

#### Technical Requirements
- Component: `AnalyticsReports`
- API: GET `/api/v1/admin/analytics/*`
- Charts: Recharts library
- PDF export: Backend service
- Aggregation queries optimized

#### Report Types

**1. Advocate Performance**
- Top advocates by referrals
- Top advocates by conversions
- Advocate type comparison
- Advocate engagement trends

**2. Referral Pipeline**
- Referrals by status
- Status transition times
- Bottleneck identification
- Conversion funnel

**3. Channel Performance**
- Referrals by channel
- Conversion rate by channel
- Cost per acquisition by channel
- Channel trends over time

**4. Financial Report**
- Total rewards paid
- Pending rewards
- Average reward per conversion
- ROI on referral program

#### Chart Specifications
- Line charts for trends
- Bar charts for comparisons
- Pie charts for distributions
- Funnel charts for conversion pipeline

#### Definition of Done
- [ ] All report types implemented
- [ ] Charts rendering correctly
- [ ] Date range filter working
- [ ] Export functionality working
- [ ] Performance optimized
- [ ] Unit tests complete
- [ ] Admin user acceptance

---

### 4.9 Bulk Advocate Import

**Priority:** P1 | **Story Points:** 13 | **Sprint:** 10

#### User Story
**As a** developer admin  
**I want** to bulk import advocates from CSV  
**So that** I can onboard existing customers quickly

#### Acceptance Criteria
- [ ] CSV upload interface
- [ ] CSV validation (format, required fields)
- [ ] Preview data before import
- [ ] Duplicate detection
- [ ] Advocate type auto-classification
- [ ] Error handling with row-level feedback
- [ ] Success summary after import
- [ ] Download error report
- [ ] Rollback on critical errors

#### Technical Requirements
- Component: `BulkAdvocateImport`
- API: POST `/api/v1/admin/advocates/bulk-import`
- CSV parsing: Papa Parse library
- Background job: Bull queue for large imports
- Max file size: 10MB

#### CSV Format
```csv
name,email,phone,project_code,plot_number,booking_date
Sunita Mehta,sunita@example.com,+919876543210,OSANC,A-127,2025-03-15
Vikram Singh,vikram@example.com,+919876543211,OSCFT,B-045,2024-06-20
```

#### Validation Rules
- Name: Required, 2-100 chars
- Email: Required, valid format
- Phone: Required, E.164 format
- Project Code: Required, must exist in database
- Plot Number: Required, unique per project
- Booking Date: Required, valid date

#### Import Process
1. Upload CSV
2. Parse and validate
3. Show preview with errors highlighted
4. Confirm import
5. Process in background (if > 100 rows)
6. Auto-classify advocate types
7. Send welcome emails
8. Show success summary

#### Definition of Done
- [ ] Upload interface implemented
- [ ] CSV validation working
- [ ] Preview functionality working
- [ ] Import process complete
- [ ] Error handling robust
- [ ] Background job working (if needed)
- [ ] Unit tests complete
- [ ] E2E tests for import flow

---

## EPIC 5: CRM INTEGRATION

### 5.1 Webhook Configuration UI

**Priority:** P1 | **Story Points:** 8 | **Sprint:** 8

#### User Story
**As a** developer admin  
**I want** to configure CRM webhook settings  
**So that** referrals are automatically sent to our CRM

#### Acceptance Criteria
- [ ] Webhook URL input field
- [ ] Authentication method selection (API Key, Bearer, Basic, OAuth)
- [ ] Credentials input fields
- [ ] Test connection button
- [ ] Connection status indicator
- [ ] Save configuration button
- [ ] Webhook activity log (last 50 events)
- [ ] Enable/disable toggle

#### Technical Requirements
- Component: `WebhookConfiguration`
- API: GET/POST `/api/v1/admin/integrations/webhook`
- Secure credential storage (encrypted)
- Test connection endpoint

#### Webhook Configuration Form
```
- Webhook URL (required, HTTPS only)
- Authentication Method (dropdown)
  - API Key (Header)
  - Bearer Token
  - Basic Auth
  - OAuth 2.0
- Credentials (based on auth method)
- Custom Headers (key-value pairs, optional)
- Timeout (seconds, default 30)
- Retry Policy (number of retries, default 3)
- Enable Webhook (toggle)
```

#### Test Connection
- Send test payload to webhook URL
- Display response status and body
- Show success/failure message
- Log test attempt

#### Definition of Done
- [ ] Configuration UI implemented
- [ ] Credentials encrypted in database
- [ ] Test connection working
- [ ] Activity log displaying
- [ ] Unit tests complete
- [ ] Security audit passed

---

### 5.2 Outbound Webhook Implementation

**Priority:** P1 | **Story Points:** 21 | **Sprint:** 8-9

#### User Story
**As a** system  
**I want** to send referral data to CRM via webhook  
**So that** sales teams can work leads in their CRM

#### Acceptance Criteria
- [ ] Webhook triggered on referral creation
- [ ] Payload includes: Lead data, Referrer data, Advocate type, Project data
- [ ] Retry logic (3 attempts with exponential backoff)
- [ ] Success/failure logging
- [ ] Alert on repeated failures
- [ ] Asynchronous processing (non-blocking)
- [ ] Webhook status in admin dashboard

#### Technical Requirements
- Service: `WebhookService`
- Queue: Bull/Redis for reliable delivery
- Retry strategy: Exponential backoff (1s, 4s, 16s)
- Timeout: 30 seconds per attempt
- Logging: All webhook attempts

#### Webhook Payload
```json
{
  "event": "referral.created",
  "timestamp": "2026-02-08T14:30:00Z",
  "referral": {
    "id": "REF-2026-001234",
    "lead": {
      "name": "Amit Kumar",
      "phone": "+919876543210",
      "email": "amit@example.com",
      "budget_range": "75L-1Cr"
    },
    "referrer": {
      "id": "HO-12345",
      "name": "Sunita Mehta",
      "advocate_type": "PROJECT_ADVOCATE",
      "source_project": "Oscar Sanctuary",
      "plot_number": "A-127"
    },
    "target_project": "Oscar Sanctuary",
    "developer": "Oscar Developers",
    "sales_context": "Referred by fellow Oscar Sanctuary resident"
  }
}
```

#### Retry Logic
```javascript
async function sendWebhook(payload, attempt = 1) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
      timeout: 30000
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    logSuccess(payload.referral.id);
  } catch (error) {
    if (attempt < 3) {
      const delay = Math.pow(4, attempt) * 1000; // 4s, 16s
      setTimeout(() => sendWebhook(payload, attempt + 1), delay);
    } else {
      logFailure(payload.referral.id, error);
      alertAdmin(payload.referral.id);
    }
  }
}
```

#### Definition of Done
- [ ] Webhook service implemented
- [ ] Queue setup complete
- [ ] Retry logic working
- [ ] Logging implemented
- [ ] Admin alerts working
- [ ] Unit tests complete
- [ ] Integration tests with mock CRM
- [ ] Load tests (100 webhooks/minute)

---

### 5.3 Inbound API - Status Update

**Priority:** P1 | **Story Points:** 13 | **Sprint:** 9

#### User Story
**As a** CRM system  
**I want** to update referral status via API  
**So that** advocates see real-time progress

#### Acceptance Criteria
- [ ] API endpoint for status updates
- [ ] Authentication required (API key)
- [ ] Validates referral exists
- [ ] Validates status transition is valid
- [ ] Updates referral status
- [ ] Sends notification to advocate
- [ ] Returns success response
- [ ] Logs all updates

#### Technical Requirements
- Endpoint: PATCH `/api/v1/referrals/{id}/status`
- Authentication: API key in header
- Rate limiting: 100 requests/minute per key
- Validation: Status transition rules

#### API Request
```http
PATCH /api/v1/referrals/REF-2026-001234/status
Authorization: Bearer sk_live_xxxxxxxxxxxxx
Content-Type: application/json

{
  "status": "CONTACTED",
  "sub_status": "site_visit_scheduled",
  "notes": "Site visit on Feb 15 at 2 PM",
  "updated_by": "sales-agent-id"
}
```

#### API Response
```json
{
  "success": true,
  "referral_id": "REF-2026-001234",
  "previous_status": "NEW",
  "current_status": "CONTACTED",
  "updated_at": "2026-02-08T14:30:00Z",
  "advocate_notified": true
}
```

#### Status Transition Validation
```
Valid transitions:
NEW → CONTACTED
CONTACTED → SITE_VISIT_SCHEDULED
SITE_VISIT_SCHEDULED → SITE_VISIT_COMPLETED
SITE_VISIT_COMPLETED → NEGOTIATING
NEGOTIATING → CONVERTED / DECLINED / LOST

Invalid transitions (rejected):
CONVERTED → any other status
DECLINED → any other status (except reopen by admin)
```

#### Definition of Done
- [ ] API endpoint implemented
- [ ] Authentication working
- [ ] Validation rules enforced
- [ ] Notifications sending
- [ ] Rate limiting active
- [ ] Unit tests complete
- [ ] Integration tests with mock CRM
- [ ] API documentation published

---

### 5.4 Inbound API - Mark Conversion

**Priority:** P1 | **Story Points:** 13 | **Sprint:** 9

#### User Story
**As a** CRM system  
**I want** to mark referrals as converted via API  
**So that** rewards are automatically calculated

#### Acceptance Criteria
- [ ] API endpoint for marking conversions
- [ ] Requires: Plot number, value, booking date
- [ ] Validates plot availability
- [ ] Calculates reward automatically
- [ ] Creates conversion record
- [ ] Updates referral status to CONVERTED
- [ ] Sends notifications
- [ ] Returns reward calculation

#### Technical Requirements
- Endpoint: POST `/api/v1/referrals/{id}/convert`
- Authentication: API key in header
- Idempotency: Duplicate requests return existing conversion

#### API Request
```http
POST /api/v1/referrals/REF-2026-001234/convert
Authorization: Bearer sk_live_xxxxxxxxxxxxx
Content-Type: application/json

{
  "plot_number": "D-234",
  "plot_value": 8500000,
  "booking_date": "2026-02-08",
  "booking_amount": 850000,
  "payment_mode": "bank_transfer"
}
```

#### API Response
```json
{
  "success": true,
  "conversion_id": "CONV-123",
  "referral_id": "REF-2026-001234",
  "plot_number": "D-234",
  "plot_value": 8500000,
  "booking_date": "2026-02-08",
  "reward_calculated": {
    "gross_reward": 25000,
    "tds_amount": 2500,
    "net_reward": 22500,
    "buyer_discount": 85000,
    "payment_due_date": "2026-03-10"
  },
  "advocate_type": "PROJECT_ADVOCATE",
  "notifications_sent": true
}
```

#### Validation Rules
- Plot must exist in project
- Plot must not be already sold
- Booking date must be <= today
- Plot value must be >= minimum threshold
- Referral must not already be converted

#### Definition of Done
- [ ] API endpoint implemented
- [ ] Validation working
- [ ] Reward calculation integrated
- [ ] Idempotency working
- [ ] Notifications sending
- [ ] Unit tests complete
- [ ] Integration tests with mock CRM
- [ ] API documentation published

---

### 5.5 Field Mapping Configuration

**Priority:** P1 | **Story Points:** 13 | **Sprint:** 10

#### User Story
**As a** developer admin  
**I want** to configure field mappings between BuiltCred and CRM  
**So that** data syncs correctly

#### Acceptance Criteria
- [ ] List of BuiltCred fields
- [ ] Input for corresponding CRM field names
- [ ] Required field indicators
- [ ] Test mapping button
- [ ] Save mapping configuration
- [ ] Support for custom fields
- [ ] Import/export mapping configuration

#### Technical Requirements
- Component: `FieldMappingConfiguration`
- API: GET/POST `/api/v1/admin/integrations/field-mapping`
- JSON storage for mapping configuration
- Validation of required fields

#### Default Field Mappings
```json
{
  "lead.name": "FirstName + LastName",
  "lead.phone": "Phone",
  "lead.email": "Email",
  "referrer.advocate_type": "Advocate_Type__c",
  "referrer.source_project": "Referrer_Project__c",
  "target_project": "Project__c",
  "sales_context": "Referral_Context__c",
  "budget_range": "Budget_Range__c"
}
```

#### Field Mapping UI
```
BuiltCred Field          →    CRM Field
----------------------------------------
lead.name (required)     →    [FirstName + LastName]
lead.phone (required)    →    [Phone                ]
lead.email               →    [Email                ]
advocate_type (required) →    [Advocate_Type__c     ]
source_project (required)→    [Referrer_Project__c  ]
...
[+ Add Custom Field]
```

#### Test Mapping
- Generate sample payload
- Transform using current mappings
- Display resulting CRM object
- Validate all required fields present

#### Definition of Done
- [ ] Mapping UI implemented
- [ ] Configuration saving/loading working
- [ ] Test mapping functionality working
- [ ] Import/export working
- [ ] Unit tests complete
- [ ] Integration tests with various CRMs

---

### 5.6 Integration Health Monitoring

**Priority:** P1 | **Story Points:** 8 | **Sprint:** 10

#### User Story
**As a** developer admin  
**I want** to monitor CRM integration health  
**So that** I can identify and fix issues quickly

#### Acceptance Criteria
- [ ] Integration status dashboard
- [ ] Metrics: Success rate, avg response time, failure count
- [ ] Recent events log (last 100)
- [ ] Alert when failure rate > 10%
- [ ] Webhook queue status
- [ ] Manual retry button for failed webhooks
- [ ] Pause/resume integration button

#### Technical Requirements
- Component: `IntegrationHealthMonitor`
- API: GET `/api/v1/admin/integrations/health`
- Real-time updates: WebSocket (optional)
- Alerting: Email/SMS on threshold breach

#### Health Dashboard
```
+------------------------------------------+
| Integration Status: ✅ Healthy           |
+------------------------------------------+
| Outbound Webhooks                        |
| Status: Healthy                          |
| Success Rate: 99.8% (24h)                |
| Avg Response: 245ms                      |
| Last Push: 2 minutes ago                 |
+------------------------------------------+
| Inbound API                              |
| Status: Healthy                          |
| Requests Today: 234                      |
| Failed: 0                                |
| Last Update: 5 minutes ago               |
+------------------------------------------+
| Recent Events                            |
| [Table with last 100 events]             |
+------------------------------------------+
```

#### Events Table
| Timestamp | Type | Status | Details |
|-----------|------|--------|---------|
| 14:30:45 | Outbound | Success | REF-001234 pushed |
| 14:28:12 | Inbound | Success | Status update |
| 14:25:03 | Outbound | Success | REF-001233 pushed |

#### Alerting Rules
- Failure rate > 10% in last hour
- No successful webhook in last 30 minutes
- Response time > 5 seconds average
- Queue size > 1000 pending

#### Definition of Done
- [ ] Health dashboard implemented
- [ ] Metrics calculating correctly
- [ ] Events log working
- [ ] Alerting active
- [ ] Manual retry working
- [ ] Pause/resume working
- [ ] Unit tests complete

---

## EPIC 6: NOTIFICATIONS & COMMUNICATION

### 6.1 Email Notification System

**Priority:** P1 | **Story Points:** 13 | **Sprint:** 9

#### User Story
**As a** system  
**I want** to send email notifications for key events  
**So that** users stay informed

#### Acceptance Criteria
- [ ] Email service integration (SendGrid/AWS SES)
- [ ] Email templates for all notification types
- [ ] Personalization with user data
- [ ] Unsubscribe functionality
- [ ] Delivery tracking
- [ ] Failed delivery retry (3 attempts)
- [ ] Email queue for reliable sending

#### Technical Requirements
- Service: `EmailNotificationService`
- Email provider: SendGrid or AWS SES
- Template engine: Handlebars or Mustache
- Queue: Bull/Redis for reliability
- Database table: `email_logs`

#### Email Templates
1. Welcome Email (new advocate)
2. Referral Received Confirmation
3. Referral Status Update
4. Conversion Notification
5. Reward Calculated
6. Reward Payment Confirmation
7. Password Reset
8. Email Verification

#### Email Template Structure
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>{{subject}}</title>
</head>
<body>
  <div style="max-width: 600px; margin: 0 auto;">
    <img src="logo-url" alt="BuiltCred">
    <h1>{{heading}}</h1>
    <p>Hi {{user_name}},</p>
    {{content}}
    <p>Best regards,<br>BuiltCred Team</p>
    <hr>
    <small><a href="{{unsubscribe_url}}">Unsubscribe</a></small>
  </div>
</body>
</html>
```

#### Email Logging
```sql
CREATE TABLE email_logs (
  id UUID PRIMARY KEY,
  recipient_email VARCHAR(255) NOT NULL,
  template_name VARCHAR(100) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  failed_at TIMESTAMP,
  failure_reason TEXT,
  attempts INTEGER DEFAULT 0
);
```

#### Definition of Done
- [ ] Email service integrated
- [ ] All templates created
- [ ] Queue setup complete
- [ ] Delivery tracking working
- [ ] Retry logic implemented
- [ ] Unsubscribe working
- [ ] Unit tests complete
- [ ] Test emails sent and verified

---

### 6.2 SMS Notification System

**Priority:** P1 | **Story Points:** 8 | **Sprint:** 9-10

#### User Story
**As a** system  
**I want** to send SMS notifications for critical events  
**So that** users receive immediate updates

#### Acceptance Criteria
- [ ] SMS service integration (Twilio/AWS SNS)
- [ ] SMS templates for critical events
- [ ] India phone number support (+91)
- [ ] Character limit handling (160 chars)
- [ ] Delivery status tracking
- [ ] Failed delivery retry (2 attempts)
- [ ] Cost tracking per SMS

#### Technical Requirements
- Service: `SMSNotificationService`
- SMS provider: Twilio or AWS SNS
- Template variables support
- Queue: Bull/Redis
- Database table: `sms_logs`

#### SMS Templates
1. OTP for verification (100 chars)
2. Referral status update (160 chars)
3. Conversion notification (160 chars)
4. Payment confirmation (160 chars)

#### SMS Template Examples
```
OTP: Your BuiltCred verification code is {{otp}}. Valid for 10 minutes.

Referral Update: {{lead_name}} status changed to {{status}}. View details: {{link}}

Conversion: Congratulations! {{lead_name}} has booked. Reward: ₹{{amount}}. Details: {{link}}

Payment: ₹{{amount}} reward payment credited. Ref: {{payment_ref}}. Thank you!
```

#### SMS Logging
```sql
CREATE TABLE sms_logs (
  id UUID PRIMARY KEY,
  recipient_phone VARCHAR(20) NOT NULL,
  template_name VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  failed_at TIMESTAMP,
  failure_reason TEXT,
  cost DECIMAL(6,2),
  attempts INTEGER DEFAULT 0
);
```

#### Definition of Done
- [ ] SMS service integrated
- [ ] Templates created
- [ ] Delivery tracking working
- [ ] Retry logic implemented
- [ ] Cost tracking active
- [ ] Unit tests complete
- [ ] Test SMS sent and verified

---

### 6.3 WhatsApp Notification Integration

**Priority:** P2 | **Story Points:** 13 | **Sprint:** 11

#### User Story
**As a** system  
**I want** to send WhatsApp notifications  
**So that** users receive updates on their preferred channel

#### Acceptance Criteria
- [ ] WhatsApp Business API integration
- [ ] Message templates approved by WhatsApp
- [ ] Rich media support (images, links)
- [ ] Delivery status tracking
- [ ] Opt-in/opt-out management
- [ ] 24-hour conversation window compliance
- [ ] Template message fallback

#### Technical Requirements
- Service: `WhatsAppNotificationService`
- Provider: Twilio WhatsApp API or Meta Cloud API
- Template submission and approval process
- Queue: Bull/Redis
- Database table: `whatsapp_logs`

#### WhatsApp Templates
1. Referral confirmation with link
2. Status update with CTA
3. Conversion celebration with image
4. Payment confirmation

#### WhatsApp Template Example
```json
{
  "name": "referral_status_update",
  "language": "en",
  "components": [
    {
      "type": "header",
      "format": "text",
      "text": "Referral Update"
    },
    {
      "type": "body",
      "text": "Hi {{1}}, your referral {{2}} status changed to {{3}}. {{4}}"
    },
    {
      "type": "button",
      "sub_type": "url",
      "index": "0",
      "parameters": [
        {
          "type": "text",
          "text": "VIEW_DETAILS"
        }
      ]
    }
  ]
}
```

#### Opt-in Management
- User must opt-in to receive WhatsApp messages
- Opt-in collected during registration
- Opt-out link in every message
- Compliance with WhatsApp policies

#### Definition of Done
- [ ] WhatsApp API integrated
- [ ] Templates approved by WhatsApp
- [ ] Opt-in/opt-out working
- [ ] Delivery tracking working
- [ ] Unit tests complete
- [ ] Test messages sent and verified
- [ ] Compliance verified

---

### 6.4 In-App Notification System

**Priority:** P1 | **Story Points:** 8 | **Sprint:** 11

#### User Story
**As a** user  
**I want** to see notifications within the app  
**So that** I don't miss important updates

#### Acceptance Criteria
- [ ] Notification bell icon with unread count
- [ ] Notification list in dropdown
- [ ] Mark as read functionality
- [ ] Mark all as read button
- [ ] Click notification to view details
- [ ] Notification types with icons
- [ ] Persistent storage (last 30 days)
- [ ] Real-time updates (optional)

#### Technical Requirements
- Component: `NotificationCenter`
- API: GET `/api/v1/notifications`
- WebSocket for real-time updates (optional)
- Database table: `notifications`
- Local storage for offline access

#### Notification Types
- REFERRAL_STATUS_UPDATED (🔔)
- CONVERSION (🎉)
- REWARD_CALCULATED (💰)
- REWARD_PAID (✅)
- SYSTEM_ANNOUNCEMENT (📢)
- DOCUMENT_UPLOADED (📄)

#### Notification Object
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "type": "REFERRAL_STATUS_UPDATED",
  "title": "Referral Status Updated",
  "message": "Amit Kumar status changed to Site Visit Scheduled",
  "link": "/referrals/REF-001234",
  "read_at": null,
  "created_at": "2026-02-08T14:30:00Z"
}
```

#### Real-time Updates (Optional)
- WebSocket connection on dashboard
- Push notification when new notification arrives
- Update unread count in real-time
- Toast notification for critical alerts

#### Definition of Done
- [ ] Notification center UI implemented
- [ ] API endpoints working
- [ ] Mark as read working
- [ ] Unread count updating
- [ ] WebSocket working (if implemented)
- [ ] Unit tests complete
- [ ] E2E tests for notification flow

---

### 6.5 Notification Preferences

**Priority:** P2 | **Story Points:** 5 | **Sprint:** 11

#### User Story
**As a** user  
**I want** to control my notification preferences  
**So that** I only receive notifications I want

#### Acceptance Criteria
- [ ] Notification preferences page
- [ ] Toggle for each notification type
- [ ] Channel selection: Email, SMS, WhatsApp, In-app
- [ ] Frequency settings: Instant, Daily digest, Weekly digest
- [ ] Save preferences button
- [ ] Respects user choices for all notifications

#### Technical Requirements
- Component: `NotificationPreferences`
- API: GET/PUT `/api/v1/users/notification-preferences`
- Database table: `notification_preferences`
- Default preferences for new users

#### Preferences Structure
```json
{
  "user_id": "uuid",
  "preferences": {
    "referral_status_update": {
      "email": true,
      "sms": false,
      "whatsapp": true,
      "in_app": true,
      "frequency": "instant"
    },
    "conversion": {
      "email": true,
      "sms": true,
      "whatsapp": true,
      "in_app": true,
      "frequency": "instant"
    },
    "reward_calculated": {
      "email": true,
      "sms": false,
      "whatsapp": true,
      "in_app": true,
      "frequency": "instant"
    },
    "system_announcements": {
      "email": true,
      "sms": false,
      "whatsapp": false,
      "in_app": true,
      "frequency": "weekly_digest"
    }
  }
}
```

#### Preferences UI
```
+------------------------------------------+
| Notification Preferences                 |
+------------------------------------------+
| Referral Status Updates                  |
| [✓] Email  [✓] WhatsApp  [✓] In-app     |
| Frequency: [Instant v]                   |
+------------------------------------------+
| Conversions                              |
| [✓] Email  [✓] SMS  [✓] WhatsApp         |
| Frequency: [Instant v]                   |
+------------------------------------------+
| [Save Preferences]                       |
+------------------------------------------+
```

#### Definition of Done
- [ ] Preferences UI implemented
- [ ] API endpoints working
- [ ] Preferences respected by notification system
- [ ] Default preferences set for new users
- [ ] Unit tests complete
- [ ] E2E tests for preferences flow

---

## 🔐 SECURITY & COMPLIANCE

### Security Requirements (Ongoing)

**Priority:** P0 | **Story Points:** N/A | **Sprint:** All

#### Authentication & Authorization
- [ ] JWT-based authentication
- [ ] Role-based access control (RBAC)
- [ ] Password hashing with bcrypt (10 rounds minimum)
- [ ] Password reset with secure tokens (1-hour expiry)
- [ ] Multi-factor authentication (MFA) for admin users
- [ ] Session management with secure cookies
- [ ] Account lockout after 5 failed login attempts

#### Data Protection
- [ ] All passwords hashed and salted
- [ ] PII data encrypted at rest (AES-256)
- [ ] TLS 1.3 for all data in transit
- [ ] API keys encrypted in database
- [ ] Secure credential storage (AWS Secrets Manager)
- [ ] Regular database backups (daily, 30-day retention)
- [ ] GDPR compliance for data handling

#### API Security
- [ ] Rate limiting (100 requests/minute per user)
- [ ] API key rotation every 90 days
- [ ] CORS policy configured correctly
- [ ] Input validation and sanitization
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (output encoding)
- [ ] CSRF protection for state-changing requests

#### Privacy
- [ ] Privacy policy displayed prominently
- [ ] Terms of service acceptance required
- [ ] Data retention policy (3 years)
- [ ] Right to deletion functionality
- [ ] Data export functionality (GDPR)
- [ ] Audit logs for all data access
- [ ] Advocate data isolation (no cross-access)

#### Compliance
- [ ] GDPR compliance audit
- [ ] Data processing agreement with vendors
- [ ] Security incident response plan
- [ ] Regular penetration testing (quarterly)
- [ ] Security training for team members

---

## 🧪 TESTING REQUIREMENTS

### Test Coverage Requirements

**Unit Tests:** 90% coverage minimum
**Integration Tests:** All critical flows
**E2E Tests:** All user journeys
**Performance Tests:** All APIs < 1s response time
**Security Tests:** OWASP Top 10 coverage

### Test Scenarios by Epic

#### Epic 1: Core Advocate System
- [ ] Advocate type classification for all scenarios
- [ ] Validation engine with all error cases
- [ ] Cross-developer validation
- [ ] Advocate type selection UI interactions
- [ ] Dashboard differentiation by type

#### Epic 2: Referral Engine
- [ ] Referral submission happy path
- [ ] Referral submission validation errors
- [ ] Duplicate detection within 90 days
- [ ] Duplicate detection after 90 days
- [ ] First-touch attribution
- [ ] Last-touch attribution
- [ ] Reward calculation for all tiers
- [ ] Status transitions (all valid paths)

#### Epic 3: Homeowner Portal
- [ ] Login and authentication
- [ ] Dashboard loading and data display
- [ ] Referral list sorting and filtering
- [ ] Referral detail view
- [ ] Link sharing (all channels)
- [ ] Rewards display and calculations
- [ ] Document download
- [ ] Profile updates

#### Epic 4: Admin Panel
- [ ] Admin login and authorization
- [ ] Dashboard metrics accuracy
- [ ] Advocate management (CRUD)
- [ ] Referral management (status updates)
- [ ] Conversion marking
- [ ] Reward payment tracking
- [ ] Project configuration
- [ ] Analytics and reports
- [ ] Bulk operations

#### Epic 5: CRM Integration
- [ ] Webhook configuration
- [ ] Outbound webhook delivery
- [ ] Webhook retry logic
- [ ] Inbound API authentication
- [ ] Status update API
- [ ] Conversion API
- [ ] Field mapping
- [ ] Integration health monitoring

#### Epic 6: Notifications
- [ ] Email delivery
- [ ] SMS delivery
- [ ] WhatsApp delivery
- [ ] In-app notifications
- [ ] Notification preferences
- [ ] Unsubscribe functionality

---

## 📦 DEPLOYMENT & INFRASTRUCTURE

### Deployment Requirements

**Priority:** P0 | **Story Points:** N/A | **Sprint:** Pre-launch

#### Infrastructure
- [ ] AWS/Azure/GCP cloud hosting
- [ ] PostgreSQL database (RDS/managed)
- [ ] Redis for caching and queues
- [ ] CDN for static assets (CloudFront/Cloudflare)
- [ ] Load balancer for scalability
- [ ] Auto-scaling configuration
- [ ] Backup and disaster recovery plan

#### CI/CD Pipeline
- [ ] GitHub Actions / GitLab CI setup
- [ ] Automated testing on pull requests
- [ ] Staging environment deployment
- [ ] Production deployment with manual approval
- [ ] Rollback capability
- [ ] Database migration automation
- [ ] Environment variable management

#### Monitoring & Logging
- [ ] Application monitoring (Datadog/New Relic)
- [ ] Error tracking (Sentry)
- [ ] Log aggregation (ELK/CloudWatch)
- [ ] Performance monitoring (APM)
- [ ] Uptime monitoring (Pingdom/UptimeRobot)
- [ ] Alert configuration for critical issues
- [ ] Dashboard for key metrics

#### Performance
- [ ] Response time < 1 second (95th percentile)
- [ ] Page load time < 2 seconds
- [ ] Database query optimization
- [ ] CDN caching strategy
- [ ] API response caching (5-minute TTL)
- [ ] Image optimization
- [ ] Code splitting and lazy loading

---

## 📊 METRICS & KPIs

### Success Metrics

**Advocate Engagement:**
- Active advocates (made >= 1 referral in last 30 days)
- Average referrals per advocate
- Advocate retention rate

**Referral Performance:**
- Total referrals per month
- Referral-to-conversion rate
- Average time to conversion
- Conversion value

**Program ROI:**
- Total revenue from referrals
- Total rewards paid
- Cost per acquisition (CPA)
- Return on investment (ROI)

**System Performance:**
- API response time (p95)
- System uptime
- Error rate
- Webhook success rate

**User Experience:**
- Dashboard load time
- Mobile responsiveness score
- Accessibility score (Lighthouse)
- User satisfaction (NPS)

---

## 🚀 LAUNCH CHECKLIST

### Pre-Launch Requirements

**Development Complete:**
- [ ] All P0 features implemented
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code review complete
- [ ] Security audit passed
- [ ] Performance testing passed
- [ ] Accessibility audit passed

**Data & Content:**
- [ ] Database schema finalized
- [ ] Initial data imported
- [ ] Email templates finalized
- [ ] SMS templates finalized
- [ ] Legal documents (T&C, Privacy) finalized

**Infrastructure:**
- [ ] Production environment configured
- [ ] Database backed up
- [ ] CDN configured
- [ ] Monitoring tools active
- [ ] SSL certificates installed
- [ ] DNS configured

**Integrations:**
- [ ] CRM webhook tested end-to-end
- [ ] Email service configured
- [ ] SMS service configured
- [ ] Payment gateway tested (if applicable)

**Documentation:**
- [ ] User guide for advocates
- [ ] Admin guide for developers
- [ ] API documentation published
- [ ] Sales team training materials
- [ ] Support documentation

**Training & Support:**
- [ ] Sales team trained
- [ ] Admin team trained
- [ ] Support team trained
- [ ] Escalation process defined
- [ ] Support ticket system ready

**Launch Plan:**
- [ ] Launch date confirmed
- [ ] Communication plan ready
- [ ] Marketing materials prepared
- [ ] Soft launch to limited users
- [ ] Full launch announcement

---

## 🔄 POST-LAUNCH ITERATIONS

### Phase 2 Features (Months 4-6)

**Enhanced Analytics:**
- Multi-touch attribution modeling
- Predictive analytics for conversions
- Advocate lifetime value calculation
- A/B testing framework

**Gamification:**
- Leaderboards
- Badges and achievements
- Tiered advocate levels
- Bonus rewards for top performers

**Advanced CRM Features:**
- Bidirectional sync (read customer data from CRM)
- Multiple CRM support simultaneously
- Custom field mapping per project

**Mobile App:**
- Native iOS app
- Native Android app
- Push notifications
- Offline mode

**Differentiated Rewards:**
- Different reward structures for advocate types
- Project-specific reward rules
- Dynamic reward calculation based on market conditions

---

## 📝 NOTES

### Assumptions
- Single developer tenant for MVP
- Single currency (INR) for MVP
- English language only for MVP
- India phone numbers (+91) only for MVP
- Desktop-first, mobile responsive
- Manual payment processing by developer (no automated transfers)

### Out of Scope for MVP
- Multi-developer tenant support
- Multiple currencies
- Multi-language support
- International phone numbers
- Native mobile apps
- Automated payment disbursement
- Blockchain/NFT features
- AI-powered recommendations
- Video testimonials
- Social proof widgets

### Technical Debt
- Document known technical debt items
- Prioritize for future sprints
- Create separate backlog items

---

## 🎯 PRIORITY LEGEND

**P0 (Critical):** Must-have for MVP launch
**P1 (High):** Important but can be delayed if needed
**P2 (Medium):** Nice-to-have, can be post-launch
**P3 (Low):** Future consideration

---

**Document Version:** 2.0  
**Last Updated:** February 13, 2026  
**Next Review:** Weekly during development  
**Maintained By:** Product Manager

---

## 📞 CONTACTS

**Product Manager:** [Name]  
**Tech Lead:** [Name]  
**Stakeholder:** Developer/Admin  
**Support:** support@builtcred.com