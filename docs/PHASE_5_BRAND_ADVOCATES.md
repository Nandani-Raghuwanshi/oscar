# Phase 5: Brand Advocates Module Implementation Guide

**Status:** 🚀 In Progress  
**Date:** February 20, 2026  
**Objective:** Implement cross-project referral system for Brand Advocates

---

## Overview: What are Brand Advocates?

**Brand Advocates** are customers from previous/other projects who want to refer friends/network to the current project. They represent existing customers with BuiltCred experience.

### Key Differences from Project Advocates

| Aspect | Project Advocate | Brand Advocate |
|--------|------------------|----------------|
| **Scope** | Refer within their assigned project | Refer TO a specific target project |
| **Project Selection** | Single assigned project | Pre-assigned single project (no choices) |
| **Experience** | New to BuiltCred | Returning customer (from past projects) |
| **Referral Network** | Friends/family/contacts for their project | Network from previous projects |
| **Role Badge** | "Project Advocate" | "Brand Advocate" |

### Example Scenario

- **Scenario:** A customer (Rajesh) bought property in **Oscar Sanctuary** project (completed)
- **Now:** Oscar Fort is a new project by same builder
- **Rajesh** is invited as a **Brand Advocate** for Oscar Fort
- **Rajesh can:** Refer friends who know him from Oscar Sanctuary → to Oscar Fort only
- **Rajesh cannot:** Choose which project to refer to (pre-assigned to Oscar Fort)

---

## Data Model Design

### Brand Advocate Profile (Extends User model)

No new model needed - `brand_advocate` role already exists in User model. Key fields:

```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  role: "brand_advocate",  // Existing role
  targetProjectId: ObjectId,  // NEW: The project they refer TO
  previousProjectId: ObjectId,  // NEW: Project they're coming FROM
  status: "active" | "inactive",
  createdAt: Date,
  updatedAt: Date
}
```

### BrandReferral Model (NEW)

Tracks referrals submitted by brand advocates to their target project.

```javascript
{
  _id: ObjectId,
  advocateId: ObjectId,  // Brand advocate submitting
  targetProjectId: ObjectId,  // Project being referred TO
  sourceProjectId: ObjectId,  // Project advocate came FROM
  
  // Referral details
  referrerName: String,
  referrerPhone: String,  // UNIQUE per advocate
  referrerEmail: String,
  referrerCity: String,
  referrerNotes: String,
  
  // Status tracking
  status: "pending" | "contacted" | "qualified" | "converted" | "lost",
  conversionDate: Date,
  
  // Reward linkage
  rewardId: ObjectId,  // Links to reward earned
  
  // System fields
  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```javascript
