# RBAC User Seeding Guide

Quick setup guide for seeding test users into the MongoDB database for the RBAC system.

---

## Overview

The seeding script creates 6 test user accounts with different roles and statuses to help you test the complete RBAC system:

| Email | Role | Status | Password | Purpose |
|-------|------|--------|----------|---------|
| user@test.com | Regular User | Approved ✅ | UserPass123 | Test immediate access |
| advocate.project@test.com | Project Advocate | Pending ⏳ | AdvocatePass123 | Test pending approval |
| advocate.brand@test.com | Brand Advocate | Pending ⏳ | AdvocatePass123 | Test pending approval |
| advocate.brand2@test.com | Brand Advocate | Pending ⏳ | AdvocatePass123 | Test approval workflow |
| rejected@test.com | Advocate | Rejected ❌ | RejectedPass123 | Test rejected status |
| admin@test.com | Admin | Approved ✅ | AdminPass123 | Access admin panel |

---

## Prerequisites

1. **MongoDB Running**
   - Default: `mongodb://localhost:27017/`
   - Custom: Set `MONGO_URI` environment variable

2. **Python 3** installed
   - Check: `python3 --version`

3. **Required Python packages**
   - `pymongo`: For MongoDB connection
   - `werkzeug`: For password hashing
   - Script will auto-install if missing

---

## Quick Start (Linux/Mac)

### Option 1: Use Bash Script (Easiest)
```bash
# Make script executable
chmod +x seed_roles.sh

# Run it
./seed_roles.sh
```

### Option 2: Direct Python
```bash
# Install dependencies (if needed)
pip3 install pymongo werkzeug

# Run script
python3 seed_roles.py
```

---

## Quick Start (Windows)

### Option 1: Batch Script (Easiest)
```cmd
# Double-click seed_roles.bat or run:
seed_roles.bat
```

### Option 2: Command Prompt
```cmd
# Install dependencies (if needed)
pip3 install pymongo werkzeug

# Run script
python3 seed_roles.py
```

---

## Advanced: Custom Connection String

If MongoDB is not on localhost:

### Unix/Linux/Mac:
```bash
export MONGO_URI="mongodb://user:password@host:port/"
python3 seed_roles.py
```

### Windows (Command Prompt):
```cmd
set MONGO_URI=mongodb://user:password@host:port/
python3 seed_roles.py
```

### Windows (PowerShell):
```powershell
$env:MONGO_URI="mongodb://user:password@host:port/"
python3 seed_roles.py
```

---

## What Gets Created

### Test Accounts

#### 1. Regular User (Auto-Approved)
```
Email: user@test.com
Password: UserPass123
Role: user
Status: approved ✅
```
**Use for**: Testing immediate access after signup

#### 2. Project Advocate (Pending)
```
Email: advocate.project@test.com
Password: AdvocatePass123
Role: advocate
Advocate Type: project_advocate
Status: pending ⏳
```
**Use for**: Testing pending approval workflow

#### 3. Brand Advocate (Pending)
```
Email: advocate.brand@test.com
Password: AdvocatePass123
Role: advocate
Advocate Type: brand_advocate
Status: pending ⏳
```
**Use for**: Testing pending approval message

#### 4. Brand Advocate #2 (Pending)
```
Email: advocate.brand2@test.com
Password: AdvocatePass123
Role: advocate
Advocate Type: brand_advocate
Status: pending ⏳
```
**Use for**: Testing admin approval workflow

#### 5. Rejected User (No Access)
```
Email: rejected@test.com
Password: RejectedPass123
Role: advocate
Status: rejected ❌
Rejection Reason: Application does not meet our standards
```
**Use for**: Testing rejected user login behavior

#### 6. Administrator (Full Access)
```
Email: admin@test.com
Password: AdminPass123
Role: admin
Status: approved ✅
```
**Use for**: Accessing admin panel at `/admin`

---

## Testing Workflow

### Step 1: Run the Seed Script
```bash
python3 seed_roles.py
# or
./seed_roles.sh (Linux/Mac)
# or
seed_roles.bat (Windows)
```

Expected output:
```
✅ Created: user@test.com
✅ Created: advocate.project@test.com
✅ Created: advocate.brand@test.com
✅ Created: advocate.brand2@test.com
✅ Created: rejected@test.com
✅ Created: admin@test.com
```

### Step 2: Start Services
```bash
# Terminal 1: Start backend
cd server
python app.py

# Terminal 2: Start frontend
npm run dev
```

### Step 3: Test Each User Role

#### Test 1: Regular User
1. Go to http://localhost:5173/login
2. Login with: `user@test.com` / `UserPass123`
3. ✅ Should redirect to dashboard immediately

#### Test 2: Pending Advocate
1. Go to http://localhost:5173/login
2. Login with: `advocate.project@test.com` / `AdvocatePass123`
3. ✅ Should show "Your registration is pending admin approval"
4. ✅ Form should be disabled

#### Test 3: Admin Approval
1. Login as admin: `admin@test.com` / `AdminPass123`
2. Go to http://localhost:5173/admin
3. Click "Pending Users" tab
4. Click "Review" on pending advocate
5. Click "Approve"
6. ✅ Should show success notification
7. Logout and login as the approved advocate
8. ✅ Should now have full access

#### Test 4: Rejected User
1. Go to http://localhost:5173/login
2. Login with: `rejected@test.com` / `RejectedPass123`
3. ✅ Should show "Your registration has been rejected"
4. ✅ Try to access /dashboard - should be denied

#### Test 5: Admin Panel
1. Login as: `admin@test.com` / `AdminPass123`
2. Go to http://localhost:5173/admin
3. ✅ Should see admin dashboard
4. ✅ "Pending Users" tab shows pending advocates
5. ✅ "All Users" tab shows all users
6. ✅ "Analytics" tab shows metrics

