# Admin API Documentation

Complete API reference for admin dashboard endpoints.

---

## Base URL
```
http://localhost:5000/api
```

## Authentication
All admin endpoints require:
```
Authorization: Bearer <token>
Content-Type: application/json
```

---

## 📊 ANALYTICS ENDPOINTS

### GET /admin/analytics
Get comprehensive system analytics

**Request:**
```http
GET /api/admin/analytics
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "total_users": 342,
  "approved_users": 332,
  "pending_users": 8,
  "rejected_users": 2,
  "total_advocates": 342,
  "project_advocates": 187,
  "brand_advocates": 155,
  "total_referrals": 456,
  "active_referrals": 210,
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
  "timestamp": "2026-02-17T10:30:45.123456"
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized (not admin)
- `500` - Server error

---

## 👥 ADVOCATES ENDPOINTS

### GET /admin/advocates
List all advocates with filtering

**Request:**
```http
GET /api/admin/advocates?skip=0&limit=20&advocate_type=PROJECT_ADVOCATE&search=sunita
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Default | Options |
|-------|------|---------|---------|
| skip | int | 0 | 0+ |
| limit | int | 20 | 1-100 |
| advocate_type | string | null | PROJECT_ADVOCATE, BRAND_ADVOCATE |
| status | string | null | approved, pending, rejected |
| search | string | null | Any text |

**Response:** `200 OK`
```json
{
  "advocates": [
    {
      "id": "507f1f77bcf86cd799439011",
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
      "created_at": "2026-01-15T08:30:00"
    }
  ],
  "total": 342,
  "skip": 0,
  "limit": 20
}
```

---

### GET /admin/advocates/:advocate_id/details
Get detailed advocate information

**Request:**
```http
GET /api/admin/advocates/507f1f77bcf86cd799439011/details
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "advocate": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Sunita Mehta",
    "email": "sunita@example.com",
    "phone": "9876543210",
    "advocate_type": "PROJECT_ADVOCATE",
    "project_name": "Oscar Sanctuary",
    "plot_number": "A-127",
    "status": "approved",
    "created_at": "2026-01-15T08:30:00"
  },
  "statistics": {
    "total_referrals": 12,
    "total_conversions": 3,
    "conversion_rate": 25,
    "total_rewards": 15000,
    "paid_rewards": 15000,
    "pending_rewards": 0
  },
  "recent_referrals": [
    {
      "referral_id": "507f...",
      "lead_name": "Amit Kumar",
      "status": "CONVERTED",
      "created_at": "2026-02-10T15:45:00"
    }
  ]
}
```

---

### POST /admin/advocates/import
Bulk import advocates

**Request:**
```http
POST /api/admin/advocates/import
Authorization: Bearer <token>
Content-Type: application/json

{
  "advocates": [
    {
      "email": "advocate1@example.com",
      "full_name": "John Doe",
      "phone": "9876543210",
      "advocate_type": "PROJECT_ADVOCATE",
      "project_name": "Oscar Sanctuary",
      "plot_number": "A-100"
    },
    {
      "email": "advocate2@example.com",
      "full_name": "Jane Smith",
      "phone": "9876543211",
      "advocate_type": "BRAND_ADVOCATE",
      "project_name": "Oscar Fort",
      "plot_number": "B-050"
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "message": "Successfully imported 2 advocates",
  "imported_count": 2,
  "errors": null
}
```

**Response with errors:** `200 OK`
```json
{
  "message": "Successfully imported 1 advocates",
  "imported_count": 1,
  "errors": [
    "Row 2: Missing email or full_name"
  ]
}
```

---

## 📋 REFERRALS ENDPOINTS

### GET /admin/referrals
Get all referrals with filtering

