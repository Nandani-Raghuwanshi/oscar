# BuiltCred Mini Product Backlog
## MVP Sprint Plan (10 Sprints / 20 Weeks)


---

## 🎯 MODULE OVERVIEW

| Module | Priority | Sprints |
|--------|----------|---------|
| 1. Authentication & User Management | P0 | Sprint 1-2 |
| 2. Advocate System | P0 | Sprint 2-4 |
| 3. Referral Engine | P0  Sprint 3-6 |
| 4. Homeowner Portal | P0 | Sprint 5-8 |
| 5. Admin Panel | P0 | Sprint 7-9 |
| 6. CRM Integration | P1 | Sprint 8-10 |
| 7. Notifications | P1 | Sprint 9-10 |



---

## MODULE 1: AUTHENTICATION & USER MANAGEMENT

**Sprints:** 1-2 |  **Priority:** P0

### 1.1 User Registration & Login

**Tasks:**
- [ ] Design registration form (name, email, phone, password)
- [ ] Implement phone OTP verification
- [ ] Create JWT authentication service
- [ ] Build login page with email/phone + password
- [ ] Implement "Remember Me" functionality
- [ ] Create session management
- [ ] Add CAPTCHA for bot prevention

**Technical Details:**
- JWT tokens with 24-hour expiry
- Refresh tokens with 30-day expiry
- Phone OTP: 6 digits, 10-minute validity
- Password: Min 8 chars, 1 uppercase, 1 number, 1 special char
- bcrypt hashing (10 rounds)

**Edge Cases:**
- [ ] User tries to register with existing email/phone
- [ ] OTP expires before verification
- [ ] User enters wrong OTP 3+ times
- [ ] Session expires during active use
- [ ] Concurrent logins from multiple devices
- [ ] Login with unverified email/phone
- [ ] Special characters in name/password

**Completion Criteria:**
- [ ] User can register with email + phone
- [ ] OTP sent and verified successfully
- [ ] User can login with credentials
- [ ] JWT tokens generated and validated
- [ ] Session persists across page refresh
- [ ] Unit tests: 95% coverage
- [ ] Security audit passed
- [ ] Load test: 100 concurrent registrations

---

### 1.2 Password Management

**Tasks:**
- [ ] Create "Forgot Password" flow
- [ ] Generate password reset tokens (1-hour expiry)
- [ ] Send password reset email with link
- [ ] Build password reset form
- [ ] Implement password change functionality
- [ ] Add password strength indicator

**Technical Details:**
- Reset token: Cryptographically secure random string
- Token stored in database with expiry timestamp
- Password history: Store last 3 passwords (prevent reuse)
- Email template for password reset

**Edge Cases:**
- [ ] Reset link expires
- [ ] User requests multiple reset emails
- [ ] Token used twice
- [ ] User changes password while reset link active
- [ ] Invalid/malformed reset token
- [ ] User not found in database

**Completion Criteria:**
- [ ] User receives password reset email within 2 minutes
- [ ] Reset link works correctly
- [ ] Old password cannot be reused
- [ ] Password successfully changed
- [ ] User can login with new password
- [ ] Unit tests: 90% coverage
- [ ] E2E test for complete flow

---

### 1.3 Role-Based Access Control

**Tasks:**
- [ ] Define user roles: ADVOCATE, ADMIN, SALES_REP, SUPER_ADMIN
- [ ] Create permissions table
- [ ] Implement role-based middleware
- [ ] Build authorization service
- [ ] Create admin role assignment UI
- [ ] Implement route protection
- [ ] Add role-based UI rendering

**Technical Details:**
```
Roles & Permissions:
ADVOCATE: 
  - View own profile
  - Create referrals
  - View own referrals
  - View own rewards

SALES_REP:
  - View assigned leads
  - Update lead status
  - Mark conversions

ADMIN:
  - All SALES_REP permissions
  - View all advocates
  - View all referrals
  - Configure projects
  - Manage rewards

SUPER_ADMIN:
  - All ADMIN permissions
  - User management
  - Role assignment
  - System configuration
```

**Edge Cases:**
- [ ] User has no role assigned
- [ ] User has multiple roles
- [ ] Role changed while user is logged in
- [ ] Permission denied on API call
- [ ] Role deleted while user has it
- [ ] Attempt to access unauthorized route

**Completion Criteria:**
- [ ] Each role has defined permissions
- [ ] API endpoints protected by role
- [ ] UI elements hidden based on role
- [ ] Unauthorized access returns 403
- [ ] Admin can assign/revoke roles
- [ ] Role changes take effect immediately
- [ ] Unit tests for all permission checks
- [ ] Integration tests for role-based flows

---

## MODULE 2: ADVOCATE SYSTEM

**Sprints:** 2-4 |  **Priority:** P0

### 2.1 Advocate Type Classification

**Tasks:**
- [ ] Create advocate_type enum (PROJECT_ADVOCATE, BRAND_ADVOCATE)
- [ ] Add advocate_type to customer profile
- [ ] Implement auto-classification logic
- [ ] Build advocate type display UI
- [ ] Create advocate type badge component
- [ ] Store source_project_id reference

**Technical Details:**
```sql
ALTER TABLE customers ADD COLUMN advocate_type VARCHAR(20);
ALTER TABLE customers ADD COLUMN source_project_id UUID REFERENCES projects(id);
CREATE INDEX idx_customers_advocate_type ON customers(advocate_type);
```

**Classification Logic:**
```javascript
function classifyAdvocate(customerId, targetProjectId) {
  const customer = getCustomer(customerId);
  const targetProject = getProject(targetProjectId);
  
  if (customer.source_project_id === targetProjectId) {
    return 'PROJECT_ADVOCATE';
  } else if (customer.developer_id === targetProject.developer_id) {
    return 'BRAND_ADVOCATE';
  } else {
    throw new Error('CROSS_DEVELOPER_NOT_PERMITTED');
  }
}
```

**Edge Cases:**
- [ ] Customer owns multiple projects
- [ ] Customer owns in completed project
- [ ] Project ownership not yet recorded
- [ ] Customer recently purchased (data lag)
- [ ] Developer changed project ownership
- [ ] Customer transferred plot to someone else

