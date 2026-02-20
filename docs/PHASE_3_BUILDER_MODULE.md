# Phase 3: Builder/Developer Module Setup

> **Status:** In Progress 🚀  
> **Started:** February 20, 2026

## Overview

Phase 3 focuses on implementing the Builder/Developer/Land-Owner module. Builders need to upload customer lists, send WhatsApp invites, track customer status, view reports, and receive escalation notifications.

## Key Features

### 1. Customer Management
- Upload customer lists (CSV/bulk import)
- Customer validation and preprocessing
- Store customer data with status tracking
- Customer search and filtering
- View customer details and interaction history

### 2. WhatsApp Integration
- Send invites to customers via WhatsApp
- Track delivery and read status
- Retry failed sends
- Bulk send with rate limiting
- Customize invite messages

### 3. Reporting & Analytics
- Conversion rate tracking
- Customer status breakdown
- Statistics dashboard
- Invite delivery statistics
- ROI metrics

### 4. Escalation Management
- View critical escalations list
- Receive real-time notifications
- Filter by status and priority
- Escalation history

## Backend Implementation

### Database Schema

#### Customer Model
```javascript
{
  _id: ObjectId,
  projectId: ObjectId,       // Reference to Project
  builderId: ObjectId,       // Reference to Builder User
  
  // Customer Info
  name: String,
  email: String,
  phone: String,             // E.164 format for WhatsApp
  
  // Status
  status: Enum[],            // 'active', 'inactive', 'converted', 'blacklist'
  inviteSentAt: Date,
  inviteDeliveredAt: Date,
  inviteReadAt: Date,
  
  // Referral Link
  referralCode: String,      // Unique code for tracking
  
  // Metadata
  source: String,            // 'csv_upload', 'manual', 'bulk_import'
  tags: [String],            // Custom tags for segmentation
  notes: String,
  
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date            // Soft delete
}
```

#### Escalation Model
```javascript
{
  _id: ObjectId,
  projectId: ObjectId,
  customerId: ObjectId,
  builderId: ObjectId,
  
  title: String,
  description: String,
  priority: Enum[],          // 'low', 'medium', 'high', 'critical'
  status: Enum[],            // 'open', 'in_progress', 'resolved', 'closed'
  
  createdAt: Date,
  updatedAt: Date,
  resolvedAt: Date
}
```

### API Endpoints

#### Customer Management
- `POST /builder/customers/upload` - Upload CSV file
- `POST /builder/customers/validate` - Validate customer data before import
- `POST /builder/customers` - Create single customer
- `GET /builder/customers` - List customers with filters
- `GET /builder/customers/:id` - Get customer details
- `PUT /builder/customers/:id` - Update customer
- `DELETE /builder/customers/:id` - Soft delete customer
- `POST /builder/customers/bulk-action` - Bulk operations

#### WhatsApp & Invites
- `POST /builder/invites/send` - Send invite to customer
- `POST /builder/invites/bulk-send` - Bulk send invites
- `GET /builder/invites/status/:id` - Check invite delivery status
- `GET /builder/invites/history` - Invite history and stats

#### Reports & Statistics
- `GET /builder/reports/dashboard` - Main dashboard stats
- `GET /builder/reports/conversion` - Conversion metrics
- `GET /builder/reports/invites` - Invite statistics
- `GET /builder/reports/customer-status` - Customer status breakdown
- `GET /builder/reports/export` - Export data (CSV/PDF)

#### Escalations
- `GET /builder/escalations` - List escalations
- `GET /builder/escalations/:id` - Get escalation details
- `POST /builder/escalations` - Create escalation
- `PUT /builder/escalations/:id` - Update escalation status

## Frontend Implementation

### Pages & Components

#### Pages
- `BuilderCustomersPage` - Customer list management
- `BuilderReportsPage` - Reports and analytics dashboard
- `BuilderEscalationsPage` - Escalation list and details

#### Components
- `CustomerUploadForm` - CSV upload with validation
- `CustomerTable` - Paginated customer list with filters
- `CustomerDetailModal` - Customer details and history
- `InviteSendModal` - Send WhatsApp invite interface
- `ReportsDashboard` - Stats and charts
- `EscalationList` - Critical escalations with filtering
- `NotificationCenter` - Real-time notifications

## Development Steps

### Step 1: Database Models
- [ ] Create Customer model
- [ ] Create Escalation model
- [ ] Add indexes for performance

### Step 2: Backend APIs
- [ ] Customer CRUD endpoints
- [ ] CSV upload and validation
- [ ] Customer filtering and search
- [ ] Basic reports endpoints
- [ ] Escalation endpoints

### Step 3: Frontend Pages
- [ ] Build customer management page
- [ ] Create reports dashboard
- [ ] Build escalations page
- [ ] Add notification system

### Step 4: Integration & Testing
- [ ] Connect frontend to backend
- [ ] Test file upload and validation
- [ ] Test customer filtering
- [ ] Integration tests

### Step 5: WhatsApp Integration (Deferred)
- [ ] Setup Gupshup API integration
- [ ] Create message sending service
- [ ] Implement delivery tracking
- [ ] Add retry logic

## Dependencies Added

### Backend
- `multer` - File upload handling (already added in Phase 2)
- `csv-parser` - CSV parsing
- `joi` - Data validation

### Frontend
- `react-csv` - CSV export
- `react-table` - Advanced table features
- `recharts` - Chart/graph visualization

## Success Criteria

✅ Customers can upload CSV file with validation  
✅ Customer list view with search and filters  
✅ Customer details available  
✅ Reports dashboard shows key metrics  
✅ Escalation list functional  
✅ Real-time notifications working  

## Timeline Estimate

- **Backend Models & APIs:** 2-3 days
- **Frontend Pages & Components:** 2-3 days
- **Testing & Integration:** 1-2 days
- **Total:** 5-8 days

---

**Next Steps:**  
1. Create Customer model
2. Generate Customer CRUD endpoints
3. Build CustomerUploadForm component
4. Create reports API endpoints
