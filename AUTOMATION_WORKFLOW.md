# Teacher Attendance Automation - How It Works

## Overview
The system automatically marks teacher attendance as "Leave" if they haven't filled it by the deadline time (default: 6:00 PM daily).

---

## 🔄 Automation Workflow

### Daily Schedule
```
⏰ Every day at 6:05 PM IST (Asia/Kolkata)
   ↓
🔍 Check if automation is enabled
   ↓
📅 Check if today is Sunday (if excludeWeekends = true)
   ↓
🎉 Check if today is a holiday
   ↓
👥 Find all teachers WITHOUT attendance for today
   ↓
✅ Mark them as "Leave"
   ↓
📧 Send email notifications (if notifyTeachers = true)
```

### Step-by-Step Process

1. **Cron Job Triggers** (6:05 PM IST daily)
   - File: `Backend/cron/teacherAttendanceCron.js`
   - Schedule: `'5 18 * * *'` (HH:MM format)
   - Timezone: Asia/Kolkata

2. **Load Settings from Database**
   - Fetches `SystemConfig` with key `'default_config'`
   - Uses settings from `teacherAttendanceSettings` subdocument

3. **Time Check**
   - Current time must be >= deadline time (e.g., 18:00)
   - Uses IST timezone for consistency

4. **Sunday Check** (Optional)
   - If `excludeWeekends = true` → Skip automation on Sundays
   - If `false` → Run automation even on Sundays

5. **Holiday Check**
   - Queries holiday calendar in database
   - If today is a holiday → Skip automation

6. **Find Absent Teachers**
   - Query: Find all active teachers
   - Filter: No attendance record for today's date
   - Result: List of teachers who haven't marked attendance

7. **Auto-Mark as Leave**
   - Creates new TeacherAttendance record:
     ```javascript
     {
       teacher: teacherId,
       date: today,
       status: 'Leave',
       leaveType: 'Auto-marked',
       reason: 'Automatically marked as leave (no attendance submitted)',
       checkInTime: null,
       checkOutTime: null,
       totalHours: 0
     }
     ```

8. **Email Notifications** (Optional)
   - If `notifyTeachers = true` → Send email to each teacher
   - Subject: "Attendance Auto-Marked as Leave"
   - Body: Explains why they were marked as leave
   - Includes deadline reminder for future

---

## ⚙️ Configuration Settings

### Settings Panel (Admin Only)
Access: **Teacher Attendance → Automation Settings**

| Setting | Description | Default |
|---------|-------------|---------|
| **Enable Automation** | Turn auto-marking on/off | ON |
| **Deadline Time** | Time by which attendance must be submitted | 18:00 (6:00 PM) |
| **Auto-Mark Leave** | Mark absent teachers as "Leave" | ON |
| **Half-Day Marking** | Enable half-day for late submissions | ON |
| **Half-Day Threshold** | Time after which it's counted as half-day | 12:00 (12:00 PM) |
| **Exclude Sundays** | Skip automation on Sundays | ON |
| **Email Notifications** | Send emails to absent teachers | ON |

### Database Storage
```javascript
// MongoDB Collection: systemconfigs
{
  "_id": ObjectId("..."),
  "key": "default_config",
  "yearlyLeaveLimit": 12,
  "academicYear": "2024",
  "teacherAttendanceSettings": {
    "enabled": true,
    "deadlineTime": "18:00",
    "halfDayThreshold": "12:00",
    "enableHalfDay": true,
    "autoMarkAsLeave": true,
    "excludeWeekends": true,
    "notifyTeachers": true
  },
  "createdAt": "2024-...",
  "updatedAt": "2024-..."
}
```

---

## 🧪 Testing the Automation

### Method 1: Test Button (Recommended)
1. Login as Admin
2. Navigate to **Teacher Attendance** page
3. Click **"Automation Settings"** button (top right)
4. Click **"Test Now"** button at bottom
5. This will:
   - Force run the automation immediately
   - Bypass time check
   - Mark absent teachers as leave
   - Show results in toast notification

### Method 2: Manual API Call
```powershell
# PowerShell
$token = "YOUR_ADMIN_TOKEN_HERE"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/system-config/test-teacher-attendance" -Method POST -Headers $headers | ConvertTo-Json
```

### Method 3: Wait for Scheduled Time
- Automation runs automatically at 6:05 PM IST daily
- Check backend console logs to see execution
- Check `teacherattendances` collection in MongoDB

---

## 📊 Example Scenarios

### Scenario 1: Normal Workday
- **Date:** Monday, 3:00 PM
- **Settings:** All defaults (enabled, deadline 6:00 PM, exclude Sundays)
- **Teachers:**
  - Teacher A: Marked attendance at 9:00 AM ✅
  - Teacher B: Marked attendance at 11:00 AM ✅
  - Teacher C: No attendance yet ❌
  - Teacher D: No attendance yet ❌

**What happens at 6:05 PM:**
1. Cron runs ✅
2. Not Sunday ✅
3. Not a holiday ✅
4. Finds Teacher C & D without attendance
5. Marks both as "Leave"
6. Sends email to both teachers

**Result:**
- Teacher A: Present (9:00 AM)
- Teacher B: Present (11:00 AM)
- Teacher C: Leave (Auto-marked)
- Teacher D: Leave (Auto-marked)

