# Backend API Requirements for Frontend Integration

This document specifies the exact API endpoints and response formats expected by the frontend.

## 📡 Base URL
```
http://localhost:5000/api
```

## 🔐 Authentication Endpoints

### 1. Sign Up
**Endpoint**: `POST /auth/signup`

**Request**:
```json
{
    "email": "user@example.com",
    "password": "password123",
    "full_name": "John Doe"
}
```

**Success Response** (201):
```json
{
    "message": "User registered successfully",
    "user_id": "507f1f77bcf86cd799439011"
}
```

**Error Response** (400/409):
```json
{
    "error": "User already exists"
}
```

### 2. Login
**Endpoint**: `POST /auth/login`

**Request**:
```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

**Success Response** (200):
```json
{
    "message": "Login successful",
    "user": {
        "id": "507f1f77bcf86cd799439011",
        "email": "user@example.com",
        "full_name": "John Doe"
    }
}
```

**Error Response** (401):
```json
{
    "error": "Invalid email or password"
}
```

### 3. Logout
**Endpoint**: `POST /auth/logout`

**Response** (200):
```json
{
    "message": "Logout successful"
}
```

---

## 👥 Advocate Endpoints

### 4. Register as Advocate
**Endpoint**: `POST /advocates/register`

**Request**:
```json
{
    "user_id": "507f1f77bcf86cd799439011",
    "advocate_type": "PROJECT_ADVOCATE"
}
```

**Response** (201):
```json
{
    "message": "Advocate registered successfully",
    "advocate_id": "507f1f77bcf86cd799439012"
}
```

### 5. Get Advocate Profile
**Endpoint**: `GET /advocates/:advocateId`

**Response** (200):
```json
{
    "_id": "507f1f77bcf86cd799439012",
    "user_id": "507f1f77bcf86cd799439011",
    "advocate_type": "PROJECT_ADVOCATE",
    "referral_code": "ADV123456",
    "created_at": "2024-01-15T10:30:00Z"
}
```

### 6. Update Advocate Profile
**Endpoint**: `PUT /advocates/:advocateId`

**Request**:
```json
{
    "advocate_type": "BRAND_ADVOCATE",
    "phone": "9876543210"
}
```

**Response** (200):
```json
{
    "message": "Profile updated successfully"
}
```

### 7. Get Advocate Stats
**Endpoint**: `GET /advocates/:advocateId/stats`

**Response** (200):
```json
{
    "total_referrals": 5,
    "converted_referrals": 3,
    "total_rewards": 100000,
    "conversion_rate": 60
}
```

### 8. Get Advocate Referrals
**Endpoint**: `GET /advocates/:advocateId/referrals`

**Response** (200):
```json
[
    {
        "_id": "507f1f77bcf86cd799439013",
        "advocate_id": "507f1f77bcf86cd799439012",
        "property_name": "Luxury Apartment Downtown",
        "property_value": 5000000,
        "client_name": "Jane Smith",
        "client_email": "jane@example.com",
        "client_phone": "9876543210",
        "status": "pending",
        "created_at": "2024-01-15T10:30:00Z"
    }
]
```

---

## 📋 Referral Endpoints

### 9. Create Referral
**Endpoint**: `POST /advocates/referrals`

**Request**:
```json
{
    "advocate_id": "507f1f77bcf86cd799439012",
    "property_name": "Luxury Apartment Downtown",
    "property_value": 5000000,
    "client_name": "Jane Smith",
    "client_email": "jane@example.com",
    "client_phone": "9876543210"
}
```

**Response** (201):
```json
{
    "message": "Referral created successfully",
    "referral_id": "507f1f77bcf86cd799439013"
}
```

### 10. Get All Referrals
**Endpoint**: `GET /referrals`

**Response** (200):
```json
[
    {
        "_id": "507f1f77bcf86cd799439013",
        "advocate_id": "507f1f77bcf86cd799439012",
        "property_name": "Luxury Apartment Downtown",
        "property_value": 5000000,
        "status": "converted",
        "created_at": "2024-01-15T10:30:00Z"
    }
]
```

### 11. Get Referral by ID
**Endpoint**: `GET /referrals/:referralId`

**Response** (200):
```json
{
    "_id": "507f1f77bcf86cd799439013",
    "advocate_id": "507f1f77bcf86cd799439012",
    "property_name": "Luxury Apartment Downtown",
    "property_value": 5000000,
    "client_name": "Jane Smith",
    "client_email": "jane@example.com",
    "client_phone": "9876543210",
    "status": "converted",
    "created_at": "2024-01-15T10:30:00Z"
}
```

### 12. Update Referral Status
**Endpoint**: `PUT /referrals/:referralId`

**Request**:
```json
{
    "status": "converted"
}
```

**Response** (200):
```json
{
    "message": "Referral updated successfully"
}
```

---

## 🎁 Reward Endpoints

### 13. Get Rewards
**Endpoint**: `GET /rewards?user_id=:userId`

**Response** (200):
```json
{
    "total": 100000,
    "rewards": [
        {
            "_id": "507f1f77bcf86cd799439014",
            "reward_id": "RWD123456",
            "user_id": "507f1f77bcf86cd799439011",
            "advocate_id": "507f1f77bcf86cd799439012",
            "referral_id": "507f1f77bcf86cd799439013",
            "reward_amount": 25000,
            "property_value": 5000000,
            "status": "pending",
            "created_at": "2024-01-15T10:30:00Z"
        }
    ]
}
```

### 14. Calculate Reward
**Endpoint**: `POST /rewards/calculate`

**Request**:
```json
{
    "property_value": 5000000
}
```

**Response** (200):
```json
{
    "property_value": 5000000,
    "tier": "tier1",
    "reward_amount": 25000
}
```

### 15. Claim Reward
**Endpoint**: `POST /rewards/:rewardId/claim`

**Response** (200):
```json
{
    "message": "Reward claimed successfully",
    "reward": {
        "_id": "507f1f77bcf86cd799439014",
        "status": "claimed",
        "claimed_at": "2024-01-15T11:30:00Z"
    }
}
```

---

## 📊 Admin Endpoints

### 16. Get Analytics Overview
**Endpoint**: `GET /admin/analytics/overview`

**Response** (200):
```json
{
    "total_users": 150,
    "total_advocates": 30,
    "total_referrals": 200,
    "converted_referrals": 120,
    "total_rewards": 5000000,
    "conversion_rate": 60
}
```

### 17. Get User Metrics
**Endpoint**: `GET /admin/metrics/users`

**Response** (200):
```json
{
    "total_users": 150,
    "active_users": 120,
    "new_users_this_month": 20,
    "verified_users": 100
}
```

### 18. Get Advocates Metrics
**Endpoint**: `GET /admin/metrics/advocates`

**Response** (200):
```json
{
    "total_advocates": 30,
    "project_advocates": 18,
    "brand_advocates": 12,
    "active_advocates": 25
}
```

### 19. Get Referrals Metrics
**Endpoint**: `GET /admin/metrics/referrals`

**Response** (200):
```json
{
    "total_referrals": 200,
    "pending_referrals": 40,
    "converted_referrals": 120,
    "failed_referrals": 40,
    "conversion_rate": 60
}
```

---

## ✅ Health Check Endpoint

### 20. Health Status
**Endpoint**: `GET /health/status`

**Response** (200):
```json
{
    "status": "healthy",
    "timestamp": "2024-01-15T11:30:00Z"
}
```

---

## 🔍 Common Response Patterns

### Success Response
```json
{
    "message": "Operation successful",
    "data": {}
}
```

### Error Response (4xx)
```json
{
    "error": "Error message here"
}
```

### Server Error Response (5xx)
```json
{
    "error": "Internal server error"
}
```

---

## 🛠️ CORS Configuration Required

Add to Flask backend:
```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173"
])
```

---

## 📝 Notes

1. All timestamps should be in ISO 8601 format
2. All monetary values in INR (₹)
3. All IDs should be MongoDB ObjectId format
4. Passwords should be hashed in production
5. Add proper error handling and validation
6. Return appropriate HTTP status codes
7. Implement request validation

---

## 🚀 Testing the Integration

### 1. Test Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","full_name":"Test User"}'
```

### 2. Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 3. Test Admin Analytics
```bash
curl http://localhost:5000/api/admin/analytics/overview
```

### 4. Test Health Check
```bash
curl http://localhost:5000/api/health/status
```