**Request:**
```http
GET /api/admin/referrals?skip=0&limit=20&status=CONVERTED&advocate_type=PROJECT_ADVOCATE
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Default |
|-------|------|---------|
| skip | int | 0 |
| limit | int | 20 |
| advocate_type | string | null |
| status | string | null |
| project_id | string | null |

**Status Values:** `NEW_LEAD`, `SITE_VISIT`, `IN_PROGRESS`, `CONVERTED`

**Response:** `200 OK`
```json
{
  "referrals": [
    {
      "referral_id": "507f...",
      "advocate_id": "507f...",
      "referrer_name": "Sunita Mehta",
      "advocate_type": "PROJECT_ADVOCATE",
      "source_project": "Oscar Sanctuary",
      "target_project": "Oscar Sanctuary",
      "lead_name": "Amit Kumar",
      "lead_email": "amit@example.com",
      "lead_phone": "9876543210",
      "status": "CONVERTED",
      "created_at": "2026-02-10T15:45:00",
      "converted_at": "2026-02-25T10:30:00"
    }
  ],
  "total": 456,
  "skip": 0,
  "limit": 20,
  "analytics": {
    "total_new_leads": 156,
    "total_in_progress": 119,
    "total_converted": 82,
    "conversion_rate": 18
  }
}
```

---

## 💰 REWARDS ENDPOINTS

### GET /admin/rewards-analytics
Get rewards distribution and analytics

**Request:**
```http
GET /api/admin/rewards-analytics?skip=0&limit=20&status=PAID
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Default |
|-------|------|---------|
| skip | int | 0 |
| limit | int | 20 |
| status | string | null |

**Status Values:** `PAID`, `PENDING`

**Response:** `200 OK`
```json
{
  "rewards": [
    {
      "reward_id": "507f...",
      "advocate_name": "Sunita Mehta",
      "advocate_type": "PROJECT_ADVOCATE",
      "amount": 15000,
      "status": "PAID",
      "referral_count": 12,
      "conversion_count": 3,
      "created_at": "2026-02-01T10:00:00",
      "paid_at": "2026-02-05T15:30:00"
    }
  ],
  "total": 82,
  "skip": 0,
  "limit": 20,
  "analytics": {
    "total_amount": 2050000,
    "paid_amount": 2050000,
    "pending_amount": 0
  }
}
```

---

## 🏗️ PROJECTS ENDPOINTS

### GET /projects
List all projects

**Request:**
```http
GET /api/projects?skip=0&limit=20&status=active
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Default |
|-------|------|---------|
| skip | int | 0 |
| limit | int | 20 |
| status | string | null |
| search | string | null |

**Status Values:** `active`, `completed`, `inactive`

**Response:** `200 OK`
```json
{
  "projects": [
    {
      "id": "507f...",
      "name": "Oscar Sanctuary",
      "location": "Bangalore",
      "status": "active",
      "accepts_referrals": true,
      "units": 150,
      "total_budget": 50000000,
      "project_advocates_count": 187,
      "brand_advocates_count": 155,
      "total_referrals": 201,
      "conversions": 45,
      "conversion_rate": 22,
      "created_at": "2025-08-15T10:00:00"
    }
  ],
  "total": 3,
  "skip": 0,
  "limit": 20
}
```

---

### GET /projects/:project_id
Get specific project details

**Request:**
```http
GET /api/projects/507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "project": {
    "id": "507f...",
    "name": "Oscar Sanctuary",
    "location": "Bangalore",
    "status": "active",
    "description": "New residential project",
    "units": 150,
    "total_budget": 50000000,
    "accepts_referrals": true,
    "developer": "Oscar Developers",
    "created_at": "2025-08-15T10:00:00"
  },
  "statistics": {
    "total_referrals": 201,
    "conversions": 45,
    "conversion_rate": 22,
    "project_advocates_count": 187,
    "brand_advocates_count": 155
  },
  "project_advocates": [
    {
      "id": "507f...",
      "name": "Sunita Mehta",
      "plot_number": "A-127"
    }
  ],
  "brand_advocates": [
    {
      "id": "507f...",
      "name": "Vikram Singh"
    }
  ],
  "recent_referrals": [
    {
      "referral_id": "507f...",
      "lead_name": "Amit Kumar",
      "status": "CONVERTED",
      "created_at": "2026-02-10T15:45:00"
    }
  ]
}
```

---

### GET /projects/advocate/:advocate_id
Get projects for an advocate

**Request:**
```http
GET /api/projects/advocate/507f1f77bcf86cd799439011?skip=0&limit=10
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "projects": [
    {
      "id": "507f...",
      "name": "Oscar Sanctuary",
      "location": "Bangalore",
      "status": "active",
      "units": 150,
      "total_budget": 50000000,
      "advocate_referrals": 12
    }
  ],
  "advocate_type": "PROJECT_ADVOCATE",
  "total": 1,
  "skip": 0,
  "limit": 10
}
```

---

### GET /admin/project-analytics
Get project-wise analytics

**Request:**
```http
GET /api/admin/project-analytics
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "projects": [
    {
      "project_id": "507f...",
      "name": "Oscar Sanctuary",
      "status": "active",
      "accepts_referrals": true,
      "project_advocates_count": 187,
      "brand_advocates_count": 155,
      "total_referrals": 201,
      "conversions": 45,
      "conversion_rate": 22,
      "total_budget": 50000000,
      "units": 150
    }
  ],
  "total_projects": 3,
  "total_analytics": {
    "total_advocates": 342,
    "total_referrals": 456,
    "total_conversions": 82,
    "overall_conversion_rate": 18
  }
}
```

---

## 🔐 VALIDATION ENDPOINTS

### POST /admin/validation/override
Override advocate type validation

**Request:**
```http
POST /api/admin/validation/override
Authorization: Bearer <token>
Content-Type: application/json