**Completion Criteria:**
- [ ] All customers have advocate_type assigned
- [ ] Classification logic works correctly
- [ ] Badge displays on all relevant screens
- [ ] Database migration completed
- [ ] Unit tests: 100% coverage
- [ ] Classification audit report generated

---

### 2.2 Advocate Eligibility Validation

**Tasks:**
- [ ] Build validation service
- [ ] Implement same-developer check
- [ ] Implement advocate type validation
- [ ] Create validation error responses
- [ ] Add validation to referral submission
- [ ] Build admin validation override
- [ ] Create validation audit log

**Technical Details:**
```javascript
Validation Checks:
1. Customer exists in database
2. Customer.developer_id === Target.developer_id
3. If PROJECT_ADVOCATE: customer.source_project === target_project
4. If BRAND_ADVOCATE: customer.source_project !== target_project
5. Target project accepts_referrals === true
6. Target project status === 'ACTIVE'
```

**Error Codes:**
- `CUSTOMER_NOT_FOUND`: Customer ID not in database
- `CROSS_DEVELOPER`: Attempting cross-developer referral
- `INVALID_ADVOCATE_TYPE`: Type doesn't match customer profile
- `PROJECT_CLOSED`: Target project not accepting referrals
- `PROJECT_ADVOCATE_MISMATCH`: Project advocate referring to different project

**Edge Cases:**
- [ ] Customer data not synced yet
- [ ] Project status changed mid-submission
- [ ] Concurrent validation requests
- [ ] Developer relationship changed
- [ ] Admin override without proper permissions
- [ ] Validation service temporarily down
- [ ] Database connection timeout during validation

**Completion Criteria:**
- [ ] All validation checks implemented
- [ ] Proper error messages returned
- [ ] Admin override works correctly
- [ ] Validation logs stored
- [ ] API response time < 200ms
- [ ] Unit tests: 95% coverage
- [ ] Integration tests with mock data
- [ ] Load test: 200 validations/second

---

### 2.3 Advocate Dashboard Differentiation

**Tasks:**
- [ ] Design PROJECT_ADVOCATE dashboard
- [ ] Design BRAND_ADVOCATE dashboard
- [ ] Implement role-based rendering
- [ ] Create eligibility section
- [ ] Build project-specific referral links
- [ ] Add advocate type statistics
- [ ] Implement access control

**Technical Details:**
```
PROJECT_ADVOCATE Dashboard:
- Header: Badge showing "Project Advocate"
- Eligibility: "You can refer to: [Your Project]"
- Referral Link: Single link for own project
- Visibility: Own project updates, own referrals only

BRAND_ADVOCATE Dashboard:
- Header: Badge showing "Brand Advocate"
- Eligibility: "You can refer to: [List of active projects]"
- Referral Links: Multiple links (one per active project)
- Visibility: Developer-wide updates, own referrals only
```

**Edge Cases:**
- [ ] User has no eligible projects
- [ ] All developer projects sold out
- [ ] User switches advocate type
- [ ] Project removed while viewing dashboard
- [ ] Multiple referral links generated
- [ ] Network error while loading projects
- [ ] Cached data shows wrong type

**Completion Criteria:**
- [ ] Both dashboard types render correctly
- [ ] Correct projects shown based on type
- [ ] Referral links generated properly
- [ ] Access control enforced
- [ ] UI updates when advocate type changes
- [ ] Mobile responsive
- [ ] Unit tests: 90% coverage
- [ ] E2E tests for both advocate types
- [ ] Accessibility score: 95+

---

## MODULE 3: REFERRAL ENGINE

**Sprints:** 3-6 |  **Priority:** P0

### 3.1 Referral Submission Form (Sprint 3 )

**Tasks:**
- [ ] Design referral form UI
- [ ] Create form validation
- [ ] Implement advocate type selector
- [ ] Add target project dropdown
- [ ] Build lead information section
- [ ] Add client-side validation
- [ ] Create success/error feedback

**Technical Details:**
```
Form Fields:
- advocate_type (radio: PROJECT_ADVOCATE / BRAND_ADVOCATE)
- target_project_id (dropdown: filtered by eligibility)
- lead_name (text, required, 2-100 chars)
- lead_phone (text, required, E.164 format)
- lead_email (text, optional, RFC 5322 format)
- budget_range (select, optional)
- notes (textarea, optional, max 500 chars)
```

**Validation Rules:**
- Phone: Must be valid Indian mobile (+91 followed by 10 digits)
- Email: Standard email format
- Name: No special chars except space, hyphen, apostrophe
- Notes: No HTML tags, max 500 chars

**Edge Cases:**
- [ ] Form submitted with empty required fields
- [ ] Invalid phone number format
- [ ] Invalid email format
- [ ] Network timeout during submission
- [ ] Double-click on submit button
- [ ] Browser back button after submission
- [ ] Form data lost on page refresh
- [ ] Copy-paste with extra spaces/newlines
- [ ] Non-English characters in name
- [ ] Emoji in notes field

**Completion Criteria:**
- [ ] Form renders correctly on all devices
- [ ] All validations working
- [ ] Error messages clear and helpful
- [ ] Submit disabled during API call
- [ ] Success message shows referral ID
- [ ] Form clears after successful submit
- [ ] Unit tests: 90% coverage
- [ ] E2E tests for valid and invalid submissions
- [ ] Accessibility: WCAG 2.1 AA compliant

---

### 3.2 Backend Referral Processing (Sprint 4 )

**Tasks:**
- [ ] Create referral API endpoint
- [ ] Implement validation service call
- [ ] Build duplicate detection
- [ ] Generate unique referral ID
- [ ] Store referral record
- [ ] Trigger CRM webhook
- [ ] Send confirmation notifications
- [ ] Create error handling

**Technical Details:**
```javascript
POST /api/v1/referrals
Request Body: {
  advocate_type, target_project_id, 
  lead_name, lead_phone, lead_email,
  budget_range, notes
}

Response: {
  success: true,
  referral_id: "REF-2026-001234",
  message: "Referral submitted successfully"
}
```

**Referral ID Format:**
- Pattern: `REF-YYYY-NNNNNN`
- Example: `REF-2026-001234`
- Sequential numbering per year

**Database Schema:**
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
  status VARCHAR(20) DEFAULT 'NEW',
  sales_context TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_phone_project ON referrals(lead_phone, target_project_id);
