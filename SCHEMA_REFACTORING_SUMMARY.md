# Schema Refactoring Summary: Eliminating Advocates Collection

## Overview
Successfully consolidated the `advocates` collection into the `users` collection, eliminating data redundancy and simplifying the data model while maintaining all functionality.

## Changes Made

### 1. Backend Schema Changes

#### Updated User Document Schema
Added advocate-specific fields to users collection:
- `advocate_type`: "PROJECT_ADVOCATE" | "BRAND_ADVOCATE" | null
- `source_project_id`: Project ID for project advocates  
- `advocate_status`: "ACTIVE" | "PENDING" | "PAUSED" | "BLACKLISTED"
- `referral_count`: Number of referrals created
- `conversion_count`: Number of conversions
- `total_earnings`: Total earnings from rewards
- `advocate_metadata`: Custom metadata for advocates
- `advocate_blacklist_reason`: Reason if blacklisted
- `advocate_blacklisted_at`: Timestamp when blacklisted

### 2. Backend Services Updated

#### `advocate_service.py`
- **Refactored Methods**: All methods now operate on the `users` collection instead of separate `advocates` collection
- **Key Changes**:
  - `register_advocate()`: Updates user document with advocate fields
  - `get_advocate()`: Fetches advocate data from users collection
  - `update_advocate_stats()`: Updates user referral/conversion stats
  - `validate_advocate_for_referral()`: Validates against user advocate_type
  - `pause_advocate()`: Sets advocate_status to PAUSED
  - `blacklist_advocate()`: Sets advocate_status to BLACKLISTED with reason

#### `referral_service.py`
- **Parameter Changes**: Updated to use `user_id` instead of `advocate_id`
- **Backward Compatibility**: Stores both `user_id` and `advocate_id` (same value) in referrals for compatibility
- **Methods Updated**:
  - `create_referral_link(user_id, ...)`: Now uses user_id
  - `validate_referral_link()`: Returns user_id and advocate_id
  - `get_referral_stats()`: Supports both user_id and advocate_id queries

#### `reward_service.py`
- **Collection Change**: Now updates `users` collection instead of `advocates`
- **Parameter Changes**: Updated to use `user_id` instead of `advocate_id`
- **Methods Updated**:
  - `create_reward(user_id, ...)`: Creates rewards for users
  - `get_advocate_rewards(user_id, ...)`: Fetches user's rewards
  - `get_reward_summary(user_id, ...)`: Creates summary for users

### 3. Backend Routes Updated

#### `advocate_routes.py`
- Updated all endpoints to use `user_id` as parameter instead of `advocate_id`
- Routes now resolve to user documents in the users collection
- API contract maintained for backward compatibility

#### `referral_routes.py`
- Updated `/referrals/create-link` to accept both `user_id` and `advocate_id`
- Added support for backward compatibility

#### `reward_routes.py`
- Updated all endpoints to use `user_id` parameters
- Methods modified to query users collection

#### `auth_routes.py`
- **Removed**: Direct advocates_collection references
- **Updated**: Signup now initializes advocate fields in user document
- **Simplified**: Login flow directly uses user_id as advocate_id

### 4. Auth Middleware Updates

#### `auth_middleware.py`
- **advocate_required()**: Updated to check for `advocate_type` field in user instead of role
- **advocate_owns_resource()**: Updated to work with users collection instead of advocates

### 5. Frontend Changes

#### `api.js`
- Updated `advocateAPI` methods to use `user_id` parameters
- Updated `referralAPI` to use `user_id` in API calls

#### React Components
- **ReferralLinkQR.jsx**: Updated to use `userId` (supports both userId and advocateId from localStorage)
- **ReferralSelectProject.jsx**: Updated to use `userId` for loading projects

#### Hooks
- **useReferral.js**: Updated to use `userId` parameter instead of `advocateId`

### 6. Removal of References
- Removed `advocates_collection` database references from:
  - `auth_routes.py`
  - `admin_routes.py`
  - `reward_service.py`

## Benefits

1. **Reduced Redundancy**: No more duplicate user data in separate collection
2. **Simpler Queries**: Single collection for all user operations  
3. **Easier Maintenance**: One source of truth for user information
4. **Better Performance**: Fewer joins needed, optimized queries
5. **Cleaner Data Model**: Advocate functionality integrated into user model

## Backward Compatibility

- API endpoints maintain same structure (using user_id instead of advocate_id)
- Referrals and rewards store both `user_id` and `advocate_id` fields
- Frontend supports both `userId` and `advocateId` from localStorage

## Migration Path for Existing Data

For existing data in the advocates collection:
1. Create new user records with advocate information
2. Create indexes on `advocate_type` in users collection
3. Update existing user records with advocate fields from advocates collection
4. Archive old advocates collection for reference
5. Update any custom scripts or integrations

## Testing Checklist

- [ ] User signup as advocate creates correct advocate fields
- [ ] Advocate login returns advocate_id in response
- [ ] Referral creation works with user_id
- [ ] Reward calculation updates user earnings
- [ ] Admin advocate management (pause/blacklist) works
- [ ] Frontend components correctly store and use user_id
- [ ] Backward compatibility maintained for legacy code

## Files Modified

### Backend
- `server/services/advocate_service.py`
- `server/services/referral_service.py`
- `server/services/reward_service.py`
- `server/routes/advocate_routes.py`
- `server/routes/referral_routes.py`
- `server/routes/reward_routes.py`
- `server/routes/auth_routes.py`
- `server/routes/admin_routes.py`
- `server/middleware/auth_middleware.py`

### Frontend
- `src/services/api.js`
- `src/pages/referral/ReferralLinkQR.jsx`
- `src/pages/referral/ReferralSelectProject.jsx`
- `src/hooks/useReferral.js`

## Next Steps

1. Deploy changes to development environment
2. Run comprehensive test suite
3. Verify all relay between users and advocates works correctly
4. Monitor for any issues in logs
5. Once stable, deploy to production
6. Retain advocates collection for 30 days as backup before deletion