{
  "advocate_id": "507f1f77bcf86cd799439011",
  "new_type": "BRAND_ADVOCATE",
  "reason": "Reclassified based on performance analysis"
}
```

**Response:** `200 OK`
```json
{
  "message": "Advocate type updated to BRAND_ADVOCATE",
  "advocate": {
    "advocate_id": "507f1f77bcf86cd799439011",
    "full_name": "Sunita Mehta",
    "advocate_type": "BRAND_ADVOCATE",
    "type_override": true,
    "override_reason": "Reclassified based on performance analysis"
  }
}
```

---

## 👤 USER MANAGEMENT ENDPOINTS

### GET /admin/pending-users
Get pending user registrations

**Request:**
```http
GET /api/admin/pending-users?skip=0&limit=20&role=advocate
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "users": [
    {
      "user_id": "507f...",
      "email": "newadvocate@example.com",
      "full_name": "New Advocate",
      "role": "advocate",
      "advocate_type": "PROJECT_ADVOCATE",
      "status": "pending",
      "created_at": "2026-02-15T10:00:00",
      "is_active": true
    }
  ],
  "total": 8,
  "skip": 0,
  "limit": 20,
  "timestamp": "2026-02-17T10:30:45"
}
```

---

### POST /admin/users/:user_id/approve
Approve pending user

**Request:**
```http
POST /api/admin/users/507f1f77bcf86cd799439011/approve
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "New Advocate has been approved successfully",
  "user": {
    "user_id": "507f...",
    "email": "newadvocate@example.com",
    "full_name": "New Advocate",
    "role": "advocate",
    "status": "approved",
    "approved_at": "2026-02-17T10:30:45"
  }
}
```

---

### POST /admin/users/:user_id/reject
Reject pending user

**Request:**
```http
POST /api/admin/users/507f1f77bcf86cd799439011/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Does not meet eligibility criteria"
}
```

**Response:** `200 OK`
```json
{
  "message": "New Advocate registration has been rejected",
  "user": {
    "user_id": "507f...",
    "email": "newadvocate@example.com",
    "full_name": "New Advocate",
    "role": "advocate",
    "status": "rejected",
    "rejection_reason": "Does not meet eligibility criteria",
    "rejected_at": "2026-02-17T10:30:45"
  }
}
```

---

### POST /admin/users/:user_id/reactivate
Reactivate rejected user

**Request:**
```http
POST /api/admin/users/507f1f77bcf86cd799439011/reactivate
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "Advocate Name has been reactivated and is pending approval again",
  "user": {
    "user_id": "507f...",
    "email": "advocate@example.com",
    "full_name": "Advocate Name",
    "role": "advocate",
    "status": "pending"
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request parameter"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized - admin role required"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## 🧪 Testing with curl

```bash
# Get admin analytics
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/admin/analytics

# List advocates
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/admin/advocates?limit=5

# Get projects
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/projects?limit=5

# Import advocates
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"advocates":[{"email":"test@example.com","full_name":"Test User"}]}' \
  http://localhost:5000/api/admin/advocates/import
```

---

## 📊 Data Pagination

All list endpoints support pagination with:
- `skip` - Number of items to skip (default: 0)
- `limit` - Number of items to return (default: 20, max: 100)

**Example:**
```
GET /api/admin/advocates?skip=20&limit=10
Returns items 21-30
```

---

## ⏱️ Rate Limiting

Currently no rate limiting implemented. Consider adding for production:
- Limit: 100 requests per minute per IP
- Per-endpoint limits for heavy operations

---

## 🔄 Webhooks & Events

Not yet implemented. Future enhancements:
- Real-time updates via WebSocket
- Event notifications for conversions
- Admin action audit log streaming

---

**API Documentation Complete ✅**
