# Quick Start: Backend + Admin Dashboard

Get the admin dashboard up and running in minutes!

---

## 📋 Prerequisites

1. **Python 3.8+** installed
2. **MongoDB** running locally (port 27017)
3. **Node.js & npm** installed
4. **Git** repository cloned

---

## 🚀 Step 1: Start Backend

```bash
# Navigate to server directory
cd server

# Install Python dependencies (if not already done)
pip install -r requirements.txt

# Start Flask server
python app.py
```

Expected output:
```
 * Running on http://0.0.0.0:5000
 * Press CTRL+C to quit
```

---

## 📊 Step 2: Seed Database

In a **new terminal**:

```bash
cd server

# Run the seed script
python3 seed_admin_data.py
```

Expected output:
```
✓ Created 3 projects
✓ Created 187 project advocates
✓ Created 155 brand advocates
✓ Created 201+ referrals
✓ Created reward records

============================================================
DATA SEEDING SUMMARY
============================================================

👥 USERS & ADVOCATES
  Total Users: 342
  Total Advocates: 342
    - Project Advocates: 187
    - Brand Advocates: 155

📋 REFERRALS
  Total Referrals: 456
    - Project Advocates: 201
    - Brand Advocates: 255
  Conversions: 82
    - Project: 33 (16%)
    - Brand: 49 (19%)

💰 REWARDS
  Total Reward Records: 82
  Total Reward Amount: ₹410,000

🏗️ PROJECTS
  Total Projects: 3

============================================================
✅ DATA SEEDING COMPLETED SUCCESSFULLY!
============================================================
```

---

## 🎨 Step 3: Start Frontend

In a **new terminal**:

```bash
# Navigate to root directory (where package.json is)
cd ..

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

Expected output:
```
  VITE v... dev server running at:

  ➜  Local:   http://localhost:5173/
```

---

## 🔐 Step 4: Login as Admin

1. Open browser: **http://localhost:5173**
2. Click **Login**
3. Enter admin credentials:
   - Email: `admin@example.com`
   - Password: `admin123`

> **Note**: If admin user doesn't exist, create one or check `SETUP.md` for user creation

---

## ✅ Step 5: Access Admin Dashboard

1. After login, navigate to `/admin` or click admin menu
2. You should see:
   - 📊 Overview with 342 advocates
   - 👥 Advocates tab with search/filter
   - 🔄 Pipeline with conversion stages
   - 🏗️ Projects configuration
   - 📈 Reports with CSV exports

---

## 🧪 Quick Test Checklist

### Overview Tab
- [ ] Shows "Total Advocates: 342"
- [ ] Shows "Project Advocates: 187" and "Brand Advocates: 155"
- [ ] Shows "Active Referrals: 456+"
- [ ] Shows conversion rates and rewards

### Advocates Tab
- [ ] Advocate list loads (20 per page)
- [ ] Filter by type works
- [ ] Search by name works
- [ ] "View Details" shows advocate info
- [ ] Export CSV downloads

### Pipeline Tab
- [ ] Project advocates pipeline displays
- [ ] Brand advocates pipeline displays
- [ ] Conversion rates show (16.9% vs 19.6%)
- [ ] Numbers align with overview

### Projects Tab
- [ ] Shows 3 projects (Oscar Sanctuary, Oscar Fort, Maple Heights)
- [ ] Status indicators display correctly
- [ ] Advocate counts accurate
- [ ] Budget information shows

### Reports Tab
- [ ] 6 report cards visible
- [ ] Each export button works
- [ ] CSV files download with proper data

---

## 🔍 Endpoint Verification

Test backend endpoints using curl:

```bash
# Check admin analytics
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/admin/analytics

# List advocates
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/admin/advocates?skip=0&limit=5

# Get projects
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/projects?skip=0&limit=5

# Get referrals
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/admin/referrals?skip=0&limit=5

# Get rewards analytics
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/admin/rewards-analytics
```

---

## 📂 Project Structure

```
oscar/
├── server/
│   ├── app.py                    ← Main Flask app
│   ├── seed_admin_data.py        ← Run this to seed data
│   ├── routes/
│   │   ├── admin_routes.py       ← Admin endpoints
│   │   ├── project_routes.py     ← Project endpoints
│   │   └── ...
│   └── requirements.txt
│
├── src/
│   ├── pages/admin/
│   │   ├── AdminDashboard.jsx
│   │   └── components/
│   │       ├── AdvocateManagement.jsx
│   │       ├── ReferralPipeline.jsx
│   │       ├── ProjectConfiguration.jsx
│   │       └── ReportsAnalytics.jsx
│   └── services/api.js
│
└── package.json
```

---

## 🛠️ Environment Variables

Create `.env` file in root (if needed):

```bash
# Backend
MONGO_URI=mongodb://localhost:27017
JWT_SECRET=your_secret_key
DEBUG=True

# Frontend
VITE_API_URL=http://localhost:5000/api
```

---

## 📝 Common Commands

```bash
# View backend logs
tail -f server.log

# Clear MongoDB data
mongosh
  use builtcred
  db.users.deleteMany({})
  db.referrals.deleteMany({})
  # etc...

# Reseed database
python3 server/seed_admin_data.py

# Stop servers
# Terminal 1 (Backend): Ctrl+C
# Terminal 2 (Frontend): Ctrl+C

# View MongoDB collections
mongosh
  use builtcred
  show collections
  db.users.countDocuments()
  # etc...
```

---

## 🐛 Troubleshooting

### Backend won't start
```
Error: Connection refused
Fix: Start MongoDB
  mongod  (or start MongoDB service)
```

### Frontend can't reach backend
```
Error: Failed to load analytics
Fix: Check backend is running on port 5000
  curl http://localhost:5000/api/health
```

### No data in dashboard
```
Error: Empty advocates list
Fix: Run seed script
  python3 server/seed_admin_data.py
```

### Import errors in backend
```
Error: ModuleNotFoundError
Fix: Install dependencies
  pip install -r server/requirements.txt
```

---

## 📖 Additional Resources

- [BACKEND_INTEGRATION_GUIDE.md](BACKEND_INTEGRATION_GUIDE.md) - Detailed backend docs
- [ADMIN_DASHBOARD_GUIDE.md](ADMIN_DASHBOARD_GUIDE.md) - Admin dashboard features
- [ADMIN_TESTING_CHECKLIST.md](ADMIN_TESTING_CHECKLIST.md) - Complete test suite
- [SETUP.md](SETUP.md) - Initial project setup
- [README.md](README.md) - Project overview

---

## ✨ Next Steps

After successful startup:

1. **Explore dashboard** - Try all tabs and filters
2. **Test exports** - Download CSV reports
3. **Check browser console** - Verify no JavaScript errors
4. **Review backend logs** - Ensure all API calls successful
5. **Test with more data** - Run seed script multiple times
6. **Customize data** - Edit seed script for your needs

---

## 🎉 You're All Set!

The admin dashboard is now fully integrated with the backend. Enjoy!

For questions or issues:
- Check troubleshooting section above
- Review detailed guides in project root
- Check browser console (F12)
- Check terminal logs

**Happy coding! 🚀**
