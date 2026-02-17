# Backend Integration Guide

## Overview
Complete backend implementation for the admin dashboard with comprehensive MongoDB integration, data seeding, and API endpoints.

---

## Backend Features Implemented

### 1. **Admin Routes** (`/api/admin`)

#### 1.1 Analytics Endpoint
```
GET /api/admin/analytics
Response: Comprehensive system metrics
```
Returns:
- Total advocates count (project + brand split)
- Active referrals
- Conversions (MTD)
- Rewards paid
- Pipeline stages for each advocate type
- Conversion rates
- Average referrals per advocate

#### 1.2 Advocates Management
```
GET /api/admin/advocates?skip=0&limit=20&advocate_type=PROJECT_ADVOCATE&search=name
```
Returns:
- Advocate list with detailed statistics
- Referral count per advocate
- Conversion count per advocate
- Total rewards outstanding
- Supports search and filtering

#### 1.3 Referrals Management
```
GET /api/admin/referrals?skip=0&limit=20&status=CONVERTED&advocate_type=PROJECT_ADVOCATE
```
Returns:
- Complete referral list
- Lead information
- Status tracking
- Pipeline analytics

#### 1.4 Advocate Details
```
GET /api/admin/advocates/:advocate_id/details
```
Returns:
- Advocate profile information
- Performance statistics
- Recent referral history
- Rewards summary

#### 1.5 Rewards Analytics
```
GET /api/admin/rewards-analytics?skip=0&limit=20&status=PAID
```
Returns:
- Rewards distribution
- Pending vs paid amounts
- Advocate-wise reward breakdown
- Payment history

#### 1.6 Project Analytics
```
GET /api/admin/project-analytics
```
Returns:
- Project-wise metrics
- Advocate distribution per project
- Referral and conversion statistics
- Budget utilization

#### 1.7 Validation Override
```
POST /api/admin/validation/override
Request: {
    "advocate_id": "...",
    "new_type": "BRAND_ADVOCATE",
    "reason": "Manual override"
}
```
Allows admins to manually override advocate type classifications.

#### 1.8 Bulk Import
```
POST /api/admin/advocates/import
Request: {
    "advocates": [
        {
            "email": "advocate@example.com",
            "full_name": "Name",
            "phone": "9876543210",
            "advocate_type": "PROJECT_ADVOCATE",
            "project_name": "Oscar Sanctuary",
            "plot_number": "A-127"
        }
    ]
}
```
Bulk import advocates with validation and error handling.

---

### 2. **Project Routes** (`/api/projects`)

#### 2.1 List Projects
```
GET /api/projects?status=active&skip=0&limit=20
```
Returns:
- Project list with statistics
- Advocate counts
- Referral and conversion metrics
- Budget information

#### 2.2 Project Details
```
GET /api/projects/:project_id
```
Returns:
- Complete project information
- Advocate distribution
- Recent referrals
- Performance statistics

#### 2.3 Advocate Projects
```
GET /api/projects/advocate/:advocate_id
```
Returns:
- Projects accessible to advocate
- Based on advocate type
- Referral statistics for each project

---

## Data Models

### Users Collection
```javascript
{
    _id: ObjectId,
    email: "advocate@example.com",
    full_name: "Sunita Mehta",
    phone: "9876543210",
    password: "hashed",
    role: "advocate",
    advocate_type: "PROJECT_ADVOCATE" | "BRAND_ADVOCATE",
    project_name: "Oscar Sanctuary",
    plot_number: "A-127",
    status: "approved" | "pending" | "rejected",
    is_active: true,
    created_at: ISODate,
    approved_at: ISODate,
    approved_by: "admin_id"
}
```

### Referrals Collection
```javascript
{
    _id: ObjectId,
    advocate_id: "user_id",
    referrer_name: "Sunita Mehta",
    advocate_type: "PROJECT_ADVOCATE",
    source_project: "Oscar Sanctuary",
    target_project: "Oscar Sanctuary",
    lead_name: "Amit Kumar",
    lead_email: "lead@example.com",
    lead_phone: "9876543210",
    budget: 5000000,
    status: "NEW_LEAD" | "SITE_VISIT" | "IN_PROGRESS" | "CONVERTED",
    created_at: ISODate,
    converted_at: ISODate
}
```