---

## Troubleshooting

### "MongoDB connection refused"
✅ **Solution**: Ensure MongoDB is running
```bash
# Start MongoDB
mongod
# or
sudo systemctl start mongod  # Linux
# or
brew services start mongodb-community  # Mac
```

### "pymongo not found"
✅ **Solution**: Install pymongo
```bash
pip3 install pymongo
```

### "werkzeug not found"
✅ **Solution**: Install werkzeug
```bash
pip3 install werkzeug
```

### "Email already exists"
✅ **Solution**: Script skips existing emails
- Users are only created if they don't exist
- To reset, delete users from MongoDB:
```javascript
db.users.deleteMany({email: {$in: ["user@test.com", "admin@test.com"]}})
```

### "Script not found"
✅ **Solution**: Run from project root directory
```bash
cd /path/to/oscar
python3 seed_roles.py
```

### Custom MongoDB Location
✅ **Solution**: Use MONGO_URI environment variable
```bash
# Linux/Mac
export MONGO_URI="mongodb://myhost:27017/"
python3 seed_roles.py

# Windows
set MONGO_URI=mongodb://myhost:27017/
python3 seed_roles.py
```

---

## Script Details

### Database Schema Created

Each user has these fields:
```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "full_name": "User Name",
  "password": "hashed_password",
  "role": "user|advocate|brand_advocate|admin",
  "status": "approved|pending|rejected",
  "advocate_type": null|"project_advocate"|"brand_advocate",
  "is_active": true,
  "created_at": "2026-02-16T...",
  "updated_at": "2026-02-16T...",
  "rejection_reason": null|"reason text"
}
```

### Password Hashing

All passwords are hashed using Werkzeug's `generate_password_hash()` before storage. This uses PBKDF2 with 150000 iterations by default.

### Database Target

- **Database**: `oscars` (default)
- **Collection**: `users`
- **Custom**: Set `DB_NAME` and `COLLECTION_NAME` in script

---

## Running Seed Script in Development

### With Docker Compose
If you have Docker compose set up:
```bash
# Ensure MongoDB container is running
docker-compose up -d mongodb

# Then run seed script
python3 seed_roles.py
```

### With Local MongoDB
```bash
# Start MongoDB
mongod

# In another terminal
python3 seed_roles.py
```

---

## Re-seeding (Reset Data)

### To clear all users and re-seed:

#### Method 1: Via MongoDB CLI
```bash
# Connect to MongoDB
mongosh

# Select database
use oscars

# Drop users collection
db.users.deleteMany({})

# Exit
exit

# Run seed script
python3 seed_roles.py
```

#### Method 2: Via Python Script
Create a `reset_and_seed.py`:
```python
from pymongo import MongoClient
import subprocess

# Connect and clear
client = MongoClient("mongodb://localhost:27017/")
db = client["oscars"]
db.users.delete_many({})
client.close()

# Run seed
subprocess.run(["python3", "seed_roles.py"])
```

---

## Next Steps After Seeding

1. ✅ **Test Login**: Try logging in with each account
   - See [RBAC_QUICK_TEST.md](RBAC_QUICK_TEST.md)

2. ✅ **Test Admin Panel**: Approve/reject pending users
   - Visit `/admin` as admin user

3. ✅ **Run Tests**: Execute comprehensive test cases
   - See [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)

4. ✅ **Verify Workflows**: Check all RBAC flows work
   - See [RBAC_ARCHITECTURE.md](RBAC_ARCHITECTURE.md)

---

## Script Output Example

```
============================================================
RBAC User Seeding Script
============================================================

Connecting to MongoDB at mongodb://localhost:27017/...
Connected to database 'oscars', collection 'users'
✅ Created: user@test.com
   - Role: user
   - Status: approved
✅ Created: advocate.project@test.com
   - Role: advocate
   - Status: pending
   - Advocate Type: project_advocate
✅ Created: advocate.brand@test.com
   - Role: advocate
   - Status: pending
   - Advocate Type: brand_advocate
✅ Created: advocate.brand2@test.com
   - Role: advocate
   - Status: pending
   - Advocate Type: brand_advocate
✅ Created: rejected@test.com
   - Role: advocate
   - Status: rejected
   - Advocate Type: project_advocate
✅ Created: admin@test.com
   - Role: admin
   - Status: approved

============================================================
SEED SUMMARY
============================================================
✅ Created: 6 new users
⏭️  Skipped: 0 existing users

... (test account details) ...

============================================================
NEXT STEPS
============================================================
1. Start the frontend: npm run dev
2. Start the backend: python server/app.py
3. Test with different user roles...
```

---

## File Reference

| File | Purpose |
|------|---------|
| `seed_roles.py` | Main Python script (Unix/Linux/Mac/Windows) |
| `seed_roles.sh` | Bash wrapper script (Unix/Linux/Mac) |
| `seed_roles.bat` | Batch wrapper script (Windows) |

---

## FAQ

**Q: Can I customize the test users?**
A: Yes, edit `seed_roles.py` in the `TEST_USERS` list.

**Q: What if users already exist?**
A: The script skips existing users by email. Duplicates won't be created.

**Q: How do I reset the database?**
A: Delete users in MongoDB CLI then run script again.

**Q: Are passwords real?**
A: No, these are test passwords for development only. Never use in production.

**Q: Can I change the database name?**
A: Yes, modify `DB_NAME = "oscars"` in `seed_roles.py`.

**Q: Do I need to run this every time?**
A: No, once is enough. Only run again if you delete users or reset database.

---

**Last Updated**: 2026-02-16
**Status**: ✅ Ready to Use

See [RBAC_QUICK_TEST.md](RBAC_QUICK_TEST.md) after seeding for testing guide.
