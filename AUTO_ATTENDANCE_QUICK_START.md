# 🚀 Quick Start - Auto Attendance Testing

## Immediate Testing (5 Minutes)

### Step 1: Start the Backend
```powershell
cd D:\Result\Backend
npm start
```

**Expected Output:**
```
⏰ Attendance Auto-Mark Cron Job scheduled for 8:00 PM IST daily.
📌 Teachers who have not marked attendance by 8 PM will be automatically marked as Leave.
```

### Step 2: Test Time Calculation

Open your React Native app and navigate to Teacher Dashboard or Teacher Attendance screen.

**Before 8 PM:**
- ✅ You should see a **yellow/amber warning banner**
- ✅ Banner shows countdown: "3h 45m left"
- ✅ Message: "Auto-marked as Leave after 8 PM"

**After 8 PM:**
- ✅ Warning banner disappears
- ✅ If attendance not marked, wait for cron to run
- ✅ Blue/indigo info banner appears after auto-mark

### Step 3: Force Test the Cron (Optional)

**Temporarily modify for immediate testing:**

Edit `Backend/cron/attendanceCron.js`:

```javascript
// Change from:
cron.schedule('0 20 * * *', async () => {

// To (runs every 2 minutes):
cron.schedule('*/2 * * * *', async () => {
```

**Don't forget to change back after testing!**

---

## Testing Scenarios

### Scenario 1: Teacher Without Attendance
1. Login as teacher
2. Do NOT mark attendance today
3. Wait until after cron runs (8 PM or test interval)
4. Check MongoDB - should see Leave record
5. Check email - should receive notification
6. Refresh app - should see info banner

### Scenario 2: Teacher With Attendance
1. Login as teacher
2. Mark attendance before 8 PM
3. Wait until after cron runs
4. Verify - no change to existing record
5. No email sent

### Scenario 3: Warning Banner Countdown
1. Login as teacher (without marking attendance)
2. Open Teacher Dashboard
3. Verify warning banner shows correct time remaining
4. Click banner - should navigate to attendance screen
5. Banner updates every minute

---

## Verification Checklist

### Backend ✅

```bash
# Check if cron is running
# Look for these logs in terminal:
[✓] ⏰ Attendance Auto-Mark Cron Job scheduled for 8:00 PM IST daily.
[✓] 📌 Teachers who have not marked attendance by 8 PM will be automatically marked as Leave.
```

### Frontend ✅

1. **Teacher Dashboard**
   - [ ] Warning banner appears when no attendance
   - [ ] Countdown shows correct time
   - [ ] Banner disappears after 8 PM
   - [ ] Clicking banner navigates to attendance screen

2. **Teacher Attendance Screen**
   - [ ] Warning banner shows before 8 PM
   - [ ] Info banner shows after auto-mark
   - [ ] Banners adapt to dark mode

### Database ✅

```javascript
// Check in MongoDB
{
  "status": "Leave",
  "markedBy": "admin",
  "remarks": "Auto-marked as Leave - No attendance recorded by 8 PM",
  "checkInTime": null
}
```

### Email ✅

1. **Subject**: `🏖️ Attendance Auto-Marked: Leave`
2. **Content**: Professional HTML template
3. **Recipient**: Teacher's email address
4. **Status**: Check console for "📧 Email sent" message

---

## Common Issues & Quick Fixes

### Issue: "Cron not running"
**Fix:**
```javascript
// Verify in Backend/server.js:
const initAttendanceCron = require("./cron/attendanceCron");
initAttendanceCron(); // Must be called
```

### Issue: "Wrong time showing"
**Fix:**
```javascript
// Update timezone in cron job:
cron.schedule('0 20 * * *', async () => {...}, {
  timezone: "Asia/Kolkata"  // Change to your timezone
});
```

### Issue: "Emails not sending"
**Fix:**
```bash
# Add to Backend/.env:
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_app_password

# For Gmail: Use App Password, not regular password
# Settings → Security → 2-Step Verification → App passwords
```

---

## Test Data Setup

### Create Test Teacher

```javascript
// In MongoDB or through API:
{
  "name": "Test Teacher",
  "email": "test.teacher@school.com",
  "role": "teacher",
  "password": "Test@123"
}
```

### Manual Test in Console

```javascript
// In Node.js console or server.js:
const mongoose = require('mongoose');
require('./models/TeacherAttendance');

// Check today's attendance
const today = new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' });
console.log('Testing for date:', today);

// Run cron job manually (for testing):
require('./cron/attendanceCron')();
```

---

## Production Deployment

### Before Going Live

1. ✅ Set EMAIL_USER and EMAIL_PASS in .env
2. ✅ Verify timezone matches school location
3. ✅ Test with 2-3 teachers first
4. ✅ Confirm cron runs at 8 PM (not test interval)
5. ✅ Check email deliverability
6. ✅ Monitor logs for first week

### Launch Checklist

```
[ ] Backend running on production server
[ ] Cron schedule set to '0 20 * * *'
[ ] Timezone = Asia/Kolkata (or appropriate)
[ ] Email credentials configured
[ ] Frontend deployed with latest code
[ ] Teachers informed about system
[ ] Admin has access to logs
```

---

## Monitoring Commands

### View Active Cron Jobs (Linux/Mac)
```bash
crontab -l
```

### View Node.js Process
```bash
ps aux | grep node
```

### Check Backend Logs
```bash
tail -f backend.log  # If using PM2 or similar
```

### Check Email Service
```bash
# Test email sending:
node -e "require('./Backend/utils/emailService').sendAttendanceAlert({email:'test@example.com', name:'Test', date:new Date(), status:'Leave'})"
```

---

## Success Metrics

After 1 week, verify:

- ✅ Cron runs daily at 8 PM
- ✅ Teachers without attendance get Leave status
- ✅ Emails sent successfully
- ✅ No duplicate records created
- ✅ Frontend warnings display correctly
- ✅ No performance issues

---

## Emergency Disable

If you need to temporarily disable auto-attendance:

### Option 1: Comment out in server.js
```javascript
// Temporarily disable
// initAttendanceCron();
```

### Option 2: Modify cron schedule
```javascript
// Never runs (invalid date)
cron.schedule('0 0 31 2 *', async () => {...});
```

### Option 3: Add feature flag
```javascript
if (process.env.ENABLE_AUTO_ATTENDANCE === 'true') {
  initAttendanceCron();
}
```

---

## Support Contacts

**System Administrator**: Check console logs  
**Email Issues**: Verify .env configuration  
**Frontend Issues**: Check theme and navigation  
**Database Issues**: Review MongoDB connections  

---

**Remember**: Change test cron interval back to production schedule before deploying!

**Production Schedule**: `'0 20 * * *'` (8:00 PM daily)