### Rewards Collection
```javascript
{
    _id: ObjectId,
    advocate_id: "user_id",
    advocate_type: "PROJECT_ADVOCATE",
    referral_count: 12,
    conversion_count: 3,
    amount: 15000,
    status: "PAID" | "PENDING",
    created_at: ISODate,
    paid_at: ISODate
}
```

### Projects Collection
```javascript
{
    _id: ObjectId,
    name: "Oscar Sanctuary",
    location: "Bangalore",
    status: "active" | "completed",
    accepts_referrals: true,
    units: 150,
    total_budget: 50000000,
    description: "Project description",
    developer: "Oscar Developers",
    created_at: ISODate
}
```

---

## Database Seeding

### Quick Start

1. **Run seed script to populate sample data:**
```bash
cd server
python3 seed_admin_data.py
```

This will create:
- 3 projects (Oscar Sanctuary, Oscar Fort, Maple Heights)
- 187 project advocates
- 155 brand advocates
- Multiple referrals with realistic distributions
- Reward records
- Realistic conversion rates (16.9% for project, 19.6% for brand)

### Seed Data Statistics
- **Total Advocates**: 342 (187 project + 155 brand)
- **Active Referrals**: 456
- **Conversions**: 82+ (realistic distribution per advocate type)
- **Rewards**: ₹20+ lakhs
- **Projects**: 3 with various statuses

### Custom Seeding
Edit `seed_admin_data.py` to:
- Adjust number of advocates
- Change project names and locations
- Modify referral distributions
- Update reward amounts
- Customize advocate type ratios

---

## Frontend API Integration

### Updated Frontend Services (`src/services/api.js`)

New admin API methods:
```javascript
// Existing
adminAPI.getAnalytics()
adminAPI.listAdvocates(skip, limit, type, status, search)
adminAPI.getPendingUsers(skip, limit, role)
adminAPI.approveUser(userId)
adminAPI.rejectUser(userId, reason)

// New methods
adminAPI.getReferrals(skip, limit, type, status, projectId)
adminAPI.getAdvocateDetails(advocateId)
adminAPI.getRewardsAnalytics(skip, limit, status)
adminAPI.getProjectAnalytics()
adminAPI.overrideValidation(advocateId, newType, reason)
adminAPI.importAdvocates(advocatesData)
```

Project API:
```javascript
projectAPI.getAll()
projectAPI.getDetails(projectId)
projectAPI.getByAdvocate(advocateId)
```

---

## Setup Instructions

### 1. **Backend Prerequisites**
```bash
# Install Python dependencies
cd server
pip install -r requirements.txt

# Verify MongoDB is running
mongosh  # or mongo
```

### 2. **Complete Backend Setup**
```bash
# If app.py is running, restart it
python app.py
```

### 3. **Seed Database**
```bash
# Run the seeding script
python3 seed_admin_data.py

# Output should show:
# ✓ Created 3 projects
# ✓ Created 187 project advocates
# ✓ Created 155 brand advocates
# ✓ Created 201+ referrals
# ✓ Created reward records
# ✅ DATA SEEDING COMPLETED SUCCESSFULLY!
```

### 4. **Verify Frontend**
```bash
# Frontend should now work with:
npm run dev

# Access admin dashboard
# Login as admin user
# Navigate to /admin
```

---

## Testing the Integration

### Test Admin Dashboard

1. **Overview Tab**
   - [ ] Should show 342 total advocates
   - [ ] Project advocates: 187, Brand advocates: 155
   - [ ] Active referrals: 456+
   - [ ] Conversions showing monthly breakdown
   - [ ] Rewards paid: ₹20.5L+

2. **Advocates Tab**
   - [ ] List loads with all advocates
   - [ ] Filter by advocate type works
   - [ ] Search functionality works
   - [ ] Click "View Details" shows advocate info
   - [ ] Export button downloads CSV

3. **Pipeline Tab**
   - [ ] Project advocates pipeline shows stages
   - [ ] Brand advocates pipeline shows stages
   - [ ] Conversion rates display correctly
   - [ ] Numbers add up to totals

4. **Projects Tab**
   - [ ] All 3 projects display
   - [ ] Status indicators correct
   - [ ] Advocate counts accurate
   - [ ] Referral and conversion stats match analytics

