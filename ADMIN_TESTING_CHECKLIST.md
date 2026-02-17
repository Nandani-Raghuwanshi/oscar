# Admin Dashboard Testing Checklist

## Pre-Test Setup
- [ ] Backend is running on localhost:5000
- [ ] Frontend is running (npm run dev)
- [ ] Admin user is created and can log in
- [ ] Database has sample advocates and projects data

---

## Authentication & Access Control

### Admin Access
- [ ] Admin user can access `/admin` route
- [ ] Non-admin users are redirected from `/admin`
- [ ] Session persists across page refreshes
- [ ] Logout clears admin access

### Role-Based Protection
- [ ] Anonymous users cannot access admin panel
- [ ] Regular users cannot access admin panel
- [ ] Only admin role can view dashboard
- [ ] Error message shows for unauthorized access

---

## Overview Tab (📊)

### Metrics Display
- [ ] Total Advocates card shows correct number
- [ ] Project + Brand breakdown adds up correctly
- [ ] Active Referrals shows current count with trend
- [ ] Conversions (MTD) displays with percentage
- [ ] Rewards Paid shows in Indian Currency format (₹)

### Advocate Type Distribution
- [ ] Project Advocates card displays with icon (🏘️)
- [ ] Brand Advocates card displays with icon (⭐)
- [ ] Both show distinct colors/styling
- [ ] Stats show: avg referrals and conversion rates
- [ ] Insight box compares the two types

### Data Loading
- [ ] Loading state appears initially
- [ ] Data loads without errors
- [ ] Numbers update if backend changes
- [ ] Error message shows if API fails

---

## Advocates Tab (👥)

### Table Display
- [ ] Advocate list loads and displays
- [ ] Table shows all columns correctly:
  - [ ] Name
  - [ ] Advocate Type with icon
  - [ ] Source Project
  - [ ] Plot Number
  - [ ] Referrals count
  - [ ] Conversions count
  - [ ] View Details button

### Filtering & Search
- [ ] "All Advocate Types" shows all advocates
- [ ] "Project Advocates" filter works
- [ ] "Brand Advocates" filter works
- [ ] Search box filters by name/phone/project
- [ ] Filters work together correctly
- [ ] Clearing filters resets view

### Pagination
- [ ] Previous button disabled on first page
- [ ] Next button disabled on last page
- [ ] Page info shows correct numbers
- [ ] Can navigate between pages
- [ ] Data updates when changing pages

### View Details Modal
- [ ] Modal opens on "View Details" click
- [ ] Modal displays advocate information
- [ ] Close button (✕) works
- [ ] Clicking outside modal closes it
- [ ] All detail fields show correct data:
  - [ ] Advocate Type
  - [ ] Project
  - [ ] Plot Number
  - [ ] Phone
  - [ ] Referrals count
  - [ ] Conversions count
  - [ ] Conversion rate (calculated)
  - [ ] Total Rewards

### Export Functionality
- [ ] "Export Advocates" button exists
- [ ] CSV downloads when clicked
- [ ] Filename includes date
- [ ] CSV contains all advocates
- [ ] CSV has correct columns and data
- [ ] Success message appears
- [ ] File opens correctly in Excel/Sheets

---

## Pipeline Tab (🔄)

### Project Advocates Pipeline
- [ ] Section header displays
- [ ] New Leads stage shows number
- [ ] In Progress stage shows number
- [ ] Converted stage shows number
- [ ] Conversion rate displays correctly
- [ ] Flow is: New Leads → In Progress → Converted
- [ ] Arrows connect stages visually

### Brand Advocates Pipeline
- [ ] Section header displays
- [ ] New Leads stage shows number
- [ ] In Progress stage shows number
- [ ] Converted stage shows number
- [ ] Conversion rate displays correctly
- [ ] Flow is: New Leads → In Progress → Converted
- [ ] Different styling from Project advocates

### Pipeline Summary
- [ ] Total New Leads calculation is correct
- [ ] Total In Progress calculation is correct
- [ ] Total Converted calculation is correct
- [ ] Overall Conversion rate shows
- [ ] Summary cards have distinct styling

### Visual Design
- [ ] Stages are clearly separated
- [ ] Colors indicate status (success for converted)
- [ ] Icons help identify stages
- [ ] Layout responsive on mobile

---

## Projects Tab (🏗️)

### Projects Table
- [ ] All projects display in table
- [ ] Table columns show:
  - [ ] Project Name
  - [ ] Status (with emoji icons)
  - [ ] Accepts Referrals (✅/❌)
  - [ ] Project Advocates count
  - [ ] Brand Advocates count
  - [ ] Total Budget (₹ formatted)
  - [ ] Actions button

### Status Indicators
- [ ] Active projects show 🏗️ icon
- [ ] Completed projects show ✅ icon
- [ ] Inactive projects show ⏸️ icon
- [ ] Status visually distinct

### Referral Status
- [ ] Active projects show ✅ Yes
- [ ] Completed projects show ❌ No
- [ ] Correct for each project

### Project Statistics
- [ ] Active Projects count is correct
- [ ] Total Projects count is correct
- [ ] Accepting Referrals count is correct
- [ ] Total Advocates count is correct

### Actions
- [ ] "Configure" button for active projects
- [ ] "View Only" button for completed projects
- [ ] Buttons are functional (clickable)

---

## Reports Tab (📈)

### Report Cards
All 6 report cards should display:
- [ ] All Referrals (📋)
- [ ] Conversions Report (✅)
- [ ] Rewards Summary (💰)
- [ ] Project Analytics (🏗️)
- [ ] Advocate List (👥)
- [ ] Comprehensive Report (📦) - highlighted styling

