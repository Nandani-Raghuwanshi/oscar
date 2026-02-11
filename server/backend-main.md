
# BuiltCred Referral System – Backend To-Do List
## 📋 Phase 0: Authentication & Core Infrastructure (Add to beginning)

### User Authentication System

#### User Registration & Signup
- [ ] **POST** `/api/auth/signup`
  - [ ] Accept email, password, full name
  - [ ] Validate email format & strength
  - [ ] Hash password securely
  - [ ] Create user record in database
  - [ ] Generate email verification token
  - [ ] Send verification email
  - [ ] Return confirmation message

#### Email Verification
- [ ] **POST** `/api/auth/verify-email`
  - [ ] Accept verification token
  - [ ] Verify token validity & expiration
  - [ ] Mark email as verified
  - [ ] Activate user account
  - [ ] Return success message
- [ ] **POST** `/api/auth/resend-verification`
  - [ ] Resend verification email
  - [ ] Generate new token if old one expired

#### User Login
- [ ] **POST** `/api/auth/login`
  - [ ] Accept email & password
  - [ ] Verify credentials
  - [ ] Check email verification status
  - [ ] Generate JWT access token (15 min expiry)
  - [ ] Generate refresh token (7 days expiry)
  - [ ] Log login activity
  - [ ] Return tokens & user data

#### Token Refresh
- [ ] **POST** `/api/auth/refresh-token`
  - [ ] Accept refresh token
  - [ ] Validate token & expiration
  - [ ] Generate new access token
  - [ ] Optionally rotate refresh token
  - [ ] Log token refresh

#### Password Reset Flow
- [ ] **POST** `/api/auth/forgot-password`
  - [ ] Accept email address
  - [ ] Check if user exists
  - [ ] Generate password reset token (1 hour expiry)
  - [ ] Send reset email with link
  - [ ] Log password reset request
- [ ] **POST** `/api/auth/reset-password`
  - [ ] Accept reset token & new password
  - [ ] Validate token & expiration
  - [ ] Validate password strength
  - [ ] Hash new password
  - [ ] Update user password
  - [ ] Invalidate all existing tokens
  - [ ] Send confirmation email

#### Password Change (Authenticated User)
- [ ] **POST** `/api/auth/change-password`
  - [ ] Require current password verification
  - [ ] Accept new password
  - [ ] Validate password strength
  - [ ] Update password
  - [ ] Invalidate all existing tokens
  - [ ] Force re-login

#### User Logout
- [ ] **POST** `/api/auth/logout`
  - [ ] Invalidate JWT token
  - [ ] Revoke refresh token
  - [ ] Log logout activity
  - [ ] Clear session data

#### Two-Factor Authentication (2FA)
- [ ] **POST** `/api/auth/2fa/setup`
  - [ ] Generate TOTP secret
  - [ ] Return QR code for scanning
  - [ ] Accept verification code
  - [ ] Enable 2FA on account
- [ ] **POST** `/api/auth/2fa/verify`
  - [ ] Accept TOTP code during login
  - [ ] Verify code validity
  - [ ] Complete authentication if valid
- [ ] **POST** `/api/auth/2fa/disable`
  - [ ] Require password verification
  - [ ] Disable 2FA
  - [ ] Generate backup codes

#### Social Login Integration (Optional Phase 1)
- [ ] **POST** `/api/auth/google/callback`
  - [ ] Verify Google OAuth token
  - [ ] Create/find user account
  - [ ] Generate BuiltCred tokens
- [ ] **POST** `/api/auth/facebook/callback`
  - [ ] Verify Facebook OAuth token
  - [ ] Create/find user account
  - [ ] Generate BuiltCred tokens

---

### Notification Services

#### Email Service
- [ ] **Service:** EmailService
  - [ ] Send transactional emails (verification, reset, etc.)
  - [ ] Template rendering engine
  - [ ] Support HTML & plain text
  - [ ] Queue email sending
  - [ ] Track email delivery status
  - [ ] Handle bounces & complaints
  - [ ] Implement retry logic
- [ ] **Provider Integration:**
  - [ ] SendGrid / Mailgun / AWS SES configuration
  - [ ] Template management
  - [ ] Unsubscribe handling

#### SMS Service
- [ ] **Service:** SMSService
  - [ ] Send SMS notifications (OTP, referral updates)
  - [ ] Support OTP delivery for 2FA
  - [ ] Track delivery status
  - [ ] Handle failures & retries
  - [ ] Support multiple regions/carriers
- [ ] **Provider Integration:**
  - [ ] Twilio / AWS SNS / Vonage configuration

#### WhatsApp Notifications
- [ ] **Service:** WhatsAppService
  - [ ] Send referral updates via WhatsApp
  - [ ] Send reward notifications
  - [ ] Send conversion alerts
  - [ ] Track message delivery
- [ ] **Provider Integration:**
  - [ ] Meta WhatsApp Business API configuration

#### In-App Notifications
- [ ] **Service:** NotificationService
  - [ ] Create in-app notification records
  - [ ] Send real-time notifications (WebSocket/Server-Sent Events)
  - [ ] Store notification history
  - [ ] Mark as read/unread
  - [ ] Archive notifications
