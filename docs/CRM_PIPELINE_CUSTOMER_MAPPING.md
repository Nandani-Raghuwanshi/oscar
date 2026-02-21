# CRM Pipeline Customer Mapping

## Purpose
Ensure CRM pipeline items display the correct customer name, phone, and email when lead records do not include a populated `customerId` object.

## Problem
Some lead responses include `referralId` with `referrerName`, `referrerPhone`, and `referrerEmail`, but `customerId` is missing or not populated. This caused CRM pipeline cards to render as "Unnamed" or omit contact details.

## Fix
The CRM pipeline now normalizes customer details at render time:
- Prefer `customerId` when it is an object with customer fields.
- Fall back to `referralId.referrerName`, `referralId.referrerPhone`, and `referralId.referrerEmail`.
- Final fallback uses legacy flat fields (`referrerName`, `name`, `phone`, `email`) when present.

## Files
- client/src/pages/crm/CRMPipelinePage.jsx