### Export Buttons
- [ ] Each card has export button
- [ ] Buttons are properly labeled
- [ ] Buttons are clickable
- [ ] Buttons trigger download

### CSV Export Functionality
- [ ] All Referrals exports correctly
  - [ ] Contains: Referral ID, Referrer, Type, Projects, Lead Name, Status, Date
- [ ] Conversions Report exports correctly
  - [ ] Contains: Conversion ID, Referrer, Lead Name, Date, Amount
- [ ] Rewards Summary exports correctly
  - [ ] Contains: Advocate name, referrals, conversions, rewards earned/paid
- [ ] Project Analytics exports correctly
  - [ ] Contains: Project name, status, advocates, referrals
- [ ] Advocate List exports correctly
  - [ ] Contains: Name, type, project, referrals, conversions, rewards
- [ ] Comprehensive Report exports correctly
  - [ ] Contains: Summary statistics

### File Quality
- [ ] All files download with correct names
- [ ] Filenames include date: `{report}-{YYYY-MM-DD}.csv`
- [ ] Files are valid CSV format
- [ ] Files open in Excel without errors
- [ ] Data is properly quote-escaped
- [ ] Special characters render correctly

### Notifications
- [ ] Success message shows after export
- [ ] Success message auto-dismisses after 3 seconds
- [ ] Error message shows if export fails
- [ ] Error messages are descriptive

### Info Section
- [ ] "Report Information" section visible
- [ ] Explains each report type
- [ ] Provides helpful context
- [ ] Styling is consistent

---

## UI/UX General

### Tab Navigation
- [ ] All 5 tabs visible
- [ ] Active tab is highlighted
- [ ] Clicking tab switches content
- [ ] Tab icons are visible
- [ ] Tab names are clear
- [ ] Tab transitions are smooth

### Responsive Design
- [ ] Desktop (1200px+): Full width layout
- [ ] Tablet (768-1199px): Adjusted spacing
- [ ] Mobile (< 768px): Single column, stacked elements
- [ ] No horizontal scrolling
- [ ] Text remains readable on all sizes
- [ ] Buttons are touch-friendly on mobile

### Loading States
- [ ] "Loading..." message appears while fetching
- [ ] Spinner or animation visible
- [ ] Content doesn't flash
- [ ] Loading clears when data arrives

### Error Handling
- [ ] Error message displays on API failure
- [ ] Error text is readable
- [ ] Error can be dismissed (via refresh)
- [ ] No broken elements on error

### Alerts & Messages
- [ ] Success alerts styled in green
- [ ] Error alerts styled in red
- [ ] Messages appear at top of content
- [ ] Messages auto-dismiss after 3 seconds
- [ ] Users can manually close alerts

### Color & Styling
- [ ] Purple gradient header (#667eea → #764ba2)
- [ ] White cards with subtle shadows
- [ ] Consistent spacing throughout
- [ ] Icons render properly
- [ ] Text hierarchy is clear
- [ ] Hover effects work smoothly
- [ ] Transitions are smooth

### Accessibility
- [ ] Tab navigation with keyboard
- [ ] Focus indicators visible
- [ ] Form labels present
- [ ] Color not only indicator of status
- [ ] Text contrast meets standards
- [ ] No flashing content

---

## Performance & Optimization

### Data Loading
- [ ] Initial page load is fast
- [ ] Pagination performs well
- [ ] Search/filter is responsive
- [ ] Large tables don't lag
- [ ] No unnecessary API calls

### Memory Usage
- [ ] No memory leaks on tab switching
- [ ] Modals clean up properly
- [ ] Long sessions remain stable
- [ ] Multiple exports don't consume excess memory

---

## Browser Compatibility

Test on:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

All should show:
- [ ] Correct layout
- [ ] All features working
- [ ] No console errors
- [ ] Styling applied correctly

---

## Integration Tests

### API Integration
- [ ] All API calls use correct endpoints
- [ ] Auth token is sent with requests
- [ ] 401 errors redirect to login
- [ ] Network errors handled gracefully
- [ ] Large datasets load correctly

### State Management
- [ ] State updates correctly with data
- [ ] Component re-renders on state change
- [ ] No stale data displayed
- [ ] Filters maintain state properly
- [ ] Pagination state preserved

### Routing
- [ ] `/admin` route protected
- [ ] Non-admins redirected
- [ ] Route changes update content
- [ ] Back button works in browser
- [ ] Bookmarking `/admin` works (when logged in as admin)

---

## Edge Cases

### Data Scenarios
- [ ] Empty lists show "No data" message
- [ ] Single items in list display correctly
- [ ] Very long names don't break layout
- [ ] Large numbers format correctly
- [ ] Null/undefined values handled

### User Actions
- [ ] Rapid clicking doesn't break UI
- [ ] Clicking during load shows feedback
- [ ] Multiple quick exports work
- [ ] Closing modal and reopening works
- [ ] Switching tabs during load handles gracefully

### Network Scenarios
- [ ] Slow network shows loading state
- [ ] Network timeout shows error
- [ ] Offline shows error
- [ ] Reconnecting reloads data

---

## Sign-Off

- [ ] All items tested and working
- [ ] No critical bugs found
- [ ] No console errors
- [ ] Ready for production
- [ ] Documentation complete

**Tester**: ___________________  
**Date**: ___________________  
**Notes**: ___________________

---

## Quick Test Commands

```bash
# Login as admin and go to /admin
npm run dev

# Check browser console for errors
# F12 → Console tab

# Check network requests
# F12 → Network tab → reload

# Test on mobile view
# F12 → Toggle device toolbar (Ctrl+Shift+M)

# Export and verify CSV
# Check Downloads folder
# Open with Excel/Sheets
```

---

**All tests should pass before production deployment! ✅**