- [ ] **Database:**
  - [ ] Create `notifications` table
  - [ ] Create `notification_preferences` table

#### Notification Templates
- [ ] Email templates:
  - [ ] Email verification template
  - [ ] Password reset template
  - [ ] Welcome email template
  - [ ] Referral confirmation template
  - [ ] Lead received template
  - [ ] Conversion notification template
  - [ ] Reward payout template
  - [ ] CRM sync error template
- [ ] SMS templates:
  - [ ] OTP template
  - [ ] Referral link template
  - [ ] Lead update template
  - [ ] Reward notification template
- [ ] WhatsApp templates:
  - [ ] Referral received template
  - [ ] Conversion alert template
  - [ ] Reward earned template

#### Notification Preferences
- [ ] **POST** `/api/notifications/preferences`
  - [ ] Store user notification preferences
  - [ ] Allow opt-in/opt-out per channel
  - [ ] Support frequency settings
- [ ] **GET** `/api/notifications/preferences`
  - [ ] Retrieve user preferences

---

### File Upload & Storage Service

#### File Upload Service
- [ ] **Service:** FileUploadService
  - [ ] Handle multipart file uploads
  - [ ] Validate file types & sizes
  - [ ] Generate unique file names
  - [ ] Store file metadata
  - [ ] Support chunked uploads (for large files)
  - [ ] Implement virus scanning
  - [ ] Generate file hashes

#### Cloud Storage Integration
- [ ] **Service:** StorageService
  - [ ] Upload files to S3 / GCP Storage / Azure Blob
  - [ ] Generate secure download URLs
  - [ ] Set access control & expiration
  - [ ] Implement CDN caching
  - [ ] Delete old files with retention policies
- [ ] **POST** `/api/files/upload`
  - [ ] Accept file upload
  - [ ] Validate & scan file
  - [ ] Store in cloud storage
  - [ ] Save metadata to database
  - [ ] Return file URL & ID
- [ ] **GET** `/api/files/:fileId/download`
  - [ ] Generate secure download URL
  - [ ] Stream file to client
  - [ ] Log download activity

#### Document Management
- [ ] Create `documents` table
  - [ ] id, file_id, project_id, document_type
  - [ ] title, description, size, format
  - [ ] upload_timestamp, expiration_date
  - [ ] view_count, access_log
- [ ] **POST** `/api/documents/upload`
  - [ ] Upload project documents
  - [ ] Categorize by type
  - [ ] Set visibility & access control
- [ ] **PUT** `/api/documents/:documentId`
  - [ ] Update document metadata
  - [ ] Update visibility & access

---

### Logging & Monitoring Service

#### Structured Logging
- [ ] **Service:** LoggerService
  - [ ] Log with different levels (error, warn, info, debug)
  - [ ] Include request context (userId, timestamp, endpoint)
  - [ ] Structure logs as JSON
  - [ ] Support log correlation IDs
  - [ ] Implement async logging (non-blocking)
- [ ] **Configuration:**
  - [ ] Winston / Pino / Morgan setup
  - [ ] Log file rotation
  - [ ] Log retention policies

#### Request Logging Middleware
- [ ] **Middleware:** RequestLogger()
  - [ ] Log all incoming requests
  - [ ] Include method, path, query params
  - [ ] Log response status & timing
  - [ ] Log request/response body (sanitized)
  - [ ] Track request ID throughout execution

#### Error Logging
- [ ] **Service:** ErrorLogger
  - [ ] Capture all exceptions
  - [ ] Log stack traces
  - [ ] Include context & variables
  - [ ] Send critical errors to monitoring service
  - [ ] Alert on repeated errors

#### Performance Metrics Logging
- [ ] **Service:** MetricsService
  - [ ] Track API response times
  - [ ] Monitor database query performance
  - [ ] Track external API calls
  - [ ] Monitor memory & CPU usage
  - [ ] Generate performance reports

---

### Caching Service

#### Redis Cache Configuration
- [ ] **Service:** CacheService
  - [ ] Connect to Redis
  - [ ] Implement key-value storage
  - [ ] Set TTL for cache entries
  - [ ] Support cache invalidation
  - [ ] Handle cache misses gracefully
- [ ] **Caching Strategy:**
  - [ ] Cache advocate data (1 hour)
  - [ ] Cache project data (2 hours)
  - [ ] Cache reward tier configs (daily)
  - [ ] Cache analytics aggregations (hourly)
  - [ ] Cache user sessions (session duration)

#### Session Management
- [ ] **Service:** SessionService
  - [ ] Store sessions in Redis
  - [ ] Implement session expiration
  - [ ] Support session refresh
  - [ ] Track concurrent sessions
  - [ ] Implement logout (session invalidation)

---

### Error Handling & Validation

#### Centralized Error Handling
- [ ] **Service:** ErrorHandler
  - [ ] Standardize error responses
  - [ ] Map exceptions to HTTP status codes
  - [ ] Include error codes & messages
  - [ ] Include request ID for debugging
  - [ ] Sanitize error messages (no sensitive data)
