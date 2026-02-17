# BuiltCred — User Journeys & Data Flow
> Five user types · one referral system · full data traceability

---

## Table of Contents
1. [Overview](#overview)
2. [Project Advocate Journey](#project-advocate)
3. [Brand Advocate Journey](#brand-advocate)
4. [Buyer (Lead) Journey](#buyer)
5. [Sales Team Journey](#sales)
6. [Admin / Developer Journey](#admin)
7. [Data Flow — Source to End](#data-flow)
8. [Analytics & Insights Logic](#analytics)

---

## 1. Overview

### Who Uses BuiltCred

| User Type | Role | Scope |
|---|---|---|
| 🏘️ Project Advocate | Owns in the current project. Refers friends to their own community. | Own project only |
| ⭐ Brand Advocate | Past customer from a completed project. Refers to any new developer project. | All new projects (same developer) |
| 🏠 Buyer (Lead) | Receives a referral link. Becomes a lead, gets contacted, potentially converts. | Passive |
| 📞 Sales Team | Receives enriched leads with referrer context. Updates status. Marks bookings. | Assigned leads |
| ⚙️ Admin / Developer | Full visibility across all referrals, advocates, conversions, and analytics. | Full system |

### Data Journey at a Glance

```
1 · Source → 2 · Capture → 3 · Validate → 4 · Route → 5 · Engage → 6 · Convert → 7 · Reward → 8 · Insight
```

| Stage | What Happens |
|---|---|
| **1 · Source** | Advocate shares link / QR scan / WhatsApp / chatbot entry |
| **2 · Capture** | Lead form filled · phone + name · UUID tracked |
| **3 · Validate** | Advocate type check · developer match · duplicate check |
| **4 · Route** | Webhook to CRM · sales assigned · advocate notified |
| **5 · Engage** | Site visit · follow-ups · status updates |
| **6 · Convert** | Booking confirmed · plot assigned · reward triggered |
| **7 · Reward** | Amount calculated · developer pays · TDS deducted |
| **8 · Insight** | Conversion rate · advocate ROI · channel analytics |

---

## 2. Project Advocate Journey

> Customer who owns in the **same project** they refer to.

### Steps

**Step 1 — Onboarding**
After booking their plot, the advocate is invited via SMS/email to join BuiltCred. They verify via OTP and their profile is auto-populated from the developer's CRM.
- Profile auto-created
- `type = PROJECT_ADVOCATE`
- Source project tagged

**Step 2 — Portal Access**
Dashboard shows their unique referral link (UUID-based), QR code, eligible project (own project only), reward amount they can earn, and status of past referrals.
- Link: `builtcred.com/ref/OSANC-{uuid}`
- Can refer to: **Oscar Sanctuary only**

**Step 3 — Referral Action**
Shares via WhatsApp, SMS, email, or in-person QR scan. The link carries referrer ID, project ID, channel tag, and timestamp — all encoded invisibly.
- Channel tracked
- First-touch timestamped

**Step 4 — Tracking**
Portal shows live status: `New → Contacted → Site Visit → Negotiation → Converted / Lost`. Advocate receives SMS/email at each key milestone.
- Status notifications on every change
- Own referrals only visible

**Step 5 — Reward**
30 days after booking confirmation, developer pays reward directly. BuiltCred calculates the amount and generates the payment summary. TDS applied automatically.
- ₹25K–₹50K depending on plot value
- Paid by developer directly
- TDS deducted at source

### Data Generated at Each Step

| Step | Data Fields |
|---|---|
| Register | `advocate_id` · `type = PROJECT` · `plot_number` · `project_id` · `phone_verified` |
| Link Gen | `referral_uuid` · `project_scope` · `created_at` · `channel` |
| Share | `share_channel` · `first_touch_ts` · `link_clicks` · `utm_source` |
| Lead | `lead_name` · `lead_phone` · `budget` · `source_referral_id` |
| Pipeline | `status_history[]` · `contact_date` · `visit_date` · `stage_duration` |
| Convert | `booking_date` · `plot_value` · `plot_assigned` · `conversion_id` |
| Reward | `reward_amount` · `payment_date` · `tds_amount` · `status = PAID` |

---

## 3. Brand Advocate Journey

> Past customer from a **completed project** referring to new developer projects.

### Steps

**Step 1 — Onboarding**
Developer imports customers from past projects (e.g., Oscar Fort). BuiltCred classifies them as Brand Advocates. They receive an invite when a new project launches.
- `type = BRAND_ADVOCATE`
- Source = Oscar Fort (completed)
- Cross-developer referrals: **blocked**

**Step 2 — Portal Access**
Unlike Project Advocates, Brand Advocates see **all new projects** by the same developer. They select which project to refer to before generating their unique link.
- Multi-project eligible
- One unique link per project
- Same developer only

**Step 3 — Validation (Critical)**
Before the lead is recorded, the backend confirms: same developer, referrer is not already a Project Advocate for the target project, and the target project is actively accepting referrals.
- Developer match check
- Not same project check
- Project active check

**Step 4 — Sales Context**
When the lead hits the CRM, sales sees: *"Referred by Vikram Singh — existing Oscar Developers customer (Oscar Fort, Plot B-045)."* This shapes the pitch: trust, credibility, experience.
- `sales_context` field populated
- Referrer credibility surfaced to sales team

**Step 5 — Reward**
Phase 1: identical 1% reward to Project Advocates. The advocate type distinction is tracked for analytics — enabling differentiated rewards in Phase 2 if data supports it.
- ₹25K–₹50K
- Type stored for future differentiation

### Key Difference from Project Advocate

> **Scope:** Brand Advocates can refer to multiple projects simultaneously, generating separate referral UUIDs per project. Each referral stream is tracked independently — conversion rates, referral lag, and reward payouts are all per-project. This enables the admin to see which completed project's customer base drives the most new-project conversions.

---

## 4. Buyer (Lead) Journey

> The person who receives a referral and becomes a prospective customer.

### Steps

**Step 1 — Entry**
Receives referral link via WhatsApp, SMS, email, or QR scan. Clicks link → lands on a project landing page. The UUID in the URL silently captures referrer identity, channel, and timestamp.
- First-touch recorded
- Channel = `whatsapp / qr / email`
- No login required

**Step 2 — Lead Capture**
Short form: name, phone, email (optional), budget range. On submit, a lead record is created, linked to the referral UUID. Duplicate check runs against existing CRM contacts.
- Lead record created
- Referral UUID linked
- Duplicate flagged if phone already exists

**Step 3 — Contact**
Sales team reaches out within 24h. The buyer is aware they were referred. They may also receive a discount acknowledgment message referencing the 1% off their plot price.
- SLA: 24h contact target
- Buyer discount: 1% of plot value

**Step 4 — Engage**
Sales updates status in CRM after each interaction. BuiltCred syncs status changes back in real time and notifies the referring advocate. The buyer's journey stage is tracked throughout.
- Status: `contacted → visit → negotiation`
- Each stage timestamped

**Step 5 — Decision**
If converted: booking amount captured, plot assigned, discount applied, reward triggered. If lost: exit reason logged (price / location / timing / no response). Both outcomes feed analytics.
- Convert → reward triggered for advocate
- Lost → exit reason logged for funnel analytics

### Data the Buyer Generates (Passively)

| Stage | Data Fields |
|---|---|
| Click | `timestamp` · `channel` · `device_type` · `referral_uuid` |
| Form | `lead_name` · `phone` · `budget_range` · `project_interest` |
| Pipeline | `status_at_24h` · `visit_booked` · `follow_up_count` · `stage_durations` |
| Outcome | `converted: Y/N` · `plot_value` · `exit_reason` · `time_to_close` |
| Attribution | `first_touch_ref` · `last_touch_ref` · `advocate_type` · `channel_source` |

---

## 5. Sales Team Journey

> Receives enriched leads, updates status, marks conversions.

### Steps

**Step 1 — Lead Received**
CRM receives webhook from BuiltCred. Lead record includes: lead details, referrer name, advocate type, source project, and sales context string. No manual data entry needed.
- Webhook auto-populates CRM
- Context: *"Referred by fellow resident"* or *"Referred by existing customer"*

**Step 2 — Contact**
Sales opens the conversation: *"Your friend Sunita in Plot A-127 suggested we reach out."* This warm intro improves pick-up rates and rapport vs. cold outreach.
- Context shapes pitch
- Warm intro available from referrer data

**Step 3 — Status Updates**
Sales updates status in their CRM. BuiltCred API syncs this back in real time. Advocate's portal updates. Each status change is timestamped, enabling stage-duration analytics.
- Flow: `CRM → API → BuiltCred → Advocate portal`
- Timestamped at each stage

**Step 4 — Booking**
On booking, sales enters: plot number, plot value, booking amount, booking date. BuiltCred calculates reward, triggers advocate notification, and logs the conversion with full attribution.
- `POST /referrals/{id}/convert`
- Reward auto-calculated
- Both advocate and buyer notified

**Step 5 — Lost**
When marking a lead as lost, sales selects a reason: price too high / location / not ready / no response / went elsewhere. This data feeds the analytics layer for funnel optimisation.
- Exit reason captured
- Feeds dropout analytics

### Sales Visibility Rules

> Sales can see all leads assigned to them across all projects. They cannot see other advocates' personal details beyond what's needed for the warm intro. Reward amounts and payment details are **admin-only**.

---

## 6. Admin / Developer Journey

> Full system visibility — advocates, referrals, conversions, analytics, and rewards.

### Steps

**Step 1 — Setup**
Admin registers each project, sets status (`new / completed / paused`), defines whether it accepts referrals, and configures tiered reward amounts. Sets developer boundary for cross-project rules.
- Project config
- Reward tiers
- Developer boundary

**Step 2 — Import**
Uploads CSV or triggers API sync to pull existing customers. BuiltCred auto-classifies each as Project or Brand Advocate based on which project they own in vs. which project is being marketed.
- Bulk import
- Auto-classification
- Duplicate deduplication

**Step 3 — Monitor**
Dashboard shows total referrals, by advocate type, by project, by stage. Can filter to see which advocates are most active, which leads have stalled, and which projects are converting best.
- Pipeline by type
- Top advocates
- Stale lead alerts

**Step 4 — Override**
If a customer bought in two projects, admin can manually override their type. Can also pause a specific advocate, blacklist a referral (broker detected), or extend reward validity windows.
- Manual type override
- Broker blacklist
- Eligibility window control

**Step 5 — Rewards**
Reviews reward queue 30 days post-booking. Approves payment, logs payment date and reference. BuiltCred marks advocate's reward as PAID and sends confirmation. All TDS records stored.
- Reward approval queue
- TDS records maintained
- Payment confirmation sent

**Step 6 — Analytics**
Full analytics: conversion rate by advocate type, best-performing channels, average time to close, cost per acquisition vs. traditional marketing, and ROI of each project's referral programme.
- Conversion by type
- Channel performance
- Cost per acquisition

---

## 7. Data Flow — Source to End

### Layer 1 — Input Sources

```
Advocate Action → BuiltCred Engine → CRM (Outbound)
```

| Node | What Happens |
|---|---|
| **Advocate Action** | Shares link / QR · submits referral form · channel tagged |
| **BuiltCred Engine** | UUID decoded · type validated · lead record created |
| **CRM (Outbound)** | Webhook fired · lead auto-created · context fields set |

### Layer 2 — Status Loop

```
CRM Update → API Inbound → Advocate Portal
```

| Node | What Happens |
|---|---|
| **CRM Update** | Sales changes status · visit logged · notes added |
| **API Inbound** | `PUT /status` · status history appended · stage duration calculated |
| **Advocate Portal** | Status updated live · SMS/email sent · reward eligibility shown |

### Layer 3 — Conversion Event

```
Sales Marks Booking → BuiltCred Calculates → Outputs
```

| Node | What Happens |
|---|---|
| **Sales Marks Booking** | `POST /convert` · `plot_value` submitted · `booking_date` logged |
| **BuiltCred Calculates** | Reward amount · buyer discount · attribution locked |
| **Outputs** | Advocate notified · admin reward queue updated · analytics updated |

### Layer 4 — Analytics Aggregation

```
Raw Events → Aggregation → Admin Dashboard
```

| Node | What Happens |
|---|---|
| **Raw Events** | `link_clicks[]` · `lead_created[]` · `status_changes[]` · `conversions[]` |
| **Aggregation** | Group by `advocate_type` · `channel` · `project` · `time_period` |
| **Admin Dashboard** | Conversion rates · channel performance · cost per acquisition · ROI by project |

### Full Data Entity Map

| Entity | Key Fields |
|---|---|
| `advocate` | `id` · `name` · `phone` · `type (ENUM)` · `source_project_id` · `developer_id` · `status` |
| `referral_link` | `uuid` · `advocate_id` · `target_project_id` · `created_at` · `channel` |
| `lead` | `id` · `referral_uuid` · `name` · `phone` · `budget_range` · `created_at` |
| `pipeline_event` | `lead_id` · `status` · `timestamp` · `updated_by` · `notes` |
| `conversion` | `lead_id` · `plot_number` · `plot_value` · `booking_date` · `first_touch_id` · `last_touch_id` |
| `reward` | `conversion_id` · `advocate_id` · `amount` · `tds` · `paid_date` · `status` |
| `analytics_snapshot` | `period` · `project_id` · `advocate_type` · `referrals` · `conversions` · `conv_rate` |

---

## 8. Analytics & Insights Logic

### Core Metrics — How They're Computed

| Metric | Formula | Description |
|---|---|---|
| **Conversion Rate** | `conversions / total_referrals × 100` | Per advocate type, per project, per time window |
| **Time to Close** | `avg(booking_date − lead_created_at)` | Average days from lead creation to booking |
| **Channel Performance** | `conversions / leads grouped by utm_channel` | Conversion rate broken down by share channel |
| **Cost Per Acquisition** | `sum(rewards_paid) / total_conversions` | Total rewards paid divided by number of conversions |
| **Advocate Activity Rate** | `active_advocates / total_advocates × 100` | % of registered advocates with ≥1 referral submitted |
| **Top Advocate Score** | `referrals + (conversions × 3)` | Weighted score per advocate |
| **Funnel Dropout** | `lost_at_stage / entered_stage × 100` | % of leads that stall at each pipeline stage |
| **Advocate Type ROI** | `conversions_per_type / rewards_per_type` | Which type produces more conversions per reward rupee |

### Attribution Logic

**First-touch**
The referral UUID in the initial link click. Credited if the lead converts with no subsequent referrals.

**Last-touch**
The most recent referral submission for the same lead phone number. If two advocates referred the same person, last-touch gets the reward — first-touch is logged for analytics but not rewarded.

**Duplicate detection**
On lead submission, phone number is checked against all existing leads. Match → flagged, sales notified, original referral preserved.

### Analytics Snapshot Schedule

| Cadence | Metrics |
|---|---|
| **Real-time** | New lead count · status changes · link clicks |
| **Daily** | Stage distribution · overdue leads · new advocates |
| **Weekly** | Conversion rate trend · channel ranking · top advocates |
| **Monthly** | Project ROI · type comparison · reward summary |
| **On-demand** | CSV export · custom filters · API query |

### How Type-Level Insights Flow

**A — Every event tagged with `advocate_type`**
Lead created, status changed, conversion logged — each carries `advocate_type = PROJECT_ADVOCATE` or `BRAND_ADVOCATE`. This tag never changes after validation.

**B — Aggregation groups by type**
Nightly job groups all events by `advocate_type × project × week`. Stores conversion rates, avg close time, and reward spend per type into `analytics_snapshot` table.

**C — Admin sees: "Brand Advocates convert 2.7% higher"**
Dashboard surfaces the delta between type conversion rates. If the gap is statistically significant, the system flags it as an insight: *"Consider differentiated rewards for Brand Advocates in Phase 2."*

**D — Decision input for Phase 2**
This data directly informs whether to differentiate reward tiers, increase Brand Advocate outreach, or focus re-engagement campaigns on dormant Project Advocates.

---

*BuiltCred MVP v2.0 — Phase 1 (Months 1–3)*
