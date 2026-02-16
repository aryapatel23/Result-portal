# 🔄 Automatic Teacher Attendance System

## Overview

Professional automatic attendance marking system that ensures all teachers have their attendance recorded daily. If a teacher hasn't marked attendance by **8:00 PM**, the system automatically marks them as **Leave**.

---

## ✨ Key Features

### 1. **Automated Leave Marking**
- 🕐 **Runs Daily at 8:00 PM** (Asia/Kolkata timezone)
- 🏖️ **Marks as Leave** (not Absent) - more lenient approach
- 📧 **Email Notifications** sent to affected teachers
- 📝 **Professional Remarks** added to attendance records

### 2. **Real-Time Warnings**
- ⏰ **Countdown Timer** showing time remaining until 8 PM
- 🔔 **Warning Banners** on both:
  - Teacher Dashboard (Home Screen)
  - Teacher Attendance Screen
- 📱 **Click to Navigate** - Banners are tappable for quick access

### 3. **Status Indicators**
- ✅ **Auto-Mark Info** - Shows when attendance was system-generated
- 🎨 **Color-Coded Alerts**:
  - Yellow/Amber - Warning before 8 PM
  - Indigo/Blue - Info after auto-marking

---

## 🔧 Technical Implementation

### Backend Components

#### 1. **Cron Job** (`Backend/cron/attendanceCron.js`)

```javascript
// Runs daily at 8:00 PM IST
cron.schedule('0 20 * * *', async () => {
  // For each teacher without today's attendance:
  // 1. Mark as "Leave" with system remarks
  // 2. Update monthly statistics
  // 3. Send email notification
});
```

**Key Configuration:**
- **Schedule**: `'0 20 * * *'` (8 PM daily)
- **Timezone**: `Asia/Kolkata` (IST)
- **Status**: `Leave` (not Absent)
- **Marked By**: `admin` (system)

**Process Flow:**
1. Get current IST date
2. Fetch all teachers from database
3. For each teacher:
   - Check if attendance exists for today
   - If not, create Leave record
   - Update stats (increment leaves count)
   - Send email notification
4. Log results to console

#### 2. **Email Service** (`Backend/utils/emailService.js`)

**Enhanced Features:**
- 🎨 Professional HTML email template
- 📊 Color-coded status indicators
- 📝 Contextual messages based on status
- 🔒 Smart fallback when EMAIL_USER not configured

**Email Content:**
- **Subject**: `🏖️ Attendance Auto-Marked: Leave`
- **Message**: Explains auto-marking with time context
- **Design**: Responsive HTML with branded colors

#### 3. **Server Initialization** (`Backend/server.js`)

```javascript
const initAttendanceCron = require("./cron/attendanceCron");
initAttendanceCron(); // Starts the cron job on server start
```

### Frontend Components

#### 1. **Teacher Attendance Screen** (`ResultApp/src/screens/TeacherAttendanceScreen.tsx`)

**New Features:**
- `getTimeUntil8PM()` - Calculates countdown
- `isAutoMarked()` - Detects system-generated records
- Warning Banner (before 8 PM)
- Info Banner (after auto-marking)

**Warning Banner Shows:**
- ⏱️ Hours and minutes remaining
- 🏖️ "Auto-marked as Leave after 8 PM" message
- 🎨 Amber/Yellow theme

**Info Banner Shows:**
- ℹ️ Auto-marked notification
- 📅 Explanation of system behavior
- 🎨 Indigo/Blue theme

#### 2. **Teacher Dashboard** (`ResultApp/src/screens/TeacherDashboard.tsx`)

**New Features:**
- `attendanceStatus` state - Tracks today's status
- `getTimeUntil8PM()` - Countdown calculation
- Prominent warning banner at top
- Tappable banner navigates to attendance screen

**Dashboard Warning Shows:**
- ⏰ Countdown timer
- 👆 Clickable (navigates to attendance)
- 📍 Positioned before "Classes Today" card

---

## 📱 User Experience

### Before 8:00 PM