- advocateId + targetProjectId (find referrals by advocate-project combo)
- targetProjectId + status (filter by project and status)
- advocateId + status (advocate's referral status)
- createdAt (sort by date)
- isDeleted (soft delete)
```

### BrandReward Model (NEW)

Tracks rewards earned by brand advocates for conversions.

```javascript
{
  _id: ObjectId,
  advocateId: ObjectId,  // Brand advocate
  targetProjectId: ObjectId,  // Project they referred TO
  referralId: ObjectId,  // Link to BrandReferral
  
  // Reward details
  amount: Number,  // Reward amount
  currency: "INR",
  type: "commission" | "bonus" | "incentive" | "milestone",
  description: String,  // "Referral commission for Rajesh K."
  
  // Status workflow
  status: "earned" | "processed" | "claimed" | "expired",
  
  // Redemption methods
  redemptionMethod: "bank_transfer" | "wallet" | "check" | "pending",
  redemptionDetails: {
    bankAccount: String,
    accountHolder: String,
    ifscCode: String
  },
  
  // Timeline
  earnedAt: Date,
  processedAt: Date,
  claimedAt: Date,
  expiresAt: Date,
  
  // System fields
  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```javascript
- advocateId + targetProjectId (brand advocate rewards)
- targetProjectId + status (project reward tracking)
- advocateId + status (advocate reward summary)
- expiresAt (find expiring rewards)
- status (filter by status)
```

---

## Backend API Endpoints (14 Total)

### 1. Profile & Dashboard (2 endpoints)

#### GET `/api/brand/profile`
**Purpose:** Fetch brand advocate profile with target project info and source project history

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user123",
    "firstName": "Rajesh",
    "lastName": "Kumar",
    "email": "rajesh@example.com",
    "phone": "+919876543210",
    "role": "brand_advocate",
    "targetProject": {
      "_id": "proj123",
      "name": "Oscar Fort",
      "location": "Bangalore",
      "status": "ongoing"
    },
    "sourceProject": {
      "_id": "proj456",
      "name": "Oscar Sanctuary",
      "location": "Bangalore",
      "status": "completed"
    }
  }
}
```

#### GET `/api/brand/dashboard`
**Purpose:** Get comprehensive dashboard stats for brand advocate

**Query Params:**
- None (target project is pre-assigned)

**Response:**
```json
{
  "success": true,
  "data": {
    "referrals": {
      "total": 12,
      "pending": 3,
      "contacted": 4,
      "qualified": 2,
      "converted": 2,
      "lost": 1,
      "conversionRate": 16.7
    },
    "rewards": {
      "totalEarned": 50000,
      "totalClaimed": 30000,
      "totalProcessing": 20000,
      "pendingAmount": 15000,
      "pendingCount": 1
    }
  }
}
```

### 2. Brand Referrals (5 endpoints)

#### POST `/api/brand/referrals`
**Purpose:** Submit new cross-project referral

**Body:**
```json
{
  "referrerName": "Amit Sharma",
  "referrerPhone": "+919876543211",
  "referrerEmail": "amit@example.com",
  "referrerCity": "Bangalore",
  "referrerNotes": "Close friend, very interested in real estate"
}
```

**Validation:**
- referrerName: required, min 3 chars
- referrerPhone: required, unique per advocate per project
- referrerEmail: optional, valid email if provided
- referrerCity: optional, max 50 chars
- referrerNotes: optional, max 500 chars

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "_id": "ref789",
    "advocateId": "user123",
    "targetProjectId": "proj123",
    "referrerName": "Amit Sharma",
    "referrerPhone": "+919876543211",
    "status": "pending",
    "createdAt": "2026-02-20T10:30:00Z"
  }
}
```

#### GET `/api/brand/referrals`
**Purpose:** List brand advocate's referrals with pagination and filtering

**Query Params:**
- `page`: 1 (default)
- `limit`: 10 (default)
- `status`: "pending" | "contacted" | "qualified" | "converted" | "lost" (optional, all if not provided)

**Response:**
```json
{
  "success": true,
  "data": {
    "referrals": [
      {
        "_id": "ref789",
        "referrerName": "Amit Sharma",
        "referrerPhone": "+919876543211",
        "status": "contacted",
        "createdAt": "2026-02-20T10:30:00Z",
        "reward": null
      }
    ],
    "pagination": {
      "total": 12,
      "page": 1,
      "limit": 10,
      "pages": 2
    }
  }
}
```

#### GET `/api/brand/referrals/:id`
**Purpose:** Get detailed referral information

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "ref789",
    "advocateId": "user123",
    "targetProjectId": "proj123",
    "referrerName": "Amit Sharma",
    "referrerPhone": "+919876543211",
    "referrerEmail": "amit@example.com",
    "referrerCity": "Bangalore",
    "referrerNotes": "Close friend",
    "status": "contacted",
    "createdAt": "2026-02-20T10:30:00Z",
    "reward": {
      "_id": "rew123",
      "amount": 5000,
      "status": "earned"
    }
  }
}
```

#### PATCH `/api/brand/referrals/:id/status`
**Purpose:** Update referral status (CRM initiated)

**Body:**
```json
{
  "status": "qualified",
  "notes": "Customer showed strong interest"
}
```

**Allowed Statuses:** pending → contacted → qualified → converted/lost

#### GET `/api/brand/referrals/summary/count`
**Purpose:** Get referral count breakdown

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 12,
    "byStatus": {
      "pending": 3,
      "contacted": 4,
      "qualified": 2,
      "converted": 2,
      "lost": 1
    }
  }
}
```

### 3. Brand Rewards (3 endpoints)

#### GET `/api/brand/rewards`
**Purpose:** List brand advocate's rewards with pagination

