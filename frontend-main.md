
## Frontend Pages & Responsibilities

### **1. Referral Engine Pages**

#### Advocate Type Selection Page
- **Route:** `/referral/select-type`
- **Responsibilities:**
  - Display advocate type options (Project Advocate vs Brand Advocate)
  - Show definitions and eligibility criteria
  - Guide users through selection process
  - Validate user's eligibility for each type
  - Store selection for next steps
  - Display auto-correction messages if invalid selection

#### Project Selection Page
- **Route:** `/referral/select-project`
- **Responsibilities:**
  - Show available projects based on advocate type
  - Display project details (name, location, status)
  - Filter projects by developer/eligibility
  - Allow project selection
  - Show referral scope (own project vs any project)

#### Lead Capture Form Page
- **Route:** `/referral/lead-form`
- **Responsibilities:**
  - Display lead capture form with validation
  - Collect buyer details (name, contact, budget)
  - Show form submission status
  - Validate required fields
  - Submit lead data to backend
  - Display success/error messages

#### Referral Link & QR Page
- **Route:** `/referral/link-qr`
- **Responsibilities:**
  - Display generated UUID-based referral link
  - Show QR code for the referral
  - Provide download QR code functionality
  - Copy link to clipboard feature
  - Display link validity & expiration
  - Show link sharing options

---

### **2. Homeowner Portal Pages**

#### Dashboard/Home Page
- **Route:** `/dashboard` or `/`
- **Responsibilities:**
  - Display advocate type badge
  - Show quick stats (active referrals, pending rewards, conversions)
  - Display referral summary cards
  - Show recent activity feed
  - Navigation menu to other sections
  - User profile quick access

#### My Referrals Page
- **Route:** `/dashboard/my-referrals`
- **Responsibilities:**
  - List all referrals with status (pending, converted, rejected)
  - Show lead details for each referral
  - Display referral timeline (first-touch, last-touch)
  - Filter/search by project or status
  - Show individual referral details on click
  - Display associated reward for each referral

#### My Projects Page
- **Route:** `/dashboard/projects`
- **Responsibilities:**
  - List projects advocate owns
  - Show project-specific referral links
  - Display project details (location, status, units available)
  - Show referral stats per project
  - Generate/regenerate project referral links
  - Display scoped referral information

#### Rewards & Payouts Page
- **Route:** `/dashboard/rewards`
- **Responsibilities:**
  - Display reward eligibility criteria
  - Show reward calculation breakdown
  - List paid rewards with dates & amounts
  - Show pending rewards with expected payout dates
  - Display reward history/transactions
  - Show total rewards earned & paid
  - Display reward tier information

#### Document Repository Page
- **Route:** `/dashboard/documents`
- **Responsibilities:**
  - Display documents available for download
  - Categorize documents (brochures, floor plans, legal docs)
  - Provide search/filter functionality
  - Show document metadata (size, date, format)
  - Enable bulk download
  - Track document views

#### Share & Promote Page
- **Route:** `/dashboard/share`
- **Responsibilities:**
  - Display sharing channels (WhatsApp, SMS, Email)
  - Generate pre-filled share messages
  - Provide share link tracking
  - Show share analytics (clicks, opens)
  - Allow custom message creation
  - Display share history

#### Referral Status Detail Page
- **Route:** `/dashboard/referral/:id`
- **Responsibilities:**
  - Show detailed referral information
  - Display lead journey/timeline
  - Show attribution details (first-touch, last-touch)
  - Display reward calculation & status
  - Show conversion progress if applicable
  - Allow document sharing from this page

---

### **3. Admin Panel Pages**

#### Admin Dashboard
- **Route:** `/admin/dashboard`
- **Responsibilities:**
  - Display KPI cards (total advocates, active referrals, conversions, rewards paid)
  - Show high-level analytics charts
  - Display alerts & notifications
  - Navigation to admin sections
  - Quick stats on advocate types & projects
  - System health status

#### Advocates Management Page
- **Route:** `/admin/advocates`
- **Responsibilities:**
  - List all advocates with filters (Project/Brand type, project, status)
  - Show advocate details (name, type, project, conversions)
  - Search advocates by name/email/ID
  - Bulk action support (import, export, status change)
  - Click advocate to view detailed profile
  - Edit advocate details/type (with validation)
  - Show advocate validation status

#### Referral Pipeline Page
- **Route:** `/admin/pipeline`
- **Responsibilities:**
  - Display referral pipeline by stage (new, qualified, converted, rejected)
  - Filter by advocate type (Project vs Brand)
  - Filter by project/developer
  - Show referral count at each stage
  - Drag-drop support for status changes
  - Display lead details in pipeline cards
  - Show conversion rate metrics
  - Filter by date range

#### Analytics & Reports Page
- **Route:** `/admin/analytics`
- **Responsibilities:**
  - Display advocate distribution chart (Project vs Brand)
  - Show conversion rate by advocate type
  - Display rewards paid dashboard
  - Show active referrals trend chart
  - Display top-performing projects
  - Show referral sources breakdown
  - Filter by date range & project
  - Export reports to CSV

#### Bulk Import Page
- **Route:** `/admin/bulk-import`
- **Responsibilities:**
  - File upload interface for CSV
  - Display file preview with mapping options
  - Show validation results before import
  - Display import progress/status
  - Show import errors & conflict resolution
  - Provide import logs/history
  - Allow field mapping configuration

#### CRM Settings Page
- **Route:** `/admin/settings/crm`
- **Responsibilities:**
  - Show CRM connection status
  - Configure CRM integrations (Salesforce, HubSpot, Zoho)
  - Field mapping visual editor
  - Webhook event log viewer
  - Test CRM connection functionality
  - Show sync health & error logs
  - Configure retry policies & timeouts

#### Project Configuration Page
- **Route:** `/admin/settings/projects`
- **Responsibilities:**
  - List all projects with details
  - Edit project information
  - Configure project-specific settings
  - Set reward tiers per project
  - Manage project advocates/brand advocates
  - Show project analytics
  - Configure referral validity periods

#### Validation Override Page
- **Route:** `/admin/validation-override`
- **Responsibilities:**
  - View pending validation requests
  - Display validation error details
  - Allow manual override of validations
  - Add override notes/justification
  - Audit log of overrides
  - Show override history

#### CSV Export Page
- **Route:** `/admin/exports`
- **Responsibilities:**
  - Select data to export (advocates, referrals, rewards)
  - Configure export filters & date range
  - Preview export data
  - Generate & download CSV
  - Show export history
  - Schedule automated exports

#### Settings & Configuration Page
- **Route:** `/admin/settings`
- **Responsibilities:**
  - Admin user management & roles
  - System configuration settings
  - Reward tier configuration
  - Email notification templates
  - API key management
  - Audit log viewer
  - System health monitoring

---

### **4. Shared/Common Pages**

#### Login Page
- **Route:** `/login`
- **Responsibilities:**
  - Email/password authentication
  - Display login form
  - Error handling & messages
  - Remember me functionality
  - Forgot password link
  - Redirect to appropriate dashboard (user/admin)

#### User Profile Page
- **Route:** `/profile` or `/account`
- **Responsibilities:**
  - Display user information
  - Show advocate type & associated projects
  - Allow profile editing (name, contact, preferences)
  - Password change functionality
  - Notification preferences
  - Account security settings

#### NotFound/404 Page
- **Route:** `/*`
- **Responsibilities:**
  - Display 404 error message
  - Provide navigation back to home
  - Show helpful links

#### Error Page
- **Route:** `/error`
- **Responsibilities:**
  - Display error message
  - Show error code & details
  - Provide recovery options
  - Contact support link

---