- [ ] **Error Response Format:**
  ```json
  {
    "error": "VALIDATION_ERROR",
    "message": "User-friendly message",
    "details": [...],
    "requestId": "req-uuid",
    "timestamp": "2024-01-01T00:00:00Z"
  }
  ```
  
## 📋 Phase 1: MVP Core Features

### Database Schema & Design

#### Advocates Management
- [ ] Create `advocates` table
  - [ ] id (UUID, primary key)
  - [ ] user_id (foreign key to users)
  - [ ] advocate_type (PROJECT_ADVOCATE, BRAND_ADVOCATE)
  - [ ] primary_project_id (foreign key to projects)
  - [ ] developer_id (for multi-developer support)
  - [ ] eligibility_verified (boolean)
  - [ ] created_at, updated_at timestamps
  - [ ] Add indexes on user_id, advocate_type, developer_id

#### Projects Management
- [ ] Create `projects` table
  - [ ] id (UUID, primary key)
  - [ ] project_code (unique identifier for referral links)
  - [ ] name, location, description
  - [ ] developer_id (foreign key)
  - [ ] status (active, inactive, completed)
  - [ ] plot_value_range (min, max)
  - [ ] launch_date, completion_date
  - [ ] created_at, updated_at timestamps
  - [ ] Add indexes on project_code, developer_id, status

#### Referrals Management
- [ ] Create `referrals` table
  - [ ] id (UUID, primary key)
  - [ ] advocate_id (foreign key to advocates)
  - [ ] project_id (target project)
  - [ ] referral_code (UUID-based)
  - [ ] first_touch_timestamp
  - [ ] last_touch_timestamp
  - [ ] last_touch_advocate_id (for last-touch attribution)
  - [ ] status (pending, qualified, converted, rejected)
  - [ ] created_at, updated_at timestamps
  - [ ] Add indexes on advocate_id, referral_code, status, project_id

#### Leads Management
- [ ] Create `leads` table
  - [ ] id (UUID, primary key)
  - [ ] referral_id (foreign key)
  - [ ] first_name, last_name, email, phone
  - [ ] budget_range
  - [ ] source_channel (web, whatsapp, sms, email, qr)
  - [ ] capture_timestamp
  - [ ] created_at, updated_at timestamps
  - [ ] Add indexes on referral_id, email, phone

#### Rewards Management
- [ ] Create `rewards` table
  - [ ] id (UUID, primary key)
  - [ ] referral_id (foreign key)
  - [ ] advocate_id (foreign key)
  - [ ] plot_value
  - [ ] reward_amount
  - [ ] status (pending, approved, paid)
  - [ ] payout_date
  - [ ] created_at, updated_at timestamps
  - [ ] Add indexes on advocate_id, status, payout_date

#### Attribution Tracking
- [ ] Create `attribution_logs` table
  - [ ] id (UUID, primary key)
  - [ ] referral_id (foreign key)
  - [ ] touch_type (first_touch, last_touch)
  - [ ] advocate_id (foreign key)
  - [ ] timestamp
  - [ ] channel (web, link, qr, etc.)

#### CRM Sync Logs
- [ ] Create `crm_sync_logs` table
  - [ ] id (UUID, primary key)
  - [ ] referral_id (foreign key)
  - [ ] crm_type (salesforce, hubspot, zoho, custom)
  - [ ] sync_status (success, failed, pending)
  - [ ] error_message
  - [ ] sync_timestamp
  - [ ] Add indexes on referral_id, crm_type, sync_status

#### Audit Logs
- [ ] Create `audit_logs` table
  - [ ] id (UUID, primary key)
  - [ ] user_id (foreign key)
  - [ ] action (create, update, delete, override)
  - [ ] entity_type (advocate, referral, reward)
  - [ ] entity_id
  - [ ] old_values, new_values (JSON)
  - [ ] timestamp
  - [ ] Add indexes on user_id, entity_type, timestamp

---

### Referral Engine API

#### Advocate Type Validation Endpoint
- [ ] **POST** `/api/advocates/validate`
  - [ ] Validate user eligibility for selected type
  - [ ] Check if customer exists in system
  - [ ] Verify developer matching (no cross-developer)
  - [ ] Validate project ownership for Project Advocate
  - [ ] Return validation result with error details
  - [ ] Log validation attempts for audit

#### Advocate Registration/Creation
- [ ] **POST** `/api/advocates/register`
  - [ ] Create advocate record in database
  - [ ] Set advocate type based on ownership
  - [ ] Mark eligibility as verified
  - [ ] Generate initial referral quota (if applicable)
  - [ ] Send welcome notification

#### UUID-Based Referral Link Generation
- [ ] **POST** `/api/referrals/generate-link`
  - [ ] Generate UUID for referral
  - [ ] Create referral record with first-touch timestamp
  - [ ] Generate URL format: `PROJECTCODE-UUID`
  - [ ] Return full shareable link
  - [ ] Log link generation for attribution