1. **Teacher Dashboard**
   ```
   ╔════════════════════════════════════════╗
   ║ ⏰ Mark Attendance Today               ║
   ║ 3h 45m left • Auto-marked as Leave    ║
   ║ after 8 PM                         →  ║
   ╚════════════════════════════════════════╝
   ```

2. **Attendance Screen**
   ```
   ╔════════════════════════════════════════╗
   ║ ⏰  Mark Before 8:00 PM                ║
   ║     3h 45m remaining                   ║
   ║     Attendance will be auto-marked as  ║
   ║     Leave after 8 PM                   ║
   ╚════════════════════════════════════════╝
   ```

### After 8:00 PM (Auto-Marked)

1. **Email Notification**
   ```
   Subject: 🏖️ Attendance Auto-Marked: Leave
   
   Your attendance for Feb 14, 2026 has been automatically
   marked as Leave because no entry was recorded by 8:00 PM.
   ```

2. **Attendance Screen**
   ```
   ╔════════════════════════════════════════╗
   ║ ℹ️  Auto-Marked Leave                  ║
   ║     Your attendance was automatically  ║
   ║     marked as Leave because no entry   ║
   ║     was recorded by 8:00 PM.           ║
   ╚════════════════════════════════════════╝
   ```

---

## 🎯 Business Logic

### Why "Leave" Instead of "Absent"?

1. **Professional Courtesy**: Assumes teachers had valid reasons
2. **Leave Tracking**: Maintains accurate leave balance
3. **Fair Treatment**: Doesn't penalize for technical issues
4. **Clear Intent**: Distinguishes system-generated from manual marks

### Attendance Record Structure

```javascript
{
  date: "2026-02-14T00:00:00.000Z",
  day: 14,
  status: "Leave",
  checkInTime: null,
  checkOutTime: null,
  location: {
    latitude: 0,
    longitude: 0,
    address: "System Auto-marked"
  },
  remarks: "Auto-marked as Leave - No attendance recorded by 8 PM",
  markedBy: "admin",  // Indicates system-generated
  workingHours: 0
}
```

---

## ⚙️ Configuration

### Environment Variables Required

```env
# Email Configuration (Backend/.env)
EMAIL_USER=school.admin@gmail.com
EMAIL_PASS=your_app_password_here
```

**Note**: If EMAIL_USER is not configured, cron job still runs but emails are logged to console instead of being sent.

### Timezone Settings

- **Default**: Asia/Kolkata (IST)
- **Cron Expression**: `'0 20 * * *'` (8:00 PM)
- **To Change**: Modify timezone parameter in cron.schedule()

### Time Adjustment

To change auto-mark time (e.g., to 9 PM):

```javascript
// In Backend/cron/attendanceCron.js
cron.schedule('0 21 * * *', async () => { // 9 PM
  // ... rest of code
});
```

---

## 🚀 Deployment Checklist

### Backend Setup

✅ **Cron Job Active**
- Initialized in server.js
- Logs startup message: "⏰ Attendance Auto-Mark Cron Job scheduled for 8:00 PM IST daily"

✅ **Email Configuration**
- EMAIL_USER and EMAIL_PASS set in .env
- Test email service before production

✅ **Database Connection**
- TeacherAttendance model accessible
- User model accessible
- MongoDB connection stable

### Frontend Setup

✅ **API Endpoints**
- `/api/teacher-attendance/today` - Fetch today's status
- Returns null when not marked, object when marked

✅ **Navigation**
- TeacherAttendance screen registered
- Dashboard can navigate to attendance

✅ **Theme Support**
- Banners adapt to light/dark mode
- Colors defined in theme context

---

## 📊 Monitoring & Logs

### Console Logs

**On Server Start:**
```
⏰ Attendance Auto-Mark Cron Job scheduled for 8:00 PM IST daily.
📌 Teachers who have not marked attendance by 8 PM will be automatically marked as Leave.
```