### Scenario 2: Sunday
- **Date:** Sunday, 6:05 PM
- **Settings:** excludeWeekends = true

**What happens:**
1. Cron runs ✅
2. **It's Sunday** → SKIP automation ⏭️
3. No teachers marked

**Result:** No action taken

### Scenario 3: Holiday
- **Date:** Monday (National Holiday), 6:05 PM
- **Settings:** All defaults

**What happens:**
1. Cron runs ✅
2. Not Sunday ✅
3. **It's a holiday** → SKIP automation ⏭️
4. No teachers marked

**Result:** No action taken

### Scenario 4: Half-Day Feature
- **Date:** Tuesday, 1:00 PM
- **Settings:** enableHalfDay = true, halfDayThreshold = 12:00 PM
- **Teacher E:** Manually marks attendance at 1:00 PM

**What happens:**
1. Teacher E marks attendance after 12:00 PM noon
2. System counts it as "Half Day"
3. At 6:05 PM:
   - Teacher E already has attendance (Half Day)
   - NOT marked as leave

**Result:**
- Teacher E: Half Day (manually marked at 1:00 PM)

---

## 🔧 Technical Details

### Cron Expression
```javascript
'5 18 * * *'
// ┬  ┬  ┬  ┬  ┬
// │  │  │  │  │
// │  │  │  │  └─ Day of week (0-6, Sunday=0)
// │  │  │  └──── Month (1-12)
// │  │  └─────── Day of month (1-31)
// │  └────────── Hour (0-23)
// └───────────── Minute (0-59)

// This means: Run at 18:05 (6:05 PM) every day
```

### IST Timezone Handling
```javascript
const moment = require('moment-timezone');
const currentTime = moment.tz('Asia/Kolkata');
```

### Email Template
```
Subject: 🔔 Attendance Auto-Marked as Leave

Dear [Teacher Name],

Your attendance for [Date] has been automatically marked as "Leave" because no attendance was submitted by the deadline time ([Deadline Time]).

Please ensure you mark your attendance before [Deadline Time] IST daily to avoid auto-marking.

If you believe this is an error, please contact the admin.

Best regards,
School Administration
```

---

## 🚨 Troubleshooting

### Issue: Automation not running
**Check:**
1. Backend server is running
2. Database connection is active
3. Settings: `enabled = true`
4. Check backend console logs at 6:05 PM

### Issue: Teachers not getting emails
**Check:**
1. Settings: `notifyTeachers = true`
2. Email service is configured (`Backend/config/emailConfig.js`)
3. Teachers have valid email addresses
4. Check email service credentials

### Issue: Sunday automation still running
**Check:**
1. Settings: `excludeWeekends = true`
2. Server timezone is set to Asia/Kolkata
3. Check system time on server

### Issue: Teachers marked as leave on holidays
**Check:**
1. Holiday is added to holiday calendar in database
2. Holiday date format matches (YYYY-MM-DD)
3. Check backend logs for holiday detection

---

## 📝 Deployment Checklist

### Backend Setup
- [ ] MongoDB connection string configured
- [ ] Environment variable: `TZ=Asia/Kolkata`
- [ ] Email service configured (SMTP credentials)
- [ ] Server starts cron jobs on boot
- [ ] Test endpoint: `POST /api/system-config/test-teacher-attendance`

### Database Initialization
- [ ] First admin login triggers config creation
- [ ] OR run: `GET /api/system-config` (creates default config)
- [ ] Verify config exists: Check `systemconfigs` collection

### Frontend Build
- [ ] API base URL set correctly
- [ ] Build production bundle
- [ ] Deploy to hosting service

### Testing
- [ ] Save settings → verify in database
- [ ] Click "Test Now" → verify teachers marked
- [ ] Check email notifications sent
- [ ] Wait for 6:05 PM → verify cron runs

---

## 📚 Related Files

### Backend
- `Backend/cron/teacherAttendanceCron.js` - Main automation logic
- `Backend/models/SystemConfig.js` - Settings schema
- `Backend/controllers/systemConfigController.js` - API handlers
- `Backend/routes/systemConfigRoutes.js` - API routes
- `Backend/server.js` - Cron initialization

### Frontend
- `Frontend/src/components/AttendanceSettingsModal.jsx` - Settings UI
- `Frontend/src/components/AdminAttendanceView.jsx` - Attendance page

### Documentation
- `AUTOMATION_WORKFLOW.md` (this file)
- `BACKEND_INTEGRATION.md` - API documentation
- `README.md` - General setup

---

## ✅ Quick Start

1. **Enable Automation:**
   ```
   Admin → Teacher Attendance → Automation Settings → Toggle ON
   ```

2. **Set Deadline:**
   ```
   Default: 18:00 (6:00 PM)
   Change if needed
   ```

3. **Save Settings:**
   ```
   Click "Save Settings" button
   ```

4. **Test Immediately:**
   ```
   Click "Test Now" button
   Check results in toast notification
   ```

5. **Verify Database:**
   ```powershell
   # MongoDB shell
   use school_db
   db.systemconfigs.findOne({ key: 'default_config' })
   ```

6. **Check Cron Logs:**
   ```
   Backend console at 6:05 PM IST
   Look for: "Running teacher attendance auto-mark..."
   ```

---

**Last Updated:** 2024
**Version:** 1.0
**Status:** Production Ready ✅