#### Referral Link Resolution
- [ ] **GET** `/api/referrals/link/:referralCode`
  - [ ] Resolve referral code to referral record
  - [ ] Validate link expiration (if applicable)
  - [ ] Track access (channel, timestamp)
  - [ ] Update last-touch attribution
  - [ ] Return referral details

#### QR Code Generation API
- [ ] **POST** `/api/qr/generate`
  - [ ] Generate QR code image from referral link
  - [ ] Store QR code URL/file path
  - [ ] Support multiple formats (PNG, SVG, PDF)
  - [ ] Return downloadable QR code
  - [ ] Track QR code scans

#### Lead Capture Submission
- [ ] **POST** `/api/leads/submit`
  - [ ] Validate referral code exists
  - [ ] Capture lead information (name, email, phone, budget)
  - [ ] Validate required fields
  - [ ] Capture source channel information
  - [ ] Create lead record in database
  - [ ] Link to referral (update last-touch)
  - [ ] Send confirmation to advocate
  - [ ] Trigger CRM webhook (if configured)
  - [ ] Return lead submission confirmation

#### Lead Details Retrieval
- [ ] **GET** `/api/leads/:leadId`
  - [ ] Fetch lead details by ID
  - [ ] Include associated referral info
  - [ ] Check user authorization
  - [ ] Return lead timeline

---

### Attribution Tracking Service

#### First-Touch Attribution
- [ ] **Service:** AttributionService.recordFirstTouch()
  - [ ] Record initial advocate-lead connection
  - [ ] Timestamp first touch
  - [ ] Store channel information
  - [ ] Create attribution log entry
  - [ ] Prevent overwriting existing first-touch

#### Last-Touch Attribution
- [ ] **Service:** AttributionService.recordLastTouch()
  - [ ] Record final touchpoint before conversion
  - [ ] Update last-touch timestamp
  - [ ] Track last-touch advocate
  - [ ] Create attribution log entry
  - [ ] Support multiple touches per referral

#### Attribution Report Service
- [ ] **GET** `/api/attribution/report/:referralId`
  - [ ] Return complete attribution timeline
  - [ ] Show first-touch details
  - [ ] Show last-touch details
  - [ ] Display all touches in chronological order
  - [ ] Include channel information

---

### Reward Calculation Engine

#### Tiered Reward Calculation
- [ ] **Service:** RewardService.calculateReward(plotValue)
  - [ ] Implement tier logic:
    - ₹50L–₹1Cr: ₹25,000
    - ₹1Cr–₹1.5Cr: ₹35,000
    - ₹1.5Cr+: ₹50,000
  - [ ] Support configurable tiers per project
  - [ ] Return reward amount

#### Reward Eligibility Check
- [ ] **Service:** RewardService.checkEligibility(referralId)
  - [ ] Verify referral converted
  - [ ] Check advocate eligibility
  - [ ] Validate no duplicate rewards
  - [ ] Check reward payout timeline (30 days)

#### Reward Creation & Tracking
- [ ] **POST** `/api/rewards/create`
  - [ ] Create reward record
  - [ ] Calculate reward amount
  - [ ] Set initial status (pending)
  - [ ] Schedule payout timeline
  - [ ] Create audit log entry

#### Reward Status API
- [ ] **GET** `/api/rewards/:rewardId`
  - [ ] Fetch reward details
  - [ ] Check current status
  - [ ] Display payout information
  - [ ] Show calculation breakdown

#### Bulk Reward Calculation
- [ ] **POST** `/api/rewards/calculate-batch`
  - [ ] Process converted referrals in batch
  - [ ] Calculate rewards for multiple referrals
  - [ ] Mark rewards as approved
  - [ ] Generate payout batch

---

### Homeowner Portal APIs

#### Advocate Dashboard Data
- [ ] **GET** `/api/advocates/:advocateId/dashboard`
  - [ ] Return advocate profile
  - [ ] Show advocate type & eligibility
  - [ ] Return quick stats (active referrals, pending rewards)
  - [ ] Display recent activity
  - [ ] Check authorization

#### Project-Specific Referral Links
- [ ] **GET** `/api/advocates/:advocateId/projects`
  - [ ] List all eligible projects for advocate
  - [ ] Return existing referral links per project
  - [ ] Support regenerating links
  - [ ] Show project details

#### Referral Status Tracking
- [ ] **GET** `/api/advocates/:advocateId/referrals`
  - [ ] List all referrals for advocate
  - [ ] Filter by status (pending, converted, rejected)
  - [ ] Filter by project
  - [ ] Support pagination & sorting
  - [ ] Include referral timeline data

#### Referral Detail View
- [ ] **GET** `/api/referrals/:referralId`
  - [ ] Return complete referral information
  - [ ] Show lead details (if converted)
  - [ ] Display attribution timeline
  - [ ] Show associated reward
  - [ ] Verify advocate access rights

#### Reward Eligibility Display
- [ ] **GET** `/api/advocates/:advocateId/reward-eligibility`
  - [ ] Return eligibility criteria
  - [ ] List pending & paid rewards
  - [ ] Show calculation details
  - [ ] Display expected payout dates
  - [ ] Include reward history

