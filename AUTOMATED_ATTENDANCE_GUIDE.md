# 🤖 Automated Attendance System

## Overview
The system automatically marks teachers as **"Leave"** if they don't submit their attendance by **8:00 PM IST** daily.

---

## 🎯 Features

### 1. **Automatic Daily Marking** ⏰
- **Schedule**: Runs every day at 8:00 PM IST
- **Action**: Auto-marks absent teachers as "Leave"
- **Weekend Skip**: Automatically skips Saturdays and Sundays
- **Email Alerts**: Sends notification emails to affected teachers

### 2. **Manual Trigger** 🔘
- Admin can manually trigger auto-marking anytime
- Located in: **Admin Dashboard → Attendance Screen**
- Shows confirmation before marking
- Displays detailed summary after completion

### 3. **Smart Detection** 🧠
- Only marks teachers who haven't submitted attendance
- Skips already-marked records
- Handles timezone correctly (Asia/Kolkata IST)
- Prevents duplicate entries

---

## 📋 How It Works

### Automatic Cron Job
```
Every day at 8:00 PM IST:
1. Fetches all active teachers
2. Checks today's attendance records
3. Marks absent teachers as "Leave"
4. Updates monthly statistics
5. Sends email notifications
```

### Manual Trigger (Admin)
```
Admin clicks "Auto-Mark" button:
1. Shows confirmation dialog
2. Triggers marking process immediately
3. Displays results:
   - Total teachers checked
   - Teachers marked as Leave
   - Teachers already marked
```

---

## 🔧 Technical Details

### Backend Components

#### **1. Cron Job** (`Backend/cron/attendanceCron.js`)
- Scheduled task using `node-cron`
- Runs at: `0 20 * * *` (8:00 PM daily)
- Timezone: Asia/Kolkata (IST)
- Function: `autoMarkAbsentTeachers()`

#### **2. API Endpoint**
```javascript
POST /api/admin/attendance/auto-mark-leaves
```
- Authentication: Admin only
- Returns: Detailed marking report

#### **3. Database Model** (`TeacherAttendance`)
```javascript
{
  teacher: ObjectId,
  month: "MM-YYYY",
  records: [{
    date: Date,
    day: Number,
    status: "Present" | "Absent" | "Half-Day" | "Leave",
    remarks: "Automatically marked as Leave...",
    markedBy: "admin"
  }],
  stats: { present, absent, leaves, halfDay }
}
```

### Frontend Components

#### **AdminAttendanceScreen.tsx**
- **Auto-Mark Button**: Top-right of attendance screen
- **Confirmation Dialog**: Prevents accidental triggering
- **Loading Indicator**: Shows progress during marking
- **Success Alert**: Displays detailed results

---

## 📊 Attendance Logic

### Status Types
1. **Present** ✅ - Teacher marked attendance on time
2. **Absent** ❌ - Manually marked by admin
3. **Half-Day** ⏳ - Partial day attendance
4. **Leave** 📅 - Auto-marked or applied leave

### Auto-Marking Rules
```
IF (current_time >= 8:00 PM IST) AND 
   (teacher has NOT marked attendance today) AND
   (today is NOT weekend)
THEN
   Mark as "Leave"
   Send email notification
   Update monthly stats
```

---

## 🚀 Testing

### Test Auto-Marking Manually
1. Login as **Admin**
2. Go to **Attendance Screen**
3. Click **"Auto-Mark"** button (top-right)
4. Confirm the action
5. View results showing:
   - Teachers checked
   - Teachers marked as Leave
   - Already marked count

### Verify Cron Job
Check backend logs after 8:00 PM:
```
✅ Cron Job: Auto-marked X teachers as Leave
📋 Summary: X teachers auto-marked as Leave
```

---

## ⚙️ Configuration

### Modify Cron Schedule
Edit `Backend/cron/attendanceCron.js`:
```javascript
// Change time (currently 8:00 PM)
cron.schedule('0 20 * * *', async () => {
    // 0 = minute
    // 20 = hour (8 PM)
    // * = any day
    // * = any month
    // * = any day of week
});
```

### Enable/Disable Weekends
```javascript
// Skip weekends (current behavior)
if (dayOfWeek === 0 || dayOfWeek === 6) {
    console.log('⏭️ Skipping auto-attendance (Weekend)');
    return;
}

// To include weekends, comment out the above code
```

### Customize Email Notifications
Edit `Backend/utils/emailService.js`:
```javascript
sendAttendanceAlert({
    email: teacher.email,
    name: teacher.name,
    date: istDate,
    status: 'Leave'
});
```

---

## 📱 Mobile App Integration

### For Teachers
- Attendance must be marked before 8:00 PM to avoid auto-Leave
- Check attendance status in Teacher Dashboard
- View monthly attendance calendar

### For Admins
- Monitor daily attendance in real-time
- Manually trigger auto-marking anytime
- View detailed reports and statistics
- Export attendance data

---

## 🔐 Security

- **Admin-only access** for manual triggers
- **JWT authentication** required for API calls
- **Confirmation dialogs** prevent accidental actions
- **Audit trail** maintains who marked what

---

## 🐛 Troubleshooting

### Cron Not Running
1. Check if backend server is running
2. Verify logs: `console.log('⏰ Attendance Auto-Mark Cron Job scheduled...')`
3. Ensure timezone is set correctly
4. Check for errors in backend console

### Manual Trigger Not Working
1. Verify admin authentication
2. Check API endpoint in network tab
3. Ensure backend route is registered
4. Check for CORS issues

### Teachers Not Receiving Emails
1. Verify `.env` has email configuration
2. Check teacher has valid email in database
3. Review email service logs
4. Test with `sendAttendanceAlert()` function

---

## 📈 Benefits

1. **No Manual Work**: Automatic marking saves admin time
2. **Accurate Records**: No missed attendance entries
3. **Fair System**: Teachers know the 8 PM deadline
4. **Email Alerts**: Teachers notified of auto-marking
5. **Weekend Skip**: Smart handling of non-working days
6. **On-Demand**: Admin can trigger anytime for testing

---

## 🔄 Future Enhancements

- [ ] Configurable deadline time (not fixed at 8 PM)
- [ ] Holiday management (skip public holidays)
- [ ] Grace period notifications (7 PM warning)
- [ ] SMS notifications in addition to email
- [ ] Bulk leave applications for groups
- [ ] Attendance prediction & analytics

---

## 📞 Support

For issues or questions:
1. Check backend logs for errors
2. Verify database attendance records
3. Test manual trigger from admin panel
4. Review cron job schedule settings

---

**Last Updated**: February 14, 2026  
**System Status**: ✅ Active & Running  
**Auto-Mark Time**: 8:00 PM IST Daily
