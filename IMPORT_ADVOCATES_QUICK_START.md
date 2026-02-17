# Import Advocates - Quick Start

## ⚡ 30-Second Setup

### 1. Access Import Tab
- Login as admin
- Go to Admin Panel
- Click "📥 Import Advocates" tab

### 2. Download Template
- Click "📥 Download CSV Template"
- Opens `advocates_template.csv`
- Has 3 example rows to show format

### 3. Fill Your Data
Use Excel or text editor:
```
full_name,email,phone,advocate_type,project_name,plot_number
John Doe,john@example.com,+1234567890,project_advocate,Project A,A-101
Jane Smith,jane@example.com,,brand_advocate,Project B,B-202
```

**Required columns:**
- full_name ✅
- email ✅ (must be unique)
- advocate_type ✅ (project_advocate OR brand_advocate)
- project_name ✅
- plot_number ✅

**Optional:**
- phone (leave blank if not available)

### 4. Upload File
- Click "📁 Choose CSV File"
- Select your filled CSV
- Preview shows first 10 rows

### 5. Import
- Review the preview
- Click "✓ Import Advocates"
- Confirm the dialog
- Done! Advocates imported as "pending"

---

## ✓ Success Checklist

After import:
- [ ] See success message
- [ ] Record count matches
- [ ] New advocates in "All Users" tab
- [ ] Status shows "pending"
- [ ] Can approve/reject individually

---

## 📋 CSV Format Rules

✅ **DO:**
- Use plain text CSV format
- Include header row (column names)
- Quote email addresses
- One advocate per row
- Save with .csv extension

❌ **DON'T:**
- Leave required fields empty
- Use spaces in advocate_type
- Mix uppercase/lowercase in type
- Include password column
- Send Excel without saving as CSV

---

## ⚠️ Common Errors

| Error | Fix |
|-------|-----|
| "No valid data found" | Add header row + at least 1 data row |
| "Email already in use" | Check for duplicate emails in your CSV or system |
| "Invalid advocate type" | Use exactly: `project_advocate` or `brand_advocate` |
| "File upload failed" | Make sure it's a .csv file, not .xlsx |

---

## 🎯 Use Case: Import 50 Advocates

1. **Prepare:** Enter 50 advocates in template CSV
2. **Upload:** Select file → see preview
3. **Import:** One click import (less than 1 second)
4. **Approve:** Go to "Pending Users" tab → approve in bulk
5. **Done:** All 50 advocates ready to use

---

## 📊 What Happens After Import

```
CSV Upload
    ↓
Validation Check
    ↓
Database Insert
    ↓
Status: Pending ← Admins approve/reject
    ↓
Status: Approved ← User can login
    ↓
Status: Ready ← Start making referrals
```

---

## 💾 Download Template Format

The template includes:
```csv
full_name,email,phone,advocate_type,project_name,plot_number
"John Doe","john@example.com","+1234567890","project_advocate","Oscar Sanctuary","A-101"
"Jane Smith","jane@example.com","+0987654321","brand_advocate","Oscar Fort","B-205"
"Bob Johnson","bob@example.com","+1122334455","project_advocate","Maple Heights","C-310"
```

Copy, modify emails/names, and upload!

---

## 🚀 You're All Set!

The import feature is ready to use. Downloaded template → Fill data → Upload → Done!

For detailed guide, see `IMPORT_ADVOCATES_GUIDE.md`