#### Document Repository API
- [ ] **GET** `/api/documents/:projectId`
  - [ ] List available documents for project
  - [ ] Filter by document type
  - [ ] Return download URLs
  - [ ] Track document views
- [ ] **GET** `/api/documents/:documentId/download`
  - [ ] Stream document file
  - [ ] Log download activity
  - [ ] Track usage metrics

#### Multi-Channel Sharing Tracking
- [ ] **POST** `/api/share/track`
  - [ ] Track WhatsApp shares
  - [ ] Track SMS shares
  - [ ] Track Email shares
  - [ ] Log share timestamp & channel
- [ ] **GET** `/api/share/analytics/:referralId`
  - [ ] Get share statistics
  - [ ] Show clicks per channel
  - [ ] Display conversion by channel

---

### Admin Panel APIs

#### Advocate Management
- [ ] **GET** `/api/admin/advocates`
  - [ ] List all advocates with filtering
  - [ ] Filter by type (Project/Brand)
  - [ ] Filter by project/developer
  - [ ] Support pagination & search
  - [ ] Include conversion metrics
- [ ] **GET** `/api/admin/advocates/:advocateId`
  - [ ] Return detailed advocate profile
  - [ ] Show referral history
  - [ ] Display reward metrics
- [ ] **PUT** `/api/admin/advocates/:advocateId`
  - [ ] Update advocate details
  - [ ] Modify advocate type (with validation)
  - [ ] Update verification status
  - [ ] Log changes in audit trail
- [ ] **DELETE** `/api/admin/advocates/:advocateId`
  - [ ] Deactivate advocate account
  - [ ] Preserve historical data
  - [ ] Log deletion in audit trail

#### Referral Pipeline Aggregation
- [ ] **GET** `/api/admin/pipeline`
  - [ ] Return referrals grouped by stage
  - [ ] Filter by advocate type
  - [ ] Filter by project/date range
  - [ ] Include stage counts
  - [ ] Calculate conversion rates by stage
- [ ] **PUT** `/api/admin/referrals/:referralId/status`
  - [ ] Update referral status
  - [ ] Create status change audit log
  - [ ] Trigger reward calculation if converted

#### Cross-Project Analytics
- [ ] **GET** `/api/admin/analytics/overview`
  - [ ] Return KPI metrics:
    - [ ] Total advocates (Project & Brand breakdown)
    - [ ] Active referrals
    - [ ] Conversion rates
    - [ ] Rewards paid
- [ ] **GET** `/api/admin/analytics/by-advocate-type`
  - [ ] Return metrics grouped by advocate type
  - [ ] Conversion rate comparison
  - [ ] Reward comparison
- [ ] **GET** `/api/admin/analytics/by-project`
  - [ ] Return metrics per project
  - [ ] Advocate count per project
  - [ ] Conversion rate per project
  - [ ] Rewards paid per project
- [ ] **GET** `/api/admin/analytics/trends`
  - [ ] Return time-series data
  - [ ] Active referrals trend
  - [ ] Conversions trend
  - [ ] Rewards paid trend

#### Validation Override
- [ ] **GET** `/api/admin/validation-overrides`
  - [ ] List pending validation requests
  - [ ] Show override history
- [ ] **POST** `/api/admin/validation-overrides`
  - [ ] Create override for invalid advocate
  - [ ] Provide override justification
  - [ ] Log in audit trail
  - [ ] Send notification to advocate

#### Bulk Advocate Import
- [ ] **POST** `/api/admin/advocates/import`
  - [ ] Accept CSV file upload
  - [ ] Validate CSV format
  - [ ] Validate advocate data
  - [ ] Return validation errors/warnings
  - [ ] Support dry-run mode
  - [ ] Batch import valid records
  - [ ] Log import activity
- [ ] **GET** `/api/admin/advocates/import-history`
  - [ ] Return import logs with details

#### CSV Export Generation
- [ ] **POST** `/api/admin/exports/advocates`
  - [ ] Generate CSV of advocates
  - [ ] Support filtering options
  - [ ] Include custom field selection
  - [ ] Return download URL
- [ ] **POST** `/api/admin/exports/referrals`
  - [ ] Generate CSV of referrals
  - [ ] Include lead details
  - [ ] Include reward information
- [ ] **POST** `/api/admin/exports/rewards`
  - [ ] Generate CSV of rewards
  - [ ] Include payout information

---

## 📋 Phase 2: CRM Integration

### Webhook System

#### Webhook Registration
- [ ] **POST** `/api/admin/webhooks`
  - [ ] Configure webhook endpoints
  - [ ] Select events to trigger on
  - [ ] Set authentication method
  - [ ] Enable/disable webhooks

#### Advocate-Type Aware Webhooks
- [ ] **Service:** WebhookService
  - [ ] Send advocate type in payload
  - [ ] Include source project info
  - [ ] Include sales context (fellow resident / existing customer)
  - [ ] Track webhook delivery status