**Query Params:**
- `page`: 1 (default)
- `limit`: 10 (default)
- `status`: "earned" | "processed" | "claimed" | "expired" (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "rewards": [
      {
        "_id": "rew123",
        "amount": 5000,
        "type": "commission",
        "status": "earned",
        "referralId": "ref789",
        "earnedAt": "2026-02-20T10:30:00Z"
      }
    ],
    "pagination": {}
  }
}
```

#### GET `/api/brand/rewards/summary`
**Purpose:** Get reward summary by status with aggregated amounts

**Response:**
```json
{
  "success": true,
  "data": {
    "earned": {
      "count": 5,
      "amount": 25000
    },
    "processed": {
      "count": 2,
      "amount": 10000
    },
    "claimed": {
      "count": 1,
      "amount": 5000
    },
    "expired": {
      "count": 0,
      "amount": 0
    },
    "totalEarned": 40000,
    "totalClaimed": 5000
  }
}
```

#### PATCH `/api/brand/rewards/:id/claim`
**Purpose:** Initiate reward redemption process

**Body:**
```json
{
  "redemptionMethod": "bank_transfer",
  "accountDetails": {
    "accountNumber": "123456789",
    "bankName": "HDFC Bank",
    "ifscCode": "HDFC0000001",
    "accountHolder": "Rajesh Kumar"
  }
}
```

### 4. Target Project Info (3 endpoints)

#### GET `/api/brand/project`
**Purpose:** Get target project overview (brand advocate's assigned project)

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "proj123",
    "name": "Oscar Fort",
    "description": "Luxury residential complex",
    "location": "Bangalore",
    "status": "ongoing",
    "launchDate": "2025-06-01",
    "completionDate": "2028-12-31",
    "totalUnits": 500,
    "availableUnits": 145,
    "priceRange": {
      "min": 50000000,
      "max": 150000000
    }
  }
}
```

#### GET `/api/brand/project/certifications`
**Purpose:** Get project certifications and approvals

**Response:**
```json
{
  "success": true,
  "data": {
    "certifications": [
      {
        "_id": "cert123",
        "name": "RERA Registration",
        "issuer": "Karnataka RERA",
        "issuedDate": "2025-01-15",
        "validUntil": "2026-01-14",
        "certificateUrl": "/uploads/certs/rera.pdf"
      }
    ]
  }
}
```

#### GET `/api/brand/project/documents`
**Purpose:** Get project documentation and brochures

**Response:**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "_id": "doc123",
        "title": "Project Brochure",
        "type": "brochure",
        "url": "/uploads/docs/brochure.pdf",
        "uploadedDate": "2026-01-10"
      }
    ]
  }
}
```

---

## Middleware & Validation

### verifyBrandAdvocate Middleware

```javascript
const verifyBrandAdvocate = async (req, res, next) => {
  try {
    const user = req.user;
    
    // Check role
    if (user.role !== 'brand_advocate') {
      return errorResponse(res, 403, 'Access denied: Brand advocate role required');
    }
    
    // Check project assignment
    if (!user.targetProjectId) {
      return errorResponse(res, 400, 'Brand advocate not assigned to a project');
    }
    
    // Fetch and attach project info
    const project = await Project.findById(user.targetProjectId);
    if (!project) {
      return errorResponse(res, 404, 'Assigned project not found');
    }
    
    req.advocateProject = project;
    next();
  } catch (error) {
    errorResponse(res, 500, 'Middleware error', error.message);
  }
};
```

### Input Validation Rules

```javascript
export const brandReferralValidation = [
  body('referrerName')
    .trim()
    .notEmpty().withMessage('Referrer name is required')
    .isLength({ min: 3, max: 50 }).withMessage('Name must be 3-50 characters'),
  
  body('referrerPhone')
    .trim()
    .notEmpty().withMessage('Phone is required')
    .matches(/^[+]?[\d\s\-()]{10,}$/).withMessage('Valid phone number required'),
  
  body('referrerEmail')
    .optional({ checkFalsy: true })
    .isEmail().withMessage('Valid email required if provided'),
  
  body('referrerCity')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 }).withMessage('City must be max 50 characters'),
  
  body('referrerNotes')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Notes must be max 500 characters')
];
```

---

## Frontend Architecture

### Pages to Create (7)

1. **BrandAdvocateDashboard** - Overview with stats and quick actions
2. **BrandReferralsPage** - Submit and track referrals
3. **BrandRewardsPage** - View earned rewards and redemption
4. **BrandProjectPage** - View target project details
5. **BrandDocumentationPage** - Access project docs and certifications
6. **BrandRewardRedeemPage** - Reward redemption/claim interface
7. **BrandReferralDetailPage** - Individual referral details

### Components (Reusable)

```
components/
├── common/
│   ├── ProjectCard.jsx
│   ├── RewardCard.jsx
│   ├── ReferralCard.jsx
│   └── StatusBadge.jsx
├── forms/
│   ├── BrandReferralForm.jsx
│   └── RedemptionForm.jsx
└── lists/
    ├── BrandReferralsList.jsx
    └── BrandRewardsList.jsx