```

**Edge Cases:**
- [ ] Duplicate submission within seconds
- [ ] Validation passes but database insert fails
- [ ] CRM webhook times out
- [ ] Email service unavailable
- [ ] Referral ID generation collision
- [ ] Database connection lost mid-transaction
- [ ] Partial data saved on error
- [ ] Concurrent submissions from same user

**Completion Criteria:**
- [ ] API endpoint functional
- [ ] All validations integrated
- [ ] Duplicate detection working (90-day window)
- [ ] Referral ID generated correctly
- [ ] Database transactions atomic
- [ ] CRM webhook queued successfully
- [ ] Notifications sent reliably
- [ ] API response time < 1 second
- [ ] Unit tests: 95% coverage
- [ ] Integration tests with database
- [ ] Load test: 50 concurrent submissions

---

### 3.3 Referral Link & QR Code (Sprint 5 )

**Tasks:**
- [ ] Create referral link generator
- [ ] Implement UUID generation per advocate-project
- [ ] Build QR code generator
- [ ] Create link display UI with copy button
- [ ] Add share buttons (WhatsApp, SMS, Email)
- [ ] Implement click tracking
- [ ] Create link analytics

**Technical Details:**
```
Link Format: https://builtcred.com/ref/{PROJECT_CODE}-{UUID}
Example: https://builtcred.com/ref/OSANC-a8f4e2d9-c1b3-4567

UUID Generation:
- One UUID per advocate per project
- Stored in database for reuse
- Never expires

QR Code:
- Size: 512x512px
- Format: PNG
- Error Correction: Level H (30%)
- Stored in CDN after generation
```

**Database Schema:**
```sql
CREATE TABLE referral_links (
  id UUID PRIMARY KEY,
  advocate_id UUID REFERENCES customers(id),
  project_id UUID REFERENCES projects(id),
  link_code VARCHAR(50) UNIQUE NOT NULL,
  full_url TEXT NOT NULL,
  qr_code_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP,
  total_clicks INTEGER DEFAULT 0
);

CREATE INDEX idx_links_advocate_project ON referral_links(advocate_id, project_id);
CREATE INDEX idx_links_code ON referral_links(link_code);
```

**Edge Cases:**
- [ ] UUID collision (extremely rare)
- [ ] QR code generation fails
- [ ] CDN upload fails
- [ ] Link accessed before QR generated
- [ ] Multiple link generations for same advocate-project
- [ ] Link copied with trailing spaces
- [ ] QR code too large for storage
- [ ] Special characters in project code

**Completion Criteria:**
- [ ] Unique link generated per advocate-project
- [ ] QR code displays correctly
- [ ] Copy button works (with success feedback)
- [ ] Share buttons open correct apps/clients
- [ ] Click tracking records accurately
- [ ] QR download works
- [ ] Links are stable (don't change)
- [ ] Unit tests: 90% coverage
- [ ] E2E tests for link generation and usage
- [ ] QR code scans successfully on mobile devices

---

### 3.4 Lead Capture Landing Page (Sprint 5 )

**Tasks:**
- [ ] Design landing page layout
- [ ] Build dynamic project content loading
- [ ] Create lead submission form
- [ ] Implement referrer attribution tracking
- [ ] Add project image gallery
- [ ] Build call-to-action section
- [ ] Optimize for SEO and performance

**Technical Details:**
```
Route: /ref/{linkCode}

Landing Page Sections:
1. Hero: Project image + name
2. Referral Context: "Recommended by [FirstName]"
3. Project Highlights: 3-5 key features
4. Lead Form: Name, phone, email
5. CTA: "Schedule Site Visit" button
6. Footer: Developer info + trust badges

Form Submission:
POST /api/v1/leads/capture
{
  link_code, lead_name, lead_phone, 
  lead_email, preferred_contact_time
}
```

**Tracking:**
- UTM parameters in link
- First-touch timestamp
- Channel (link source)
- Device type
- Geographic location (IP-based)

**Edge Cases:**
- [ ] Invalid/expired link code
- [ ] Link for sold-out project
- [ ] Project data not loaded
- [ ] Image loading failures
- [ ] Form submission timeout
- [ ] Duplicate lead submission
- [ ] Mobile browser compatibility
- [ ] Slow network connection
- [ ] Page accessed without referral link

**Completion Criteria:**
- [ ] Landing page loads < 2 seconds
- [ ] Mobile responsive (tested on iOS & Android)
- [ ] Form submits successfully
- [ ] Referrer attribution recorded
- [ ] Images optimized and load quickly
- [ ] SEO meta tags configured
- [ ] Google Analytics/Mixpanel integrated
- [ ] Unit tests: 85% coverage
- [ ] E2E tests for form submission
- [ ] Lighthouse performance score > 90

---

### 3.5 Duplicate Detection & Attribution (Sprint 6 )

**Tasks:**
- [ ] Implement duplicate detection logic (90-day window)
- [ ] Create first-touch attribution
- [ ] Create last-touch attribution
- [ ] Build attribution history table
- [ ] Add duplicate handling UI
- [ ] Create admin override for duplicates
- [ ] Implement attribution analytics

**Technical Details:**
```sql
Duplicate Check Query:
SELECT id, referral_id, referrer_id, created_at, status
FROM referrals
WHERE lead_phone = :phone
  AND target_project_id = :project_id
  AND created_at > NOW() - INTERVAL '90 days'
  AND status != 'DUPLICATE'
LIMIT 1;

Attribution Table:
CREATE TABLE lead_attribution (
  id UUID PRIMARY KEY,
  lead_id UUID REFERENCES leads(id),
  referrer_id UUID REFERENCES customers(id),
  advocate_type VARCHAR(20),
  attribution_type VARCHAR(20), -- FIRST_TOUCH, LAST_TOUCH
  channel VARCHAR(50),
  link_code VARCHAR(50),
  attributed_at TIMESTAMP DEFAULT NOW()
);
```

**Attribution Logic:**
```javascript
if (!lead.first_touch_referrer_id) {
  // First referral
  lead.first_touch_referrer_id = referrer_id;
  lead.first_touch_date = NOW();
  lead.first_touch_channel = channel;
  lead.first_touch_advocate_type = advocate_type;
}