#### Webhook Event Logging
- [ ] **POST** `/api/webhooks/log`
  - [ ] Log webhook delivery attempts
  - [ ] Store request/response data
  - [ ] Track success/failure
  - [ ] Store retry attempts

#### Webhook Retry Mechanism
- [ ] **Service:** WebhookRetryService
  - [ ] Implement exponential backoff
  - [ ] Configure retry limits
  - [ ] Support manual retry from admin
  - [ ] Alert on repeated failures

---

### CRM Sync Service

#### Bidirectional Sync
- [ ] **Service:** CRMSyncService
  - [ ] Push referral data to CRM
  - [ ] Poll CRM for lead status updates
  - [ ] Update local referral status from CRM
  - [ ] Handle sync conflicts
  - [ ] Log all sync operations

#### Salesforce Integration
- [ ] **Service:** SalesforceConnector
  - [ ] OAuth2 authentication
  - [ ] Token refresh mechanism
  - [ ] Push referrals to Salesforce Leads
  - [ ] Track lead status changes
  - [ ] Map advocate type fields
  - [ ] Handle custom field mapping
- [ ] **POST** `/api/crm/salesforce/sync`
  - [ ] Trigger manual sync

#### HubSpot Integration
- [ ] **Service:** HubSpotConnector
  - [ ] API key authentication
  - [ ] Push referrals to HubSpot Contacts
  - [ ] Track contact activity
  - [ ] Map advocate fields
  - [ ] Support custom properties
- [ ] **POST** `/api/crm/hubspot/sync`
  - [ ] Trigger manual sync

#### Zoho CRM Integration
- [ ] **Service:** ZohoCRMConnector
  - [ ] OAuth2 authentication
  - [ ] Push referrals to Zoho Leads
  - [ ] Track lead conversions
  - [ ] Field mapping support
  - [ ] Handle bulk operations
- [ ] **POST** `/api/crm/zoho/sync`
  - [ ] Trigger manual sync

#### Custom CRM Support
- [ ] **Service:** CustomCRMConnector
  - [ ] Flexible webhook-based integration
  - [ ] Support custom field mapping
  - [ ] Configurable field values
  - [ ] Custom authentication methods

---

### Field Mapping Engine

#### Field Mapping Configuration
- [ ] **POST** `/api/admin/crm/field-mapping`
  - [ ] Configure source-to-CRM field mapping
  - [ ] Support standard fields
  - [ ] Support custom fields
  - [ ] Store mapping configuration
- [ ] **GET** `/api/admin/crm/field-mapping/:crmType`
  - [ ] Return current field mapping
  - [ ] Show available CRM fields

#### Data Transformation
- [ ] **Service:** FieldMappingService.transformData()
  - [ ] Transform BuiltCred data to CRM format
  - [ ] Handle data type conversions
  - [ ] Support value mapping (enums)
  - [ ] Validate required fields

---

### CRM Health & Monitoring

#### Connection Status
- [ ] **GET** `/api/admin/crm/status`
  - [ ] Check CRM connection status
  - [ ] Return last sync timestamp
  - [ ] Show error logs
  - [ ] Display webhook success rate

#### Sync Error Handling
- [ ] **Service:** CRMErrorHandler
  - [ ] Categorize sync errors
  - [ ] Log errors with context
  - [ ] Implement retry strategies
  - [ ] Alert admin on critical errors

#### CRM Integration Logs
- [ ] **GET** `/api/admin/crm/logs`
  - [ ] Return CRM sync logs
  - [ ] Filter by CRM type/date
  - [ ] Show success/failure status
  - [ ] Include error details

---

## 📋 Phase 3: Advocate Validation & Auto-Correction

### Core Validation Engine

#### Advocate Validation Function
- [ ] **Service:** AdvocateValidationService.validate()
  - [ ] Check customer exists
  - [ ] Verify developer matching
  - [ ] Validate project advocate owns target project
  - [ ] Check brand advocate eligibility
  - [ ] Return validation result

#### Auto-Correction Logic
- [ ] **Service:** AdvocateValidationService.autoCorrect()
  - [ ] Detect invalid type selection
  - [ ] Auto-correct Project Advocate selecting own project
  - [ ] Suggest correct advocate type
  - [ ] Log auto-correction for audit
  - [ ] Notify advocate of correction

#### Validation Error Messages
- [ ] Create standardized error messages:
  - [ ] Customer not found
  - [ ] Cross-developer referral not allowed
  - [ ] Project Advocate must own target project
  - [ ] Brand Advocate cannot refer own project

#### Validation Audit Logging
- [ ] **Service:** ValidationAuditService
  - [ ] Log all validation attempts
  - [ ] Track validation failures
  - [ ] Log auto-corrections
  - [ ] Store validation context

---

## 📋 Phase 4: Security & Authentication

### User Authentication

#### JWT-Based Authentication
- [ ] **POST** `/api/auth/login`
  - [ ] Accept email & password
  - [ ] Verify credentials
  - [ ] Generate JWT token
  - [ ] Return token & refresh token