5. **Reports Tab**
   - [ ] All 6 export options available
   - [ ] CSV files download successfully
   - [ ] Data in CSV matches displayed values

---

## API Response Examples

### Analytics Response
```json
{
  "total_advocates": 342,
  "project_advocates": 187,
  "brand_advocates": 155,
  "active_referrals": 456,
  "conversions_mtd": 82,
  "conversion_rate": 18,
  "rewards_paid": 2050000,
  "project_advocates_new_leads": 89,
  "project_advocates_in_progress": 67,
  "project_advocates_converted": 45,
  "project_advocates_conversion": 16,
  "project_advocates_avg_referrals": 1.4,
  "brand_advocates_new_leads": 67,
  "brand_advocates_in_progress": 52,
  "brand_advocates_converted": 37,
  "brand_advocates_conversion": 19,
  "brand_advocates_avg_referrals": 1.2,
  "timestamp": "2026-02-17T..."
}
```

### Advocates List Response
```json
{
  "advocates": [
    {
      "id": "507f...",
      "name": "Sunita Mehta",
      "email": "sunita@example.com",
      "phone": "9876543210",
      "advocate_type": "PROJECT_ADVOCATE",
      "project_name": "Oscar Sanctuary",
      "plot_number": "A-127",
      "status": "approved",
      "referral_count": 12,
      "conversion_count": 3,
      "total_rewards": 15000,
      "created_at": "2026-01-15T..."
    }
  ],
  "total": 342,
  "skip": 0,
  "limit": 20
}
```

---

## Performance Optimization

### Indexes Recommended
```javascript
// Create these indexes for better performance
db.users.createIndex({ advocate_type: 1 })
db.users.createIndex({ role: 1 })
db.users.createIndex({ status: 1 })
db.referrals.createIndex({ advocate_id: 1 })
db.referrals.createIndex({ advocate_type: 1 })
db.referrals.createIndex({ status: 1 })
db.referrals.createIndex({ target_project: 1 })
db.projects.createIndex({ status: 1 })
```

### Query Optimization
- Pagination implemented for all list endpoints
- Pagination limit: 20 items per page (configurable)
- Sorting by creation date (newest first)
- Search using regex with case-insensitive flag

---

## Troubleshooting

### Database Connection Issues
```
Error: connection refused
Solution: Ensure MongoDB is running
  mongod  (Linux/Mac)
  # or start MongoDB service on Windows
```

### Missing Collections
```
Error: Collection not found
Solution: Run seed script to create collections
  python3 seed_admin_data.py
```

### API 404 Errors
```
Error: POST /api/admin/advocates/import 404
Solution: Verify routes are registered in app.py
  Check: project_bp registered with /api/projects prefix
```

### Frontend Data Not Loading
```
Error: Failed to load analytics
Solution: 
  1. Check browser console for error details
  2. Verify admin user has 'admin' role
  3. Check backend logs for API errors
  4. Run seed script to populate data
```

---

## File Reference

### Backend Files
- [app.py](server/app.py) - Main Flask app with registered routes
- [admin_routes.py](server/routes/admin_routes.py) - Admin endpoints (400+ lines)
- [project_routes.py](server/routes/project_routes.py) - Project endpoints (300+ lines)
- [seed_admin_data.py](server/seed_admin_data.py) - Database seeding script

### Frontend Files
- [api.js](src/services/api.js) - Updated API service with new endpoints
- [AdminDashboard.jsx](src/pages/admin/AdminDashboard.jsx) - Main admin container
- [AdvocateManagement.jsx](src/pages/admin/components/AdvocateManagement.jsx)
- [ReferralPipeline.jsx](src/pages/admin/components/ReferralPipeline.jsx)
- [ProjectConfiguration.jsx](src/pages/admin/components/ProjectConfiguration.jsx)
- [ReportsAnalytics.jsx](src/pages/admin/components/ReportsAnalytics.jsx)

---

## Next Steps

1. **Test all endpoints** using Postman or curl
2. **Verify data consistency** between frontend and backend
3. **Monitor performance** with large datasets
4. **Add more validations** as needed
5. **Implement caching** for frequently accessed data
6. **Add audit logging** for admin actions
7. **Create additional reports** based on requirements

---

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API response examples
3. Inspect browser console and network tab
4. Check backend logs in terminal
5. Verify database collections using mongosh

---

**Backend integration complete! ✅**