**Daily at 8:00 PM:**
```
🤖 Cron Job: Starting automated attendance check at 8 PM...
✅ Cron Job: Auto-marked 3 teachers as Leave (no attendance by 8 PM).
```

**If Email Sent:**
```
📧 Email sent: <message-id>
```

**If Email Disabled:**
```
⚠️ EMAIL_USER not set. Skipping email send.
Would have sent to: teacher@school.com
```

### Error Handling

- **Database Errors**: Logged but don't crash server
- **Email Errors**: Logged but don't stop cron execution
- **Timezone Issues**: Uses IST fallback

---

## 🧪 Testing

### Manual Testing

1. **Test Cron Schedule**
   ```javascript
   // Temporarily change to run every minute for testing
   cron.schedule('* * * * *', async () => {
     console.log('TEST: Cron running...');
   });
   ```

2. **Test Time Calculation**
   ```javascript
   // In React Native app console
   const timeUntil = getTimeUntil8PM();
   console.log(timeUntil); // { hours: 3, minutes: 45, isPast: false }
   ```

3. **Test Auto-Mark Detection**
   - Mark attendance as admin with status="Leave"
   - Check if info banner appears
   - Verify markedBy="admin" in database

### Production Verification

1. ✅ Wait until after 8:00 PM
2. ✅ Check console logs for cron execution
3. ✅ Verify teachers without attendance get Leave record
4. ✅ Check emails sent to affected teachers
5. ✅ Test frontend banners display correctly

---

## 🔐 Security Considerations

1. **System vs Manual**: `markedBy` field distinguishes sources
2. **Audit Trail**: All auto-marks have clear remarks
3. **Email Privacy**: Emails sent individually (not BCC)
4. **Location**: System marks use (0,0) with clear indicator

---

## 📈 Future Enhancements

### Potential Improvements

1. **Configurable Time**
   - Admin panel to set auto-mark time
   - Different times per department

2. **Notification Preferences**
   - SMS support in addition to email
   - Push notifications (React Native)

3. **Grace Period**
   - Warning at 7:30 PM
   - Final chance at 7:55 PM

4. **Holiday Detection**
   - Skip auto-marking on holidays
   - Integration with school calendar

5. **Analytics Dashboard**
   - Track auto-mark frequency
   - Identify patterns
   - Teacher insights

---

## 🆘 Troubleshooting

### Issue: Cron Not Running

**Solution:**
```javascript
// Check if cron is initialized in server.js
const initAttendanceCron = require("./cron/attendanceCron");
initAttendanceCron();
```

### Issue: Wrong Timezone

**Solution:**
```javascript
// Verify timezone in cron.schedule()
cron.schedule('0 20 * * *', async () => {...}, {
  timezone: "Asia/Kolkata" // Ensure this matches your region
});
```

### Issue: Emails Not Sending

**Solution:**
1. Check EMAIL_USER and EMAIL_PASS in .env
2. Enable "Less secure app access" for Gmail (or use App Password)
3. Check console for email error logs

### Issue: Banners Not Showing

**Solution:**
1. Verify `getTimeUntil8PM()` returns correct values
2. Check if attendanceStatus is null (should be for warning)
3. Ensure theme colors are defined
4. Test in both light and dark mode

---

## 📝 Summary

✅ **Automated** - Runs daily at 8 PM without manual intervention  
✅ **Professional** - Marks as Leave, not Absent  
✅ **Transparent** - Clear warnings and notifications  
✅ **Robust** - Error handling and logging  
✅ **User-Friendly** - Countdown timers and visual warnings  
✅ **Email Alerts** - Professional HTML notifications  
✅ **Theme Support** - Works in light and dark mode  
✅ **Scalable** - Handles multiple teachers efficiently  

---

## 📞 Support

For issues or questions about the auto-attendance system:
1. Check console logs in Backend
2. Verify email configuration in .env
3. Test with temporary minute-based cron
4. Review attendance records in MongoDB

**System Status:** ✅ Fully Operational

**Last Updated:** February 14, 2026

---

*Built with professional standards for Result Management System*