- [ ] **POST** `/api/auth/refresh`
  - [ ] Accept refresh token
  - [ ] Generate new access token
  - [ ] Invalidate old token

#### Password Management
- [ ] **POST** `/api/auth/forgot-password`
  - [ ] Accept email address
  - [ ] Generate password reset token
  - [ ] Send reset link via email
- [ ] **POST** `/api/auth/reset-password`
  - [ ] Validate reset token
  - [ ] Update password
  - [ ] Invalidate old tokens

#### User Logout
- [ ] **POST** `/api/auth/logout`
  - [ ] Invalidate JWT token
  - [ ] Clear refresh token
  - [ ] Log logout activity

---

### Role-Based Access Control

#### User Roles & Permissions
- [ ] **Service:** RBACService
  - [ ] Define roles (Admin, Advocate, Support)
  - [ ] Define permissions per role
  - [ ] Check permissions before API access
  - [ ] Store role assignments

#### Role-Based API Middleware
- [ ] **Middleware:** RequireRole()
  - [ ] Verify user role
  - [ ] Check resource ownership
  - [ ] Enforce advocate-specific access controls
  - [ ] Prevent cross-advocate data access

---

### Data Protection

#### Input Validation & Sanitization
- [ ] **Service:** InputValidationService
  - [ ] Validate all incoming data
  - [ ] Sanitize string inputs
  - [ ] Prevent SQL injection
  - [ ] Prevent XSS attacks

#### Data Encryption
- [ ] Encrypt sensitive fields:
  - [ ] Email addresses (at rest)
  - [ ] Phone numbers
  - [ ] Bank account details
  - [ ] API keys
- [ ] Implement field-level encryption in database

#### Rate Limiting
- [ ] **Middleware:** RateLimiter()
  - [ ] Limit requests per IP
  - [ ] Limit requests per user
  - [ ] Configurable per endpoint
  - [ ] Return 429 Too Many Requests

#### HTTPS & TLS
- [ ] Enforce HTTPS on all endpoints
- [ ] Configure TLS 1.2+
- [ ] Implement HSTS headers

---

### Audit & Compliance

#### Comprehensive Audit Logging
- [ ] **Service:** AuditLogger
  - [ ] Log all data modifications
  - [ ] Include user, timestamp, old/new values
  - [ ] Store in audit_logs table
  - [ ] Preserve audit logs long-term

#### Access Logging
- [ ] **Middleware:** AccessLogger()
  - [ ] Log all API requests
  - [ ] Include user, endpoint, timestamp, IP
  - [ ] Track response status
  - [ ] Monitor unusual access patterns

---

## 📋 Phase 5: Analytics & Reporting

### Analytics Aggregation

#### Advocate Distribution Analytics
- [ ] **Service:** AnalyticsService.getAdvocateDistribution()
  - [ ] Count advocates by type
  - [ ] Calculate conversion rate per type
  - [ ] Return distribution metrics

#### Referral Pipeline Analytics
- [ ] **Service:** AnalyticsService.getPipelineMetrics()
  - [ ] Count referrals by stage
  - [ ] Calculate conversion rates
  - [ ] Track stage progression time

#### Reward Analytics
- [ ] **Service:** AnalyticsService.getRewardMetrics()
  - [ ] Calculate total rewards paid
  - [ ] Calculate average reward per referral
  - [ ] Track pending vs paid rewards

#### Trend Analysis
- [ ] **Service:** AnalyticsService.getTrends()
  - [ ] Calculate active referrals trend
  - [ ] Calculate conversion trend
  - [ ] Calculate rewards trend over time

---

### Report Generation

#### Scheduled Reports
- [ ] **Service:** ReportSchedulerService
  - [ ] Generate daily summary reports
  - [ ] Generate weekly performance reports
  - [ ] Generate monthly executive reports
  - [ ] Send to admin email

#### On-Demand Exports
- [ ] **Service:** ExportService
  - [ ] Generate CSV exports
  - [ ] Support custom filters
  - [ ] Include custom fields
  - [ ] Return downloadable file

---

## 📋 Phase 6: Testing & Quality Assurance

### Unit Tests

#### Validation Logic Tests
- [ ] Test advocate type validation
- [ ] Test auto-correction logic
- [ ] Test cross-developer prevention
- [ ] Test project advocate restrictions
- [ ] Test brand advocate eligibility

#### Reward Calculation Tests
- [ ] Test tier 1 reward (₹50L–₹1Cr)
- [ ] Test tier 2 reward (₹1Cr–₹1.5Cr)
- [ ] Test tier 3 reward (₹1.5Cr+)
- [ ] Test edge cases (boundary values)

#### Attribution Logic Tests
- [ ] Test first-touch recording
- [ ] Test last-touch recording
- [ ] Test multiple touches
- [ ] Test attribution by channel

#### API Endpoint Tests
- [ ] Test all referral endpoints
- [ ] Test all advocate endpoints
- [ ] Test all reward endpoints
- [ ] Test error handling

---

### Integration Tests

