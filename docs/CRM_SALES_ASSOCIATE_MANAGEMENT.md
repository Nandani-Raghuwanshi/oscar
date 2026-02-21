# CRM Sales Associate Management

## Overview
This document describes the sales associate role and the referral assignment functionality available to CRM managers.

## Sales Associate Role

### Purpose
Sales associates are responsible for:
- Following up on assigned referrals
- Converting leads into customers
- Logging call activities
- Updating lead status through the pipeline

### Permissions
Sales associates have the following permissions:
- `initiate_calls` - Make and log calls with leads
- `engage_customers` - Interact with customers
- `mark_status` - Update lead status in the pipeline
- `mark_payment` - Record payment information

## Creating Sales Associate Logins

### Prerequisites
- Must have **admin** role to create sales associate users

### Steps to Create Sales Associate

1. **Login as Admin**
   - Navigate to `/login`
   - Use admin credentials

2. **Access User Management**
   - Go to Admin Dashboard
   - Click on "Users" or "User Management"

3. **Create New User**
   - Click "Create User" or "Add User" button
   - Fill in the following required fields:
     - **First Name**: Sales associate's first name
     - **Last Name**: Sales associate's last name
     - **Email**: Valid email address (optional but recommended)
     - **Phone**: Phone number (required, must be unique)
     - **Password**: Initial password (user should change after first login)
     - **Role**: Select **"sales_associate"** from dropdown
     - **Active Status**: Set to "Active"

4. **Save User**
   - Click "Create" or "Save" button
   - The sales associate can now login using their phone number and password

### Bulk Import
Sales associates can also be created via CSV bulk import:
- Use the admin bulk import feature
- Ensure the CSV includes a `role` column with value `sales_associate`
- Follow the standard CSV import format

## Referral Assignment (CRM Manager)

### Overview
CRM managers can assign unassigned referrals to sales associates either manually or automatically.

### Accessing Assignment Feature

1. **Navigate to Referrals Page**
   - Login as CRM Manager
   - Go to `/crm/referrals`

2. **View Unassigned Referrals**
   - Unassigned referrals are marked with a purple "New" badge
   - Each unassigned referral has a checkbox

### Manual Assignment

#### Steps
1. **Select Referrals**
   - Check the boxes next to referrals you want to assign
   - OR click "Select All" to select all unassigned referrals

2. **Open Assignment Modal**
   - Click "Assign to Sales Associate" button in the blue action bar
   - The assignment modal will open

3. **Choose Manual Mode**
   - Select "Manual Assignment" option
   - A dropdown list of sales associates will appear

4. **Select Sales Associate**
   - Choose a sales associate from the dropdown
   - The dropdown shows each associate's current workload (active leads count)

5. **Confirm Assignment**
   - Click "Assign X Referral(s)" button
   - Selected referrals will be assigned to the chosen sales associate

### Auto-Split Assignment

#### Purpose
Automatically distribute referrals among all active sales associates using different strategies.

#### Strategies

1. **Round-Robin**
   - Distributes referrals evenly in rotation
   - Each sales associate gets one referral in sequence
   - Fair distribution regardless of current workload

2. **Load-Balanced**
   - Assigns referrals to associates with the fewest active leads
   - Balances workload across the team
   - Considers current active lead count

#### Steps
1. **Select Referrals**
   - Check boxes for referrals to auto-assign
   - Can use "Select All" for batch processing

2. **Open Assignment Modal**
   - Click "Assign to Sales Associate" button

3. **Choose Auto-Split Mode**
   - Select "Auto-Split" option

4. **Select Strategy**
   - Choose between:
     - **Round-Robin**: Even rotation distribution
     - **Load-Balanced**: Assigns to those with least workload

5. **Confirm Assignment**
   - Click "Assign X Referral(s)" button
   - System automatically distributes selected referrals

### Assignment Summary

When the modal opens, you'll see:
- **Available Sales Associates**: List of all active sales associates
- **Current Workload**: Number of active leads each associate has
- **Assignment Preview**: How many referrals will be assigned

### After Assignment

Once assigned:
- Referrals convert to leads with `assignedToId` field populated
- Sales associates can see their assigned leads
- "New" badge is removed from the referral
- Lead appears in the sales associate's pipeline

## API Endpoints

### Get Sales Associates
```
GET /api/crm/sales-associates
Authorization: Bearer <token>
```

Returns list of all active sales associates with their current workload.

### Assign Single Referral
```
PATCH /api/crm/referrals/:id/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "assignedToId": "<sales_associate_id>",
  "notes": "Optional assignment notes"
}
```

### Batch Assignment (Auto-Split)
```
POST /api/crm/referrals/batch-assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "referralIds": ["<referral_id_1>", "<referral_id_2>", ...],
  "assignmentStrategy": "round-robin" // or "load-balanced"
}
```

## Best Practices

### For CRM Managers

1. **Monitor Workload**
   - Regularly check sales associate workload
   - Use load-balanced strategy for fair distribution
   - Manually assign high-priority leads to experienced associates

2. **Assignment Timing**
   - Assign referrals promptly to maximize conversion
   - Use auto-split for bulk assignments
   - Use manual assignment for strategic lead allocation

3. **Team Management**
   - Ensure sales associates are marked as active
   - Deactivate users who are on leave
   - Create enough sales associates to handle referral volume

### For Sales Associates

1. **Check Assigned Leads**
   - Login regularly to check new assignments
   - View leads on the CRM Pipeline page
   - Prioritize new assignments

2. **Follow Up Promptly**
   - Contact assigned leads within 24 hours
   - Log all call activities
   - Update lead status regularly

3. **Update Lead Status**
   - Move leads through the pipeline
   - Mark outcomes (converted/lost)
   - Add notes for context

## Troubleshooting

### No Sales Associates Available
**Problem**: Cannot assign referrals - no sales associates found

**Solution**:
- Admin must create at least one sales associate user
- Ensure sales associates are marked as "Active"
- Verify role is set to `sales_associate`

### Assignment Not Showing
**Problem**: Sales associate doesn't see assigned leads

**Solution**:
- Check that the lead status is not "converted" or "lost"
- Verify assignment was successful
- Refresh the page
- Check filter settings on Pipeline page

### Checkbox Missing
**Problem**: Cannot select referral for assignment

**Possible Causes**:
- Referral is already assigned (no checkbox shown for assigned leads)
- User is not a CRM Manager
- Referral has been converted to lead by another process

## Related Documentation
- [BUILDER_CUSTOMER_ADVOCATE_LOGINS.md](./BUILDER_CUSTOMER_ADVOCATE_LOGINS.md) - User creation process
- [PHASE_4_PROJECT_ADVOCATES.md](./PHASE_4_PROJECT_ADVOCATES.md) - Advocate workflows
- [PHASE_5_BRAND_ADVOCATES.md](./PHASE_5_BRAND_ADVOCATES.md) - Brand advocate features