// Always update last touch
lead.last_touch_referrer_id = referrer_id;
lead.last_touch_date = NOW();
lead.last_touch_channel = channel;
lead.last_touch_advocate_type = advocate_type;
```

**Duplicate Handling:**
- Within 90 days: Reject with error message
- After 90 days: Allow as new referral
- Show existing referral details to user
- Admin can override duplicate check

**Edge Cases:**
- [ ] Exact 90-day boundary
- [ ] Multiple referrals on same day
- [ ] Phone number format variations (+91 vs 91)
- [ ] Referral from same advocate (re-submission)
- [ ] Original referral was marked LOST
- [ ] Lead contacted directly (no referral)
- [ ] Phone number changed by lead
- [ ] Database query timeout on large dataset

**Completion Criteria:**
- [ ] Duplicate detection works within 90 days
- [ ] Re-referrals allowed after 90 days
- [ ] Both first and last touch recorded
- [ ] Attribution history complete
- [ ] Admin override functional
- [ ] Error messages clear to users
- [ ] Query performance < 100ms
- [ ] Unit tests: 95% coverage
- [ ] Integration tests for all scenarios
- [ ] Load test: 100 concurrent duplicate checks

---

## MODULE 4: HOMEOWNER PORTAL

**Sprints:** 5-8 |  **Priority:** P0

### 4.1 Advocate Dashboard (Sprint 5 )

**Tasks:**
- [ ] Design dashboard layout
- [ ] Create statistics cards (referrals, conversions, rewards)
- [ ] Build eligibility section
- [ ] Add quick action buttons
- [ ] Implement recent activity feed
- [ ] Add advocate type badge
- [ ] Create responsive layout

**Technical Details:**
```
GET /api/v1/advocates/me/dashboard

Response: {
  advocate_type: "PROJECT_ADVOCATE",
  source_project: {...},
  eligible_projects: [{...}],
  stats: {
    total_referrals: 12,
    converted: 3,
    in_progress: 5,
    total_rewards: 75000
  },
  recent_referrals: [...]
}
```

**Dashboard Components:**
- Header: Welcome message + advocate badge
- Stats Grid: 4 metric cards
- Eligibility: Projects you can refer to
- Referral Link: Copy/share section
- Recent Activity: Last 5 referrals

**Edge Cases:**
- [ ] No referrals made yet (empty state)
- [ ] All projects sold out
- [ ] Stats calculation error
- [ ] Network timeout loading dashboard
- [ ] Stale data in cache
- [ ] Advocate type changed mid-session
- [ ] Multiple browser tabs open
- [ ] Dashboard accessed on slow connection

**Completion Criteria:**
- [ ] Dashboard loads < 1.5 seconds
- [ ] All stats display correctly
- [ ] Advocate type badge shows
- [ ] Eligible projects listed
- [ ] Recent activity displays
- [ ] Mobile responsive (320px+)
- [ ] Empty states handled gracefully
- [ ] Unit tests: 90% coverage
- [ ] E2E tests for dashboard load
- [ ] Accessibility score: 95+

---

### 4.2 Referral List & Detail View

**Tasks:**
- [ ] Build referral list table
- [ ] Implement sorting (date, status, name)
- [ ] Add status filtering
- [ ] Create search functionality
- [ ] Build pagination (20 per page)
- [ ] Create referral detail page
- [ ] Add status timeline component

**Technical Details:**
```
GET /api/v1/advocates/me/referrals
Query Params: {
  page: 1,
  limit: 20,
  sort: 'created_at',
  order: 'desc',
  status: 'CONTACTED',
  search: 'amit'
}

Response: {
  data: [...],
  total: 156,
  page: 1,
  limit: 20,
  has_next: true
}
```

**Table Columns:**
- Lead Name
- Phone
- Referred Date
- Status (badge)
- Project
- Reward (if converted)
- Actions (view details)

**Status Colors:**
- NEW: Yellow
- CONTACTED: Blue
- SITE_VISIT: Purple
- CONVERTED: Green
- DECLINED/LOST: Red

**Detail View Sections:**
- Lead Information
- Status Timeline (vertical)
- Estimated Reward
- Contact Sales (if needed)

**Edge Cases:**
- [ ] No referrals exist
- [ ] Filter returns no results
- [ ] Search with special characters
- [ ] Pagination at boundaries (first/last page)
- [ ] Sorting with null values
- [ ] Status changed while viewing list
- [ ] Detail page for deleted referral
- [ ] Network error during status update
- [ ] Very long lead name/notes

**Completion Criteria:**
- [ ] List displays all referrals correctly
- [ ] Sorting works for all columns
- [ ] Filtering by status functional
- [ ] Search finds partial matches
- [ ] Pagination accurate
- [ ] Detail page shows complete info
- [ ] Timeline displays status history
- [ ] Mobile: Card layout instead of table
- [ ] Unit tests: 90% coverage
- [ ] E2E tests for list operations
- [ ] Load time < 2 seconds for 500 referrals

---

### 4.3 Rewards Dashboard

**Tasks:**
- [ ] Design rewards display
- [ ] Calculate total earned (paid + pending)
- [ ] Build rewards list table
- [ ] Add payment status filtering
- [ ] Create reward detail modal
- [ ] Implement tax information display
- [ ] Add download statement button

**Technical Details:**
```
GET /api/v1/advocates/me/rewards

Response: {
  total_earned: 75000,
  paid: 50000,
  pending: 25000,
  rewards: [
    {
      id: "uuid",
      referral_id: "REF-2026-001234",
      lead_name: "Amit Kumar",
      gross_reward: 25000,
      tds_amount: 2500,
      net_reward: 22500,
      payment_status: "PAID",
      paid_on: "2026-03-10",
      payment_reference: "PAY-123"
    }
  ]
}
```

**Rewards Table Columns:**
- Date
- Referral
- Lead Name
- Gross Amount
- TDS (10%)
- Net Amount
- Status
- Payment Date

**Tax Information:**
- TDS rate: 10%
- TDS deducted before payment
- Form 26AS reference
- Download TDS certificate (if paid)

**Edge Cases:**
- [ ] No rewards earned yet
- [ ] All rewards pending
- [ ] Payment delayed beyond 30 days
- [ ] TDS calculation rounding errors
- [ ] Multiple rewards paid same day
- [ ] Reward amount updated after calculation
- [ ] Download fails (PDF generation)
- [ ] Network timeout loading rewards

**Completion Criteria:**
- [ ] Total earned displays correctly
- [ ] Paid vs pending breakdown accurate
- [ ] Rewards list shows all records
- [ ] Status filtering works
- [ ] Tax information clear
- [ ] TDS calculation correct
- [ ] Download statement functional
- [ ] Unit tests: 90% coverage
- [ ] E2E tests for rewards display
- [ ] Financial validation approved

---

### 4.4 Profile & Document Management

**Tasks:**
- [ ] Build profile view/edit page
- [ ] Implement email change with verification
- [ ] Implement phone change with OTP
- [ ] Add password change functionality
- [ ] Create document repository
- [ ] Build document upload (admin only)
- [ ] Add document download
- [ ] Implement notification preferences

**Technical Details:**
```
Profile Fields:
- Name (admin only)
- Email (requires verification)
- Phone (requires OTP)
- Address (editable)
- Profile picture (optional)

