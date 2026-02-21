# Backend Testing Suite

Comprehensive end-to-end test suite for the BuiltCred backend API covering all roles, modules, and user journeys.

## Prerequisites

- Node.js 18+ or 20+
- pnpm (or npm)
- MongoDB (handled in-memory for tests)

## Installation

```bash
cd server
pnpm install
```

## Running Tests

### Run all tests
```bash
pnpm test
```

### Run tests in watch mode
```bash
pnpm test:watch
```

### Run tests with coverage
```bash
pnpm test:coverage
```

### Run specific journey tests
```bash
# Authentication and session tests
pnpm test:auth

# Admin module tests
pnpm test:admin

# Builder module tests
pnpm test:builder

# Project advocate tests
pnpm test:advocate

# Brand advocate tests
pnpm test:brand

# CRM module tests
pnpm test:crm

# Notifications tests
pnpm test:notifications

# Analytics tests
pnpm test:analytics

# Cross-cutting validations
pnpm test:cross-cutting
```

## Test Structure

```
server/tests/
├── setup.js                      # Global test setup with in-memory MongoDB
├── helpers/
│   ├── testData.js              # Test data fixtures and constants
│   ├── seedHelpers.js           # Database seeding utilities
│   └── authHelpers.js           # Authentication helper functions
└── journeys/
    ├── 01-auth.test.js          # Journey 1: Auth and Session
    ├── 02-admin.test.js         # Journey 2-4: Admin module
    ├── 03-builder.test.js       # Journey 5-7: Builder module
    ├── 04-project-advocate.test.js  # Journey 8-11: Project Advocate
    ├── 05-brand-advocate.test.js    # Journey 12-13: Brand Advocate
    ├── 06-crm.test.js          # Journey 14-20: CRM module
    ├── 07-notifications.test.js # Journey 21: Notifications
    ├── 08-analytics.test.js     # Journey 22: Analytics
    └── 09-cross-cutting.test.js # Cross-cutting validations
```

## Test Coverage

### User Journeys
1. **Auth and Session**: Registration, login, session management
2. **Admin - User Management**: Create, update, search, activate/deactivate users
3. **Admin - Project Management**: Create, update, list projects
4. **Admin - Audit Trail**: Query audit logs with filters
5. **Builder - Customer Management**: Upload CSV, create, update, list customers
6. **Builder - Advocate Auto-Creation**: Auto-create advocate accounts from CSV
7. **Builder - Reports**: Escalations and statistics
8. **Project Advocate - Profile**: Profile and dashboard metrics
9. **Project Advocate - Referrals**: Submit, list, update referrals
10. **Project Advocate - Rewards**: List rewards, view summary
11. **Project Advocate - Project Docs**: Fetch project details
12. **Brand Advocate - Profile**: Profile and dashboard
13. **Brand Advocate - Referrals**: Submit and manage brand referrals
14. **CRM - Advocate Management**: List advocates with performance
15. **CRM - Referral Assignment**: Manual and auto-assign referrals
16. **CRM - Sales Pipeline**: Manage leads, update status
17. **CRM - Calls**: Log and fetch call history
18. **CRM - Daily Status**: Submit and view daily updates
19. **CRM - Payments**: Record and summarize payments
20. **CRM - Escalations**: List and resolve escalations
21. **Notifications**: Templates, sending, scheduling, preferences
22. **Analytics**: Dashboard, reports, exports

### Cross-Cutting Tests
- **RBAC**: Role-based access control enforcement
- **Soft Delete**: Excluded from list endpoints
- **Pagination**: Limits, offsets, total counts
- **Sorting**: Stable sorting on multiple fields
- **Data Integrity**: Foreign key validation
- **Error Handling**: Consistent error response structure

## Test Data Seeding

Each test suite uses consistent seed data:

### Test Users
- Admin: `admin@test.com` / `Admin123!`
- Builder: `builder@test.com` / `Builder123!`
- CRM Manager: `crm-manager@test.com` / `CRM123!`
- Sales Associate: `sales@test.com` / `Sales123!`
- Project Advocate: `project-advocate@test.com` / `PA123!`
- Brand Advocate: `brand-advocate@test.com` / `BA123!`

### Test Projects
- Project Alpha (active)
- Project Beta (active)

### Complete Seed
Use `seedComplete()` helper to create full test environment with:
- All user roles
- 2 projects with builder assignments
- Customers linked to projects
- Referrals with various statuses
- Leads assigned to sales associates
- Rewards (pending, approved)
- Brand referrals and rewards
- Notification templates

## Writing New Tests

### Example Test Structure

```javascript
import request from 'supertest';
import app from '../../src/index.js';
import { seedComplete } from '../helpers/seedHelpers.js';
import { generateToken, authHeader } from '../helpers/authHelpers.js';

describe('My Feature Tests', () => {
  let user, token;

  beforeEach(async () => {
    const seeded = await seedComplete();
    user = seeded.users.admin;
    token = generateToken(user);
  });

  it('should perform expected action', async () => {
    const response = await request(app)
      .get('/api/my-endpoint')
      .set(authHeader(token))
      .expect(200);

    expect(response.body).toHaveProperty('expectedField');
  });
});
```

## CI/CD Integration

Tests run automatically in CI with:
- Isolated in-memory MongoDB per run
- Automatic cleanup between tests
- Coverage reports generated
- No external dependencies required

## Troubleshooting

### Tests hanging
- Check for unclosed database connections
- Ensure async operations use `await`
- Verify `--detectOpenHandles` flag is used

### MongoDB connection errors
- `mongodb-memory-server` downloads MongoDB binary on first run
- Check network connectivity for binary download
- Clear cache: `rm -rf ~/.cache/mongodb-binaries`

### Test timeouts
- Increase timeout in jest.config.js if needed
- Check for slow operations in seed helpers
- Use `jest.setTimeout()` for specific tests

## Coverage Goals

- Overall: >80%
- Critical paths (auth, payment): >95%
- Edge cases: Well-documented

## Next Steps

See [/docs/to-to-test.md](/docs/to-to-test.md) for detailed test plan and additional scenarios to implement.
