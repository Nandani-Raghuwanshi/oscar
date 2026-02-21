# Backend End-to-End Test Plan

## Goals
- Validate end-to-end backend user journeys across all roles and modules delivered in Phases 1-9.
- Cover success paths, validation failures, RBAC enforcement, and data integrity.
- Produce a single, executable plan that can be turned into automated tests.

## Scope
- Backend API only (Express + MongoDB), including auth, RBAC, data models, and integrations.
- Includes audit logging and notification service behavior.
- Excludes frontend UI behavior and visual validation.

## Environments
- Local: Docker MongoDB + server in dev mode.
- CI: isolated MongoDB database per run.

## Test Data Prerequisites
- Seed users for each role: admin, builder, crm_manager, sales_associate, project_advocate, brand_advocate.
- Seed at least 2 projects (Project A, Project B) with builders assigned.
- Seed customers tied to Project A with and without advocacy accounts.
- Seed referrals, leads, rewards, brand referrals, and brand rewards with mixed statuses.
- Seed notifications and templates (active/inactive).
- Ensure one deactivated user and one soft-deleted record per model for negative testing.

## Journey 1: Auth and Session
- Register a new user with valid payload; verify response token and user shape.
- Login with valid credentials; verify token issuance and role.
- Call current-user endpoint with valid token; verify user data.
- Failure cases:
  - Duplicate email/phone registration.
  - Invalid password login.
  - Missing token, malformed token, expired token.
  - Role not in allowed set.

## Journey 2: Admin - User Management
- Create users for each role; verify default fields and audit log entry.
- Update user role and permissions; verify changes and audit log.
- Search/filter users by role, status, project; verify pagination.
- Deactivate/reactivate user; ensure blocked auth when inactive.
- Failure cases:
  - Missing required fields.
  - Invalid role assignment.
  - RBAC denial for non-admin.

## Journey 3: Admin - Project Management
- Create project; assign builder; verify readback.
- Update project settings/status; verify readback.
- List/filter projects by status and builder.
- Failure cases:
  - Builder id invalid.
  - Duplicate project name constraint (if enforced).

## Journey 4: Admin - Audit Trail
- Perform admin actions (create user, update project); verify audit entries.
- Query audit logs with filters (date range, actor, action).
- Failure cases:
  - Non-admin access.

## Journey 5: Builder - Customer Management
- Upload customer CSV; verify validation results and created customers.
- Create single customer; verify readback.
- Update customer details; verify readback.
- List/search customers with pagination and filters.
- Failure cases:
  - Invalid CSV headers, missing required fields.
  - Duplicate phone/email constraints.
  - RBAC denial for non-builder.

## Journey 6: Builder - Advocate Login Auto-Creation
- Upload customers with advocate flags; verify advocate accounts created.
- Verify first-login password hashing flow for auto-created advocates.
- Failure cases:
  - Missing project assignment.
  - Re-import idempotency handling.

## Journey 7: Builder - Escalations and Reports
- Fetch escalations list; verify filtering and sorting.
- Fetch builder reports statistics; verify totals align with seeded data.
- Failure cases:
  - Non-builder access.

## Journey 8: Project Advocate - Profile and Dashboard
- Fetch advocate profile; verify project linkage.
- Fetch dashboard metrics; verify counts and status distribution.
- Failure cases:
  - Advocate without assigned project.

## Journey 9: Project Advocate - Referrals
- Submit referral; verify lead/referral creation and initial status.
- List referrals with pagination and filters.
- Update referral status; verify status transition rules.
- Failure cases:
  - Invalid phone/email format.
  - Duplicate referral detection (if enforced).
  - Unauthorized role access.

## Journey 10: Project Advocate - Rewards
- List rewards and reward summary by status.
- Validate reward calculation accuracy vs referral conversions.
- Failure cases:
  - Unauthorized access.

## Journey 11: Project Advocate - Project Docs
- Fetch project details, certifications, documents.
- Failure cases:
  - Missing project assets (empty states should be handled gracefully).

## Journey 12: Brand Advocate - Profile and Dashboard
- Fetch brand advocate profile; verify target project and source project.
- Fetch dashboard metrics; verify counts.
- Failure cases:
  - Advocate without target project.

## Journey 13: Brand Advocate - Referrals and Rewards
- Submit brand referral; verify status and linkage to target project.
- List brand referrals with filters.
- Update brand referral status where allowed.
- Claim reward; verify status change and claim constraints.
- Failure cases:
  - Invalid target project mismatch.
  - Duplicate referral rules.

## Journey 14: CRM - Advocate Management
- List advocates; verify performance metrics aggregation.
- Fetch advocate performance detail view.
- Failure cases:
  - Non-CRM access.

## Journey 15: CRM - Referral Assignment
- Assign referral to sales associate; verify assignment and lead creation.
- Validate auto-split/round-robin (if enabled) using multiple assignments.
- Failure cases:
  - Invalid associate id.
  - Assign referral already assigned.

## Journey 16: CRM - Sales Pipeline
- Fetch leads with filtering; verify pagination.
- Update lead status with valid note (>= 50 words); verify history.
- Ensure escalation triggers after inactivity threshold.
- Failure cases:
  - Note shorter than 50 words.
  - Invalid status transition.

## Journey 17: CRM - Calls and Interactions
- Log call for lead; verify timeline and sentiment fields.
- Fetch call history for lead.
- Failure cases:
  - Invalid lead id.

## Journey 18: CRM - Daily Status Updates
- Submit daily status; verify manager view aggregation.
- Fetch own status history.
- Failure cases:
  - Missing required metrics.

## Journey 19: CRM - Payments
- Record payment on a lead; verify payment history and totals.
- Fetch payment summary; verify revenue totals and status distribution.
- Failure cases:
  - Invalid amount.
  - Payment on non-converted lead (if restricted).

## Journey 20: CRM - Escalations
- List escalations; filter by priority/status.
- Resolve escalation with notes; verify state changes.
- Failure cases:
  - Resolve without required notes.

## Journey 21: Notifications
- Create template; list templates; update template; delete template.
- Send notification to single user; verify created record and status.
- Send bulk notifications; verify per-user records.
- Schedule notification; verify scheduled status and run time.
- Update user preferences; verify readback.
- Failure cases:
  - Template variable missing.
  - Non-admin sending access.

## Journey 22: Analytics and Reports
- Fetch analytics dashboards; verify aggregates vs seeded data.
- Generate report with filters; verify output metadata.
- Export report (CSV/PDF); verify file response and data contents.
- Failure cases:
  - Invalid date range.
  - Unauthorized role access.

## Cross-Cutting Validations
- RBAC: every route denies access for unauthorized roles.
- Soft delete: deleted items are excluded from list endpoints.
- Pagination: limits, offsets, and total counts are consistent.
- Sorting: stable sorting on createdAt and priority fields.
- Data integrity: foreign keys are validated (project, user, referral).
- Error handling: consistent error response structure.

## Test Coverage Notes
- Prefer deterministic IDs with seeded data for repeatability.
- Ensure cleanup or DB reset between runs.
- Log assertions: verify audit logs and notification logs where applicable.