Documents:
- Allotment Letter
- Payment Receipts
- Registry Documents
- Construction Plans

Notification Preferences:
- Email: on/off per notification type
- SMS: on/off per notification type
- WhatsApp: on/off per notification type
```

**Email Change Flow:**
1. User enters new email
2. System sends verification link to new email
3. User clicks link (24-hour expiry)
4. Email updated in database
5. Confirmation sent to both old and new email

**Phone Change Flow:**
1. User enters new phone
2. System sends 6-digit OTP
3. User enters OTP (10-minute expiry)
4. Phone updated in database
5. Confirmation SMS sent

**Edge Cases:**
- [ ] Email already taken by another user
- [ ] Phone already registered
- [ ] Verification link expired
- [ ] OTP entered incorrectly 3 times
- [ ] Profile picture too large (>2MB)
- [ ] Invalid image format
- [ ] Document not found (404)
- [ ] PDF corruption on download
- [ ] Concurrent profile updates
- [ ] Email bounces (invalid address)

**Completion Criteria:**
- [ ] Profile displays all information
- [ ] Edit mode functional
- [ ] Email verification working
- [ ] Phone OTP verification working
- [ ] Password change successful
- [ ] Documents list correctly
- [ ] Document download works
- [ ] Preferences save correctly
- [ ] Unit tests: 90% coverage
- [ ] E2E tests for profile updates
- [ ] Security audit passed

---

## MODULE 5: ADMIN PANEL



### 5.1 Admin Dashboard & Analytics

**Tasks:**
- [ ] Design admin dashboard layout
- [ ] Build key metrics cards
- [ ] Create advocate type distribution chart
- [ ] Add referral pipeline visualization
- [ ] Build conversion funnel chart
- [ ] Implement date range filter
- [ ] Create export to CSV/PDF

**Technical Details:**
```
GET /api/v1/admin/dashboard

Response: {
  stats: {
    total_advocates: 342,
    project_advocates: 187,
    brand_advocates: 155,
    active_referrals: 456,
    conversions_mtd: 82,
    rewards_paid_mtd: 2050000
  },
  pipeline: {
    new: 156,
    contacted: 89,
    site_visit: 67,
    negotiating: 45,
    converted: 82,
    declined: 23
  },
  performance_by_type: {
    project: {
      avg_referrals: 1.4,
      conversion_rate: 0.169
    },
    brand: {
      avg_referrals: 1.2,
      conversion_rate: 0.196
    }
  }
}
```

**Charts:**
1. Advocate Distribution: Pie chart (Project vs Brand)
2. Referral Pipeline: Funnel chart
3. Conversion Trend: Line chart (last 6 months)
4. Channel Performance: Bar chart

**Date Range Options:**
- Today
- Yesterday
- Last 7 days
- Last 30 days
- This month
- Last month
- Custom range

**Edge Cases:**
- [ ] No data for selected date range
- [ ] Chart rendering fails
- [ ] Large dataset performance issues
- [ ] Date range exceeds 1 year
- [ ] Export timeout for large datasets
- [ ] Concurrent admin users
- [ ] Real-time data lag
- [ ] Cache inconsistency

**Completion Criteria:**
- [ ] Dashboard loads < 2 seconds
- [ ] All metrics accurate
- [ ] Charts render correctly
- [ ] Date filter works
- [ ] Export generates valid files
- [ ] Responsive on tablet/desktop
- [ ] Unit tests: 85% coverage
- [ ] Integration tests with mock data
- [ ] Load test: 10 concurrent admins

---

### 5.2 Advocate Management

**Tasks:**
- [ ] Build advocate list view
- [ ] Implement filtering (type, project, status)
- [ ] Add search functionality
- [ ] Create advocate detail page
- [ ] Build bulk import from CSV
- [ ] Add manual advocate creation
- [ ] Implement advocate status toggle

**Technical Details:**
```
GET /api/v1/admin/advocates
Query Params: {
  page: 1,
  limit: 50,
  advocate_type: 'PROJECT_ADVOCATE',
  project_id: 'uuid',
  status: 'active',
  search: 'name or phone'
}

Bulk Import CSV Format:
name,email,phone,project_code,plot_number,booking_date
Sunita Mehta,sunita@example.com,+919876543210,OSANC,A-127,2025-03-15
```

**Advocate Detail Sections:**
- Profile Information
- Ownership Details
- Referral History (table)
- Rewards Summary
- Activity Timeline
- Admin Actions (edit, deactivate)

**Bulk Import Process:**
1. Upload CSV file
2. Validate format and data
3. Show preview with errors
4. Confirm import
5. Process (auto-classify advocate types)
6. Show success/error summary

**Edge Cases:**
- [ ] CSV with invalid format
- [ ] Duplicate advocates in CSV
- [ ] CSV with missing required fields
- [ ] Very large CSV (10,000+ rows)
- [ ] CSV encoding issues (UTF-8)
- [ ] Import interrupted mid-process
- [ ] Phone numbers in various formats
- [ ] Email validation failures
- [ ] Project code not found
- [ ] Concurrent imports

**Completion Criteria:**
- [ ] List displays all advocates
- [ ] Filters work correctly
- [ ] Search finds partial matches
- [ ] Detail page shows complete info
- [ ] CSV import successful
- [ ] Validation errors clear
- [ ] Manual creation works
- [ ] Status toggle functional
- [ ] Unit tests: 90% coverage
- [ ] E2E tests for import flow
- [ ] CSV template provided

---

### 5.3 Referral & Conversion Management

**Tasks:**
- [ ] Build admin referral list
- [ ] Add advanced filtering
- [ ] Implement status update modal
- [ ] Create conversion marking form
- [ ] Build reward calculation display
- [ ] Add validation override
- [ ] Create bulk operations
- [ ] Implement assignment to sales rep

**Technical Details:**
```
Status Update:
PATCH /api/v1/admin/referrals/{id}/status
{
  status: "CONTACTED",
  sub_status: "site_visit_scheduled",
  notes: "Site visit on Feb 15",
  updated_by: "admin-user-id"
}

