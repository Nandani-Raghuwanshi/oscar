# 📋 BuiltCred Referral System – MVP & v2.0 README

## Overview
BuiltCred is a **customer referral platform for real-estate developers** with a dual-advocate model, robust validation, CRM integrations, attribution tracking, and automated reward calculation.

---

## 📊 MVP Snapshot

| Metric | Value |
|------|------|
| **Total Advocates** | 342 (187 Project + 155 Brand) |
| **Active Referrals** | 456 (+23% this month) |
| **Conversions** | 82 (18% conversion rate) |
| **Rewards Paid** | ₹20.5L (across all projects) |

---

## 🎯 Core MVP Features

### 1. Referral Engine
- Advocate type selection & validation  
- UUID-based referral links  
- QR code generation  
- Lead capture forms  
- First-touch & last-touch attribution  
- Tiered reward calculation  

### 2. Homeowner Portal
- Advocate-type dashboard  
- Project-specific referral links  
- Referral status tracking  
- Reward eligibility display  
- Multi-channel sharing (WhatsApp, SMS, Email)  
- Document repository  

### 3. Admin Panel
- Advocate-type filtering  
- Referral pipeline by advocate type  
- Cross-project analytics  
- Validation override controls  
- Bulk advocate import  
- CSV exports  

### 4. CRM Integration
- Advocate-type aware webhooks  
- Bidirectional API sync  
- Field mapping (standard + custom advocate fields)  
- Validation error handling  
- Multi-CRM support  

---

## 🆕 What’s New in v2.0 – Dual Advocate System

The platform now supports **two distinct advocate types** with different eligibility rules and sales context.

### Advocate Classification
- **Project Advocate**: Owns in the same new project
- **Brand Advocate**: Owns in other projects of the same developer

### Key Enhancements
- Backend advocate-type validation
- Auto-correction of invalid selections
- Targeted referral eligibility
- Clear sales context messaging

---

## 👥 Advocate Types

### 🏘️ Project Advocate
**Definition:** Customer owning in the same new project.

**Can Refer To**
- Their own project only

**Can View**
- Own referrals
- Referral timeline
- Rewards & payouts

**Cannot View**
- Other customers’ data
- Other projects’ details
- Internal pricing/sales data

**Example**
> Sunita owns Plot A-127 in Oscar Sanctuary → can refer only Oscar Sanctuary.

---

### ⭐ Brand Advocate
**Definition:** Customer owning in any other project by the same developer.

**Can Refer To**
- Any new project by the same developer

**Restrictions**
- ❌ Cross-developer referrals not allowed

**Can View**
- Own referrals and rewards only

**Example**
> Vikram owns Plot B-045 in Oscar Fort → can refer Oscar Sanctuary, Maple Heights.

---

## ⚖️ Advocate Comparison

| Aspect | Project Advocate | Brand Advocate |
|-----|-----|-----|
| Referral Scope | Own project only | Any new project |
| Reward (Phase 1) | 1% | 1% |
| Buyer Discount | 1% | 1% |
| Sales Context | Fellow resident | Existing customer |
| Cross-Developer | ❌ | ❌ |

---

## 🔒 Privacy & Compliance

### ✅ Permitted
- Refer qualified buyers  
- Share referral links  
- Track own referral status  
- View reward calculations  

### ❌ Prohibited
- Cross-developer referrals  
- Accessing other customer data  
- Negotiating payouts  
- Misrepresenting advocate status  

> **Note:** Brokers & channel partners are not eligible.

---

## 🔗 Referral Submission Workflow

1. Initiate via Web / WhatsApp / Link / QR  
2. Select Advocate Type  
3. Select Target Project  
4. Backend Validation  
5. Enter Lead Details  
6. Referral Recorded & Notified  

---

## 🧠 Advocate Validation Logic

```js
function validateAdvocate(userId, selectedType, targetProjectId) {
  const customer = getCustomerProfile(userId);
  const targetProject = getProject(targetProjectId);

  if (!customer) return error("Customer not found");

  if (customer.developer !== targetProject.developer) {
    return error("Cross-developer referrals not permitted");
  }

  if (selectedType === "PROJECT_ADVOCATE" && customer.project !== targetProjectId) {
    return error("Project Advocates must own in target project");
  }

  if (selectedType === "BRAND_ADVOCATE" && customer.project === targetProjectId) {
    return autoCorrect("PROJECT_ADVOCATE");
  }

  return success();
}
```

---

## 🎯 Attribution Model

### First Touch
Tracks who first introduced the lead.

### Last Touch
Tracks final referral before conversion.

---

## 💰 Reward Calculation (Phase 1)

```js
function calculateReward(plotValue) {
  if (plotValue >= 15000000) return 50000;
  if (plotValue >= 10000000) return 35000;
  return 25000;
}
```

### Reward Table

| Plot Value | Referrer Reward | Buyer Discount | Timeline |
|----------|---------------|---------------|---------|
| ₹50L–₹1Cr | ₹25,000 | 1% | 30 days |
| ₹1Cr–₹1.5Cr | ₹35,000 | 1% | 30 days |
| ₹1.5Cr+ | ₹50,000 | 1% | 30 days |

---

## 🔗 Referral Links & QR
- UUID-based links: `PROJECTCODE-UUID`
- Full channel attribution
- QR code generation & download

---

## 🏠 Homeowner Portal (Project Advocate)

- Referral stats
- Conversion tracking
- Rewards (paid & pending)
- Document downloads

---

## ⚙️ Admin Dashboard

### Advocate Distribution
- Project Advocates: 187 (16.9% conv)
- Brand Advocates: 155 (19.6% conv)

> **Insight:** Brand advocates convert better due to prior purchase experience.

### Features
- Advocate management
- Referral pipelines
- CSV exports
- Project configurations

---

## 🔌 CRM Integration

### Supported CRMs
- Salesforce
- HubSpot
- Zoho CRM
- Custom CRM

### Webhook Payload Includes
- Advocate type
- Source project
- Sales context

### API Capabilities
- Update lead status
- Mark conversions
- Trigger advocate notifications

---

## 📈 Integration Health
- Webhook success rate: 99.8%
- Avg response time: 245ms
- Zero failures in last 24h

---

## 🚀 Roadmap (Phase 2+)
- Differential rewards by advocate type
- Advanced fraud detection
- Broker-assisted referrals (separate program)
- In-app wallet & payout tracking

---

**© BuiltCred – Referral Infrastructure for Real Estate**
