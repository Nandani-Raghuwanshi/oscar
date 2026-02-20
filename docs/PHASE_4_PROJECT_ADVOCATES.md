# Phase 4: Project Advocates Module

> **Status:** In Progress 🚀  
> **Start Date:** February 20, 2026

## Overview

Phase 4 implements the **Project Advocates Module**, enabling advocates to view projects, submit referrals, track conversions, and earn rewards.

### Key Features

- **Advocate Profile**: View own project details and status
- **Referral Submission**: Submit referrals to friends/network
- **Referral Tracking**: Monitor conversion status and statistics
- **Rewards Management**: Track commission earned and available rewards
- **Documentation Viewer**: Access project certifications and materials

---

## Database Models

### 1. Referral Model

```javascript
// src/models/Referral.js
{
  _id: ObjectId,
  advocateId: ObjectId (ref: User),
  projectId: ObjectId (ref: Project),
  referrerPhone: String,          // Phone of referred person
  referrerName: String,           // Name of referred person
  referrerEmail: String,          // Email of referred person (optional)
  status: String,                 // "pending", "contacted", "qualified", "converted", "lost"
  notes: String,                  // Advocate notes about the referral
  
  // Conversion tracking
  convertedAt: Date,              // When referral was converted
  paymentStatus: String,          // "pending", "processed", "failed"
  
  // Reward tracking
  rewardAmount: Number,           // Reward in currency units
  rewardStatus: String,           // "earned", "processed", "claimed"
  
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Reward Model

```javascript
// src/models/Reward.js
{
  _id: ObjectId,
  advocateId: ObjectId (ref: User),
  projectId: ObjectId (ref: Project),
  referralId: ObjectId (ref: Referral),
  
  // Reward details
  amount: Number,                 // Reward amount
  type: String,                   // "referral_commission", "bonus", "incentive"
  status: String,                 // "earned", "processed", "claimed", "expired"
  
  // Processing
  processedAt: Date,              // When reward was processed
  claimedAt: Date,                // When advocate claimed reward
  
  // Redemption
  redemptionMethod: String,       // "bank_transfer", "wallet", "check"
  remarks: String,
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## Backend API Endpoints

### Profile & Dashboard
- `GET /advocate/profile` - Get advocate profile with project details
- `GET /advocate/dashboard` - Get dashboard stats (referrals, rewards, conversions)

### Referrals
- `POST /advocate/referrals` - Submit new referral
- `GET /advocate/referrals` - List advocate's referrals with pagination
- `GET /advocate/referrals/:id` - Get referral details
- `PATCH /advocate/referrals/:id/status` - Update referral status (for CRM later)

### Rewards
- `GET /advocate/rewards` - List earned rewards
- `GET /advocate/rewards/summary` - Get reward summary (total, pending, claimed)
- `POST /advocate/rewards/:id/claim` - Claim a reward (for Phase 5+)

### Project & Documentation
- `GET /advocate/project` - Get project details
- `GET /advocate/project/certifications` - Get project certifications
- `GET /advocate/project/documents` - Get project documentation

---

## Frontend Components & Pages

### Pages
1. **AdvocateDashboard** - Overview with stats and quick actions
2. **AdvocateReferralsPage** - List, create, and track referrals
3. **AdvocateRewardsPage** - Track rewards earned and redemption
4. **AdvocateDocumentationPage** - View project docs and certifications

### Components
- ReferralForm - Submit new referral
- ReferralList - Display referrals with pagination
- ReferralCard - Individual referral details
- RewardCard - Individual reward display
- ProjectDetailsCard - Display project info

---

## Implementation Checklist

### Backend
- [ ] Create Referral model
- [ ] Create Reward model
- [ ] Create advocate routes (profile, dashboard)
- [ ] Create referral endpoints (CRUD, tracking)
- [ ] Create reward endpoints (list, summary)
- [ ] Create project documentation endpoints
- [ ] Add validation for referral submission
- [ ] Add reward calculation logic

### Frontend
- [ ] Build AdvocateDashboard page
- [ ] Create ReferralForm component
- [ ] Build AdvocateReferralsPage
- [ ] Create AdvocateRewardsPage
- [ ] Update AdvocateDocumentationPage
- [ ] Create reward summary widget
- [ ] Add referral status filters
- [ ] Create referral details modal

---

## Data Relationships

```
User (Advocate)
  ├── projectId → Project
  └── referrals → Referral[]
      ├── referralId → Referral
      └── advocates → User

Referral
  ├── advocateId → User
  ├── projectId → Project
  └── rewards → Reward[]

Reward
  ├── advocateId → User
  ├── projectId → Project
  └── referralId → Referral (optional)
```

---

## Notes

- Project Advocates are users with `role = "project_advocate"` and specific `projectId`
- Referral status flow: pending → contacted → qualified → converted/lost
- Reward calculation deferred until Phase 6 (CRM integration)
- WhatsApp notifications deferred to Phase 8
- Bulk referral operations deferred to Phase 5+

---

## Testing & Validation

### Manual Testing
- [ ] Create project advocate user via admin panel
- [ ] Login as advocate and verify dashboard
- [ ] Submit referral and verify it's saved
- [ ] Track referral status changes
- [ ] Verify reward calculations

### API Testing
- [ ] Test all endpoints with valid/invalid data
- [ ] Verify authorization for advocate-only endpoints
- [ ] Test pagination and filtering
- [ ] Test data validation

---

## Phase 4 Dependencies
- User model (existing)
- Project model (existing)
- Auth middleware (existing)
- Response utilities (existing)

## Next Phase Dependencies (Phase 5+)
- CRM module for referral status updates
- Payment system for reward processing
- WhatsApp integration for notifications