Mark Conversion:
POST /api/v1/admin/referrals/{id}/convert
{
  plot_number: "D-234",
  plot_value: 8500000,
  booking_date: "2026-02-08",
  booking_amount: 850000
}

Response: {
  success: true,
  conversion_id: "CONV-123",
  reward_calculated: {
    gross_reward: 25000,
    tds: 2500,
    net_reward: 22500,
    buyer_discount: 85000,
    payment_due: "2026-03-10"
  }
}
```

**Conversion Form:**
- Referral ID (read-only)
- Lead Name (read-only)
- Plot Number (dropdown)
- Plot Value (number input)
- Booking Date (date picker)
- Booking Amount (number input)
- Notes (textarea)

**Reward Calculation Display:**
```
Plot Value: ₹85,00,000
Referrer Reward (1%): ₹25,000
Less TDS (10%): ₹2,500
Net Reward: ₹22,500
Buyer Discount (1%): ₹85,000
Payment Due: 30 days from booking
```

**Bulk Operations:**
- Assign to sales rep
- Update status
- Export selected to CSV
- Send notification to referrers

**Edge Cases:**
- [ ] Status update without notes
- [ ] Invalid status transition
- [ ] Plot already sold
- [ ] Plot value below minimum
- [ ] Booking date in future
- [ ] Conversion marked twice
- [ ] Reward calculation error
- [ ] Concurrent status updates
- [ ] Bulk operation partial failure
- [ ] Sales rep not found

**Completion Criteria:**
- [ ] Referral list with advanced filters
- [ ] Status update working
- [ ] Conversion form functional
- [ ] Reward calculation accurate
- [ ] Validation override works
- [ ] Bulk operations successful
- [ ] Sales rep assignment working
- [ ] Notifications sent
- [ ] Unit tests: 95% coverage
- [ ] Integration tests for conversions
- [ ] Load test: 50 concurrent updates

---

## MODULE 6: CRM INTEGRATION

**Sprints:** 8-10 | **Priority:** P1

### 6.1 Webhook Configuration

**Tasks:**
- [ ] Build webhook config UI
- [ ] Implement credential encryption
- [ ] Create test connection feature
- [ ] Add webhook activity log
- [ ] Build enable/disable toggle
- [ ] Create retry configuration
- [ ] Add custom headers support

**Technical Details:**
```
Webhook Configuration:
- URL (HTTPS required)
- Authentication Method (API Key, Bearer, Basic, OAuth)
- Credentials (encrypted in database)
- Custom Headers (key-value pairs)
- Timeout (default 30s)
- Retry Policy (default 3 attempts)
- Active Status (on/off)

Test Connection:
POST /api/v1/admin/integrations/webhook/test
- Sends sample payload
- Returns response status & body
- Logs test attempt
```

**Encryption:**
- AES-256 for credentials
- Stored in separate encrypted column
- Decrypted only when needed for webhook call
- Never exposed in API responses

**Activity Log (last 100 events):**
- Timestamp
- Event type (outbound/inbound)
- Status (success/failure)
- Response code
- Error message (if failed)

**Edge Cases:**
- [ ] Invalid webhook URL
- [ ] Credentials with special characters
- [ ] Very long custom headers
- [ ] SSL certificate issues
- [ ] Webhook endpoint down
- [ ] Authentication fails
- [ ] Timeout during test
- [ ] Concurrent configuration updates

**Completion Criteria:**
- [ ] Configuration UI functional
- [ ] Credentials encrypted correctly
- [ ] Test connection works
- [ ] Activity log displays
- [ ] Toggle enable/disable works
- [ ] Retry policy configurable
- [ ] Unit tests: 90% coverage
- [ ] Security audit passed

---

### 6.2 Outbound Webhook

**Tasks:**
- [ ] Implement webhook service
- [ ] Create webhook queue (Redis/Bull)
- [ ] Build retry logic with exponential backoff
- [ ] Add comprehensive logging
- [ ] Implement failure alerts
- [ ] Create webhook payload formatting
- [ ] Build health monitoring

**Technical Details:**
```
Webhook Payload:
POST {webhook_url}
Headers: {
  X-API-Key: "{api_key}",
  Content-Type: "application/json"
}

Body: {
  event: "referral.created",
  timestamp: "2026-02-08T14:30:00Z",
  referral: {
    id: "REF-2026-001234",
    lead: {
      name: "Amit Kumar",
      phone: "+919876543210",
      email: "amit@example.com"
    },
    referrer: {
      id: "HO-12345",
      name: "Sunita Mehta",
      advocate_type: "PROJECT_ADVOCATE",
      source_project: "Oscar Sanctuary",
      plot_number: "A-127"
    },
    target_project: "Oscar Sanctuary",
    sales_context: "Referred by fellow resident"
  }
}
```

**Retry Logic:**
- Attempt 1: Immediate
- Attempt 2: 4 seconds delay
- Attempt 3: 16 seconds delay
- After 3 failures: Log and alert admin

**Webhook Queue:**
- Async processing (non-blocking)
- Guaranteed delivery
- Retry failed webhooks
- Priority queue for critical events

**Edge Cases:**
- [ ] Webhook URL unreachable
- [ ] Response timeout (>30s)
- [ ] Non-200 response codes
- [ ] Invalid JSON in response
- [ ] Network interruption mid-call
- [ ] Queue overflow (>10,000 pending)
- [ ] Webhook disabled during processing
- [ ] Circular webhook calls

**Completion Criteria:**
- [ ] Webhook triggers on referral creation
- [ ] Payload formatted correctly
- [ ] Queue processes reliably
- [ ] Retry logic working
- [ ] Failures logged
- [ ] Admin alerts sent
- [ ] Performance: 100 webhooks/minute
- [ ] Unit tests: 95% coverage
- [ ] Integration tests with mock endpoints
- [ ] Load test: 500 webhooks in 1 minute

---

### 6.3 Inbound API

**Tasks:**
- [ ] Create status update API endpoint
- [ ] Create conversion API endpoint
- [ ] Implement API key authentication
- [ ] Add rate limiting
- [ ] Build field validation
- [ ] Create API documentation (OpenAPI)
- [ ] Implement webhook security (signature verification)

**Technical Details:**
```
Status Update API:
PATCH /api/v1/referrals/{id}/status
Authorization: Bearer {api_key}