#### CRM Integration Tests
- [ ] Test Salesforce sync
- [ ] Test HubSpot sync
- [ ] Test Zoho sync
- [ ] Test webhook delivery
- [ ] Test error scenarios

#### Database Integration Tests
- [ ] Test data persistence
- [ ] Test transaction handling
- [ ] Test data consistency
- [ ] Test concurrent operations

#### Auth & Security Tests
- [ ] Test JWT authentication
- [ ] Test role-based access
- [ ] Test data encryption
- [ ] Test input validation

---

### End-to-End Tests

#### User Workflows
- [ ] Test complete referral flow
- [ ] Test advocate registration
- [ ] Test lead capture
- [ ] Test reward calculation
- [ ] Test CRM sync workflow

#### Admin Workflows
- [ ] Test bulk import
- [ ] Test CSV export
- [ ] Test validation override
- [ ] Test analytics queries

---

### Performance Tests

#### Load Testing
- [ ] Test API under 1000 concurrent users
- [ ] Test database query performance
- [ ] Test CRM sync at scale
- [ ] Identify bottlenecks

#### Stress Testing
- [ ] Test API limits
- [ ] Test database connection limits
- [ ] Test file upload limits
- [ ] Test rate limiting

---

### Security Testing

#### OWASP Top 10
- [ ] Test for SQL injection
- [ ] Test for XSS attacks
- [ ] Test for CSRF attacks
- [ ] Test for authentication bypass
- [ ] Test for authorization bypass

#### Data Protection Tests
- [ ] Test encryption at rest
- [ ] Test encryption in transit
- [ ] Test PII data protection
- [ ] Test access control

---

## 📋 Phase 7: Deployment & DevOps

### Infrastructure Setup

#### Development Environment
- [ ] Set up local development database
- [ ] Configure environment variables
- [ ] Set up API documentation
- [ ] Configure logging system

#### Staging Environment
- [ ] Set up staging database
- [ ] Configure staging domain
- [ ] Set up staging CRM connections
- [ ] Configure backup strategy

#### Production Environment
- [ ] Set up production database (replicated)
- [ ] Configure production domain
- [ ] Set up CDN for static assets
- [ ] Configure DDoS protection

---

### CI/CD Pipeline

#### Build Automation
- [ ] Set up build pipeline (GitHub Actions/GitLab CI)
- [ ] Run automated tests on push
- [ ] Build Docker image on merge
- [ ] Generate build artifacts

#### Deployment Automation
- [ ] Deploy to staging on test success
- [ ] Deploy to production on release
- [ ] Run database migrations automatically
- [ ] Rollback capability

#### Code Quality Checks
- [ ] Run linting on all commits
- [ ] Run static analysis
- [ ] Check code coverage (target >80%)
- [ ] Run security scanning

---

### Monitoring & Logging

#### Application Monitoring
- [ ] Set up application performance monitoring (APM)
- [ ] Monitor API response times
- [ ] Monitor database query performance
- [ ] Alert on slow endpoints

#### Error Tracking
- [ ] Set up error tracking (Sentry)
- [ ] Track all exceptions
- [ ] Group similar errors
- [ ] Alert on critical errors

#### Log Aggregation
- [ ] Set up centralized logging (ELK Stack)
- [ ] Collect application logs
- [ ] Collect access logs
- [ ] Collect security logs
- [ ] Set up log retention policies

#### Health Checks
- [ ] **GET** `/health`
  - [ ] Check API availability
  - [ ] Check database connection
  - [ ] Check CRM connections
  - [ ] Return health status

---

### Backup & Disaster Recovery

#### Database Backups
- [ ] Implement hourly incremental backups
- [ ] Implement daily full backups
- [ ] Test backup restoration weekly
- [ ] Store offsite backups

#### Disaster Recovery Plan
- [ ] Document recovery procedures
- [ ] Test failover mechanisms
- [ ] Establish RTO (Recovery Time Objective)
- [ ] Establish RPO (Recovery Point Objective)

---

## 🎯 Progress Tracking

| Phase | Status | Target Completion |
|-------|--------|------------------|
| Phase 1: Database Schema | Not Started | TBD |
| Phase 1: Core APIs | Not Started | TBD |
| Phase 2: CRM Integration | Not Started | TBD |
| Phase 3: Validation | Not Started | TBD |
| Phase 4: Security & Auth | Not Started | TBD |
| Phase 5: Analytics | Not Started | TBD |
| Phase 6: Testing | Not Started | TBD |
| Phase 7: DevOps & Deployment | Not Started | TBD |
```

You can copy this content and paste it into the backend-main.md file. The backend to-do list covers:

- **Phase 1:** Database schema design and core APIs (referral engine, homeowner portal, admin panel)
- **Phase 2:** CRM integration (Salesforce, HubSpot, Zoho, custom)
- **Phase 3:** Advocate validation and auto-correction
- **Phase 4:** Security, authentication, and RBAC
- **Phase 5:** Analytics and reporting
- **Phase 6:** Comprehensive testing (unit, integration, e2e, performance, security)
- **Phase 7:** DevOps, CI/CD, monitoring, and disaster recovery