```

### API Client Methods (13)

```javascript
export const brandAPI = {
  // Profile
  getProfile: () => apiClient.get('/brand/profile'),
  getDashboard: () => apiClient.get('/brand/dashboard'),
  
  // Referrals
  submitReferral: (data) => apiClient.post('/brand/referrals', data),
  getReferrals: (params) => apiClient.get('/brand/referrals', { params }),
  getReferralById: (id) => apiClient.get(`/brand/referrals/${id}`),
  updateReferralStatus: (id, data) => apiClient.patch(`/brand/referrals/${id}/status`, data),
  getReferralSummary: () => apiClient.get('/brand/referrals/summary/count'),
  
  // Rewards
  getRewards: (params) => apiClient.get('/brand/rewards', { params }),
  getRewardsSummary: () => apiClient.get('/brand/rewards/summary'),
  claimReward: (id, data) => apiClient.patch(`/brand/rewards/${id}/claim`, data),
  
  // Project Info
  getProject: () => apiClient.get('/brand/project'),
  getProjectCertifications: () => apiClient.get('/brand/project/certifications'),
  getProjectDocuments: () => apiClient.get('/brand/project/documents')
};
```

---

## Implementation Roadmap

### Step 1: Database Models (Week 1)
- [ ] Create BrandReferral model
- [ ] Create BrandReward model
- [ ] Add indexes for performance
- [ ] Extend User model with targetProjectId

### Step 2: Backend API (Week 1-2)
- [ ] Create brand.js routes with 14 endpoints
- [ ] Implement verifyBrandAdvocate middleware
- [ ] Add input validation with express-validator
- [ ] Register routes in server/src/index.js

### Step 3: Frontend Pages (Week 2-3)
- [ ] Create BrandAdvocateDashboard
- [ ] Create BrandReferralsPage with form
- [ ] Create BrandRewardsPage
- [ ] Create BrandProjectPage
- [ ] Create BrandDocumentationPage

### Step 4: API Integration (Week 3)
- [ ] Add brandAPI methods to client.js
- [ ] Integrate with React Router
- [ ] Create brand advocate outlet with navbar
- [ ] Add navigation links

### Step 5: Testing & Refinement
- [ ] Manual testing of all endpoints
- [ ] Error handling and edge cases
- [ ] UI/UX refinement
- [ ] Performance optimization

---

## Key Differences from Project Advocates

| Feature | Project Advocate | Brand Advocate |
|---------|------------------|----------------|
| **API Route** | `/api/advocate/*` | `/api/brand/*` |
| **Database Model** | User + Referral + Reward | User + BrandReferral + BrandReward |
| **Project Context** | Single assigned at signup | Single assigned at invitation |
| **Referral Uniqueness** | Phone per advocate | Phone per advocate per project |
| **Dashboard Stats** | Pre-calculated aggregations | Similar stats but brand-focused |
| **Navbar** | AdvocateNavbar | BrandNavbar (new) |
| **Page Naming** | /advocate/* | /brand/* |

---

## Database Relationships

```
User (brand_advocate)
├── targetProjectId → Project
├── previousProjectId → Project
├── BrandReferrals[] (via advocateId)
└── BrandRewards[] (via advocateId)

BrandReferral
├── advocateId → User (brand_advocate)
├── targetProjectId → Project
├── sourceProjectId → Project
└── rewardId → BrandReward (optional)

BrandReward
├── advocateId → User (brand_advocate)
├── targetProjectId → Project
└── referralId → BrandReferral
```

---

## Success Criteria for Phase 5 Completion

✅ All 14 API endpoints functional and tested  
✅ Database models with proper indexing  
✅ 5 frontend pages with full functionality  
✅ Cross-project referral tracking working  
✅ Reward calculation and tracking working  
✅ All validations and error handling in place  
✅ Responsive design across all pages  
✅ Documentation complete  

---

## Next Phase Considerations

**Phase 6:** CRM/Sales module will:
- Consume brand advocate referrals
- Update referral statuses
- Track conversions
- Manage reward payouts

---

## Notes

- Brand advocates can only refer to their pre-assigned project (no project selection UI needed)
- Phone number must be unique per advocate per project to prevent duplicate referrals
- Reward calculation logic may vary based on project configuration
- Integration with CRM will handle status updates and conversion tracking