Request: {
  status: "CONTACTED",
  sub_status: "site_visit_scheduled",
  notes: "Site visit on Feb 15",
  updated_by: "sales-agent-id"
}

Response: {
  success: true,
  referral_id: "REF-2026-001234",
  previous_status: "NEW",
  current_status: "CONTACTED",
  advocate_notified: true
}

Conversion API:
POST /api/v1/referrals/{id}/convert
Authorization: Bearer {api_key}

Request: {
  plot_number: "D-234",
  plot_value: 8500000,
  booking_date: "2026-02-08",
  booking_amount: 850000
}

Response: {
  success: true,
  conversion_id: "CONV-123",
  reward_calculated: {...}
}
```

**API Key Management:**
- Generate secure random keys (32 chars)
- Store hashed in database
- Associate with CRM account
- Support multiple keys per account
- Revoke/regenerate functionality

**Rate Limiting:**
- 100 requests/minute per API key
- 429 status on limit exceeded
- Rate limit info in response headers

**Security:**
- HTTPS required
- API key in Authorization header
- Request signature verification (HMAC-SHA256)
- IP whitelisting (optional)

**Edge Cases:**
- [ ] Invalid API key
- [ ] Expired API key
- [ ] Rate limit exceeded
- [ ] Invalid referral ID
- [ ] Invalid status transition
- [ ] Duplicate conversion attempt
- [ ] Malformed JSON
- [ ] Missing required fields
- [ ] Plot not available
- [ ] Concurrent API calls

**Completion Criteria:**
- [ ] Both API endpoints functional
- [ ] Authentication working
- [ ] Rate limiting active
- [ ] Validation comprehensive
- [ ] API docs published (Swagger/OpenAPI)
- [ ] Security measures implemented
- [ ] Unit tests: 95% coverage
- [ ] Integration tests with mock CRM
- [ ] Load test: 100 requests/minute sustained

---

## MODULE 7: NOTIFICATIONS

**Sprints:** 9-10 |  **Priority:** P1

### 7.1 Email Notification System

**Tasks:**
- [ ] Integrate email service (SendGrid/AWS SES)
- [ ] Create email templates
- [ ] Implement email queue
- [ ] Build template personalization
- [ ] Add unsubscribe functionality
- [ ] Implement delivery tracking
- [ ] Create retry logic for failures

**Technical Details:**
```
Email Templates:
1. Welcome Email (new advocate registration)
2. Referral Confirmation
3. Referral Status Update
4. Conversion Notification
5. Reward Calculated
6. Reward Payment Confirmation
7. Password Reset
8. Email Verification

Email Queue:
- Redis/Bull queue
- Async processing
- 3 retry attempts
- Exponential backoff

Tracking:
- Sent timestamp
- Delivered timestamp
- Opened timestamp (tracking pixel)
- Clicked timestamp (link tracking)
```

**Email Service Config:**
- From: noreply@builtcred.com
- Reply-To: support@builtcred.com
- Template engine: Handlebars
- Max retries: 3
- Timeout: 30 seconds

**Edge Cases:**
- [ ] Email service unavailable
- [ ] Invalid email address
- [ ] Email bounces (hard/soft)
- [ ] Spam complaints
- [ ] Unsubscribe during queue processing
- [ ] Template rendering fails
- [ ] Attachment too large
- [ ] Rate limit from email provider

**Completion Criteria:**
- [ ] Email service integrated
- [ ] All templates created and tested
- [ ] Queue processing reliably
- [ ] Personalization working
- [ ] Unsubscribe functional
- [ ] Delivery tracking accurate
- [ ] Retry logic working
- [ ] Unit tests: 90% coverage
- [ ] Test emails sent successfully
- [ ] Email deliverability score >95%

---

### 7.2 SMS & WhatsApp Notifications

**Tasks:**
- [ ] Integrate SMS service (Twilio/AWS SNS)
- [ ] Create SMS templates (160 char limit)
- [ ] Implement SMS queue
- [ ] Add delivery tracking
- [ ] Integrate WhatsApp Business API
- [ ] Create WhatsApp templates
- [ ] Build opt-in/opt-out management

**Technical Details:**
```
SMS Templates:
1. OTP Verification
2. Referral Status Update
3. Conversion Notification
4. Payment Confirmation

Example:
"Your BuiltCred referral {{lead_name}} status: {{status}}. View: {{link}}"

WhatsApp Templates:
1. Referral Confirmation (with link)
2. Status Update (with CTA button)
3. Conversion Celebration (with image)
4. Payment Confirmation

Template Approval:
- Submit to WhatsApp for approval
- Wait 24-48 hours
- Use only approved templates
```

**SMS Constraints:**
- 160 characters max (single SMS)
- International format: +91XXXXXXXXXX
- DND registry compliance
- Cost tracking per SMS

**WhatsApp Constraints:**
- 24-hour conversation window
- Template messages only (first contact)
- Opt-in required
- Rich media support (images, documents)

**Edge Cases:**
- [ ] Phone number not registered for WhatsApp
- [ ] SMS delivery fails (network issues)
- [ ] User in DND registry
- [ ] WhatsApp template not approved
- [ ] Message exceeds 160 chars
- [ ] Invalid phone number format
- [ ] Opt-out during message processing
- [ ] Rate limit from provider

**Completion Criteria:**
- [ ] SMS service integrated
- [ ] SMS templates created
- [ ] WhatsApp API integrated
- [ ] WhatsApp templates approved
- [ ] Opt-in/opt-out functional
- [ ] Delivery tracking working
- [ ] Cost tracking accurate
- [ ] Unit tests: 90% coverage
- [ ] Test messages sent successfully
- [ ] Compliance verified

---

### 7.3 In-App Notifications

**Tasks:**
- [ ] Build notification center UI
- [ ] Create notification dropdown
- [ ] Implement unread count badge
- [ ] Add mark as read functionality
- [ ] Build real-time updates (WebSocket)
- [ ] Create notification preferences
- [ ] Implement notification types with icons

**Technical Details:**
```
GET /api/v1/notifications
Response: {
  data: [
    {
      id: "uuid",
      type: "REFERRAL_STATUS_UPDATED",
      title: "Referral Status Updated",
      message: "Amit Kumar status changed",
      link: "/referrals/REF-001234",
      read_at: null,
      created_at: "2026-02-08T14:30:00Z"
    }
  ],
  unread_count: 5
}

