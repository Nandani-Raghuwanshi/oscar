# Builder Customers: Auto-Created Project Advocate Logins

## Purpose
When a builder adds customers (manual entry or CSV import), the system now creates project advocate logins for each customer so they can sign in and participate in referrals.

## Login Rules
- Login identifier: phone number (email optional).
- Password format: first name + last 4 digits of phone.
  - Example: customer "Ava Patel" with phone "+91 99887 12345" gets password `Ava2345`.
- Email can be left blank for customer-created logins.

## Conflict Handling
- If a customer phone/email already belongs to an existing user, the add/import operation is blocked.
- The API responds with conflict details so the builder UI can display the issue.

## API Notes
- `POST /api/auth/login` now accepts `loginId` (phone or email) and `password`.
- `POST /api/auth/register` now accepts optional `email`.

## Builder Customer Flow
- Single add: creates a project advocate user before saving the customer.
- CSV import: validates duplicates and existing logins, then creates users and customers in bulk.
