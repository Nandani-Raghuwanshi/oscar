# BuiltCred Referral System – To-Do List

## 📋 Phase 1: MVP Core Features

### Frontend Tasks

#### 1. Referral Engine UI
- [ ] Create advocate type selection component
- [ ] Build UUID-based referral link generator
- [ ] Implement QR code generation & download feature
- [ ] Design lead capture form with validation
- [ ] Add attribution tracking dashboard (first-touch & last-touch)
- [ ] Create tiered reward display component

#### 2. Homeowner Portal
- [ ] Build advocate-type dashboard with responsive design
- [ ] Create project-specific referral links page
- [ ] Implement referral status tracking UI
- [ ] Design reward eligibility display
- [ ] Build multi-channel sharing buttons (WhatsApp, SMS, Email)
- [ ] Create document repository/download interface
- [ ] Add referral statistics visualization

#### 3. Admin Panel
- [ ] Create advocate-type filtering interface
- [ ] Build referral pipeline view by advocate type
- [ ] Implement cross-project analytics dashboard
- [ ] Add validation override controls
- [ ] Create bulk advocate import UI
- [ ] Build CSV export functionality
- [ ] Design responsive admin layout

### Backend Tasks

#### 1. Referral Engine API
- [ ] Create advocate type validation endpoint
- [ ] Build UUID-based referral link generation service
- [ ] Implement QR code generation API
- [ ] Create lead capture submission endpoint
- [ ] Build attribution tracking database schema
- [ ] Implement first-touch attribution logic
- [ ] Implement last-touch attribution logic
- [ ] Create tiered reward calculation engine

#### 2. Homeowner Portal API
- [ ] Build advocate dashboard data endpoint
- [ ] Create project-specific referral links endpoint
- [ ] Implement referral status tracking endpoint
- [ ] Build reward eligibility API
- [ ] Create document repository management API
- [ ] Implement multi-channel sharing tracking endpoints

#### 3. Admin Panel API
- [ ] Create advocate filtering endpoint
- [ ] Build referral pipeline aggregation queries
- [ ] Implement cross-project analytics endpoints
- [ ] Create validation override endpoints
- [ ] Build bulk advocate import API with validation
- [ ] Implement CSV export generation service
- [ ] Create admin authentication & authorization

#### 4. Database Schema
- [ ] Design advocates table (project & brand advocates)
- [ ] Create referrals table with attribution fields
- [ ] Build projects table with developer mapping
- [ ] Create leads table with capture details
- [ ] Build rewards table with calculation tracking
- [ ] Create CRM sync logs table

---

## 📋 Phase 2: CRM Integration

### Frontend Tasks
- [ ] Build CRM settings/configuration UI
- [ ] Create CRM connection status indicator
- [ ] Implement field mapping visual editor
- [ ] Build webhook event log viewer
- [ ] Create CRM sync error handling UI

### Backend Tasks
- [ ] Implement advocate-type aware webhooks
- [ ] Build bidirectional API sync service
- [ ] Create field mapping engine (standard + custom)
- [ ] Implement validation error handling for CRM data
- [ ] Add multi-CRM support framework
- [ ] Create CRM authentication & token management
- [ ] Build webhook retry mechanism
- [ ] Implement CRM data reconciliation

#### Supported CRMs
- [ ] Salesforce integration
- [ ] HubSpot integration
- [ ] Zoho CRM integration
- [ ] Custom CRM API framework

---

## 📋 Phase 3: Advocate Validation & Auto-Correction

### Backend Tasks
- [ ] Implement advocate validation function
  - [ ] Verify customer exists
  - [ ] Validate developer matching (no cross-developer referrals)
  - [ ] Validate project advocate owns target project
  - [ ] Implement brand advocate project eligibility
- [ ] Build auto-correction logic for invalid selections
- [ ] Create validation error messages
- [ ] Implement validation audit logging

### Frontend Tasks
- [ ] Display validation errors to users
- [ ] Show auto-correction notifications
- [ ] Create guidance messages for advocate types

---

## 📋 Phase 4: Analytics & Reporting

### Frontend Tasks
- [ ] Build advocate distribution charts
- [ ] Create conversion rate analytics by advocate type
- [ ] Implement rewards paid dashboard
- [ ] Build active referrals trend chart
- [ ] Create report generation UI

### Backend Tasks
- [ ] Create advocate distribution aggregation queries
- [ ] Build conversion rate calculation endpoints
- [ ] Implement rewards paid tracking queries
- [ ] Create active referrals trend endpoints
- [ ] Build report generation & export service

---

## 📋 Phase 5: Security & Compliance

### Backend Tasks
- [ ] Implement cross-developer referral prevention
- [ ] Build customer data access controls
- [ ] Create audit logging for all referral operations
- [ ] Implement role-based access control (RBAC)
- [ ] Add input validation & sanitization
- [ ] Implement rate limiting on API endpoints
- [ ] Create data encryption for sensitive fields

### Frontend Tasks
- [ ] Implement secure token storage
- [ ] Add XSS protection measures
- [ ] Create CSRF token handling
- [ ] Build secure form submission
- [ ] Implement logout & session management

---

## 📋 Phase 6: Advanced Features (Roadmap)

- [ ] Implement differential rewards by advocate type
- [ ] Build advanced fraud detection system
- [ ] Create broker-assisted referral program
- [ ] Implement in-app wallet system
- [ ] Build payout tracking & management
- [ ] Create automated payout processing

---

## 📋 DevOps & Infrastructure

### Setup & Configuration
- [ ] Set up development environment
- [ ] Configure CI/CD pipeline
- [ ] Set up staging environment
- [ ] Configure production environment
- [ ] Implement database backups & recovery
- [ ] Set up monitoring & alerting

### Testing
- [ ] Write unit tests for validation logic
- [ ] Create integration tests for APIs
- [ ] Build e2e tests for user workflows
- [ ] Create performance tests for large datasets
- [ ] Implement load testing

### Documentation
- [ ] Write API documentation
- [ ] Create user guides for advocates
- [ ] Write admin guide
- [ ] Create CRM integration documentation
- [ ] Document validation logic
- [ ] Write deployment guides

---

## 🎯 Progress Tracking

| Phase | Status | Target Completion |
|-------|--------|------------------|
| Phase 1: MVP Core | Not Started | TBD |
| Phase 2: CRM Integration | Not Started | TBD |
| Phase 3: Validation | Not Started | TBD |
| Phase 4: Analytics | Not Started | TBD |
| Phase 5: Security | Not Started | TBD |
| Phase 6: Advanced | Not Started | TBD |
| DevOps & Testing | Not Started | TBD |