WebSocket Events:
- notification.new
- notification.read
- notification.deleted
```

**Notification Types:**
- 🔔 REFERRAL_STATUS_UPDATED
- 🎉 CONVERSION
- 💰 REWARD_CALCULATED
- ✅ REWARD_PAID
- 📢 SYSTEM_ANNOUNCEMENT
- 📄 DOCUMENT_UPLOADED

**Notification Center:**
- Bell icon in header
- Red badge with unread count
- Dropdown with last 10 notifications
- "View All" link to full page
- Mark all as read button

**Edge Cases:**
- [ ] WebSocket connection lost
- [ ] Notification arrives while offline
- [ ] Very long notification message
- [ ] Notification for deleted referral
- [ ] Concurrent mark as read
- [ ] Browser notifications permission denied
- [ ] Multiple tabs open (sync issue)

**Completion Criteria:**
- [ ] Notification center displays
- [ ] Unread count accurate
- [ ] Mark as read works
- [ ] WebSocket updates real-time
- [ ] Notification preferences functional
- [ ] All notification types supported
- [ ] Unit tests: 90% coverage
- [ ] E2E tests for notification flow
- [ ] Mobile responsive

---

## 🔐 CROSS-CUTTING CONCERNS

### Security (All Sprints)

**Tasks:**
- [ ] Implement input validation (all endpoints)
- [ ] Add SQL injection prevention (parameterized queries)
- [ ] Implement XSS prevention (output encoding)
- [ ] Add CSRF protection (tokens)
- [ ] Implement rate limiting (all APIs)
- [ ] Add audit logging (critical actions)
- [ ] Conduct security audit (before launch)
- [ ] Implement data encryption (PII fields)

**Security Checklist:**
- [ ] All passwords hashed (bcrypt, 10 rounds)
- [ ] All API endpoints authenticated
- [ ] All PII encrypted at rest (AES-256)
- [ ] All traffic over HTTPS (TLS 1.3)
- [ ] All secrets in environment variables
- [ ] All database queries parameterized
- [ ] All user inputs validated
- [ ] All outputs encoded
- [ ] All admin actions logged
- [ ] All dependencies up-to-date

---

### Performance (All Sprints)

**Tasks:**
- [ ] Optimize database queries (indexes)
- [ ] Implement caching strategy (Redis)
- [ ] Add CDN for static assets
- [ ] Implement lazy loading (images)
- [ ] Add database connection pooling
- [ ] Optimize bundle size (code splitting)
- [ ] Implement query result pagination
- [ ] Add response compression (gzip)

**Performance Targets:**
- API response time: <1 second (p95)
- Page load time: <2 seconds
- Time to interactive: <3 seconds
- Database query time: <100ms (p95)
- Lighthouse score: >90

---

### Testing (All Sprints)

**Test Coverage Requirements:**
- Unit tests: 90% coverage
- Integration tests: All critical flows
- E2E tests: All user journeys
- Load tests: 100 concurrent users
- Security tests: OWASP Top 10

**Test Types:**
- [ ] Unit tests (Jest)
- [ ] Integration tests (Supertest)
- [ ] E2E tests (Playwright/Cypress)
- [ ] API tests (Postman/Newman)
- [ ] Load tests (k6/Artillery)
- [ ] Security tests (OWASP ZAP)

---

## 📊 SPRINT VELOCITY & TIMELINE

| Sprint | Weeks | Focus Areas |
|--------|-------|-------------|--------------|
| Sprint 1 | 1-2 | Authentication Setup | 34 |
| Sprint 2 | 3-4 | Auth + Advocate Classification | 39 |
| Sprint 3 | 5-6 | Advocate Validation + Referral Form | 47 |
| Sprint 4 | 7-8 | Referral Processing + Dashboard | 55 |
| Sprint 5 | 9-10 | Referral Links + Landing Page + Portal | 47 |
| Sprint 6 | 11-12 | Attribution + Portal Views | 42 |
| Sprint 7 | 13-14 | Admin Dashboard + Rewards | 47 |
| Sprint 8 | 15-16 | Admin Management + Webhook Config | 55 |
| Sprint 9 | 17-18 | Conversions + Outbound API + Email | 68 |
| Sprint 10 | 19-20 | Inbound API + SMS/WhatsApp + In-App | 42 |



---

## 🚀 DEFINITION OF DONE (DoD)

**For all user stories, the following must be completed:**

- [ ] Code written and peer-reviewed
- [ ] Unit tests written (90%+ coverage)
- [ ] Integration tests written (where applicable)
- [ ] E2E tests written (critical flows)
- [ ] Documentation updated
- [ ] Code merged to main branch
- [ ] Deployed to staging environment
- [ ] QA testing completed
- [ ] Product owner approval
- [ ] Performance benchmarks met
- [ ] Security review completed
- [ ] Accessibility check passed

---

## 📝 NOTES

**Assumptions:**
- 2-week sprints
- Team velocity: 40-45 points/sprint
- Single developer tenant for MVP
- Manual payment processing
- English language only
- India market only (+91 phone numbers)

**Dependencies:**
- Email service account (SendGrid/AWS SES)
- SMS service account (Twilio/AWS SNS)
- WhatsApp Business API approval
- Cloud hosting setup (AWS/Azure/GCP)
- Database provisioning (PostgreSQL)
- Redis setup (caching & queues)
- CDN setup (CloudFront/Cloudflare)

**Risks:**
- WhatsApp template approval delays (24-48 hours)
- CRM integration compatibility issues
- Performance degradation with scale
- Third-party service outages
- Security vulnerabilities discovered

---
