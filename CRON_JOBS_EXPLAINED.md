# Cron Jobs - Deployment & How They Work

## 🤔 Your Question: "Does cron work when deployed or only on localhost?"

### ✅ **SHORT ANSWER:**
**YES! Cron jobs work BOTH on localhost AND when deployed to production!**

The cron jobs are **built into your backend server** using Node.js `node-cron` package. They run automatically whenever your backend server is running, whether that's:
- ✅ Your local computer (localhost)
- ✅ Production server (Heroku, Railway, DigitalOcean, AWS, etc.)
- ✅ Any cloud hosting platform

---

## 🔄 How Cron Jobs Work in This System

### What is a Cron Job?
A **cron job** is a scheduled task that runs automatically at specific times without manual intervention.

Think of it like an alarm clock for your code:
- ⏰ Set it once
- 🤖 It runs automatically every day
- 📅 No need to manually trigger it

### Your System's Cron Jobs

You have **TWO** automated cron jobs in this system:

#### 1. **Teacher Attendance Auto-Mark** 
- **File:** `Backend/cron/teacherAttendanceCron.js`
- **Schedule:** Every day at **6:05 PM IST** (Indian Standard Time)
- **What it does:** Automatically marks absent teachers as "Leave"
- **Expression:** `'5 18 * * *'` (hour 18, minute 05)

#### 2. **Student Attendance Auto-Mark**
- **File:** `Backend/cron/attendanceCron.js`
- **Schedule:** Every day at **8:00 PM IST**
- **What it does:** Automatically marks absent students
- **Expression:** `'0 20 * * *'` (hour 20, minute 00)

---

## 🚀 How Cron Jobs Start

### Automatic Startup Process

When your backend server starts (anywhere - localhost or production), here's what happens:

**1. Server Initialization** (`Backend/server.js`)
```javascript
// server.js runs when you do 'npm start'

const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// 🤖 START CRON JOBS AUTOMATICALLY
console.log('🚀 Initializing Automated Cron Jobs...');

// Start Student Attendance Cron
initAttendanceCron(); 

// Start Teacher Attendance Cron
startTeacherAttendanceCron(); 

console.log('✅ All Cron Jobs Started!');

// Start Express server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**2. Cron Job Registration** (`Backend/cron/teacherAttendanceCron.js`)
```javascript
const cron = require('node-cron');

// This function is called when server starts
function startTeacherAttendanceCron() {
  // Schedule the job
  cron.schedule('5 18 * * *', async () => {
    console.log('⏰ Running teacher attendance auto-mark...');
    await autoMarkTeacherAttendance();
  }, {
    timezone: 'Asia/Kolkata'  // ← CRITICAL! Uses IST
  });
  
  console.log('✅ Teacher Attendance Cron Initialized (Runs at 6:05 PM IST daily)');
}
```

**3. Cron Runs Automatically**
- Once scheduled, `node-cron` keeps it in memory
- Every day at 6:05 PM IST, it triggers automatically
- No manual intervention needed
- Runs as long as server is running

---

## 💻 Localhost vs Production - What's the Difference?

### On Localhost (Development)

```bash
# Terminal
cd Backend
npm start

# Output:
# ✅ MongoDB connected successfully
# 🚀 Initializing Automated Cron Jobs...
# ✅ Teacher Attendance Cron Initialized (Runs at 6:05 PM IST daily)
# ✅ Student Attendance Cron Initialized (Runs at 8:00 PM IST daily)
# ✅ All Cron Jobs Started!
# 🚀 Server running on port 5000
```

**How it works:**
1. You run `npm start` in terminal
2. Server starts on your computer
3. Cron jobs initialize automatically
4. They run every day at scheduled times
5. **BUT:** If you close terminal or shut down computer, server stops → cron stops too

**Good for:** Testing, development, debugging

---

### On Production Server (Deployed)

```bash
# On Heroku/Railway/VPS/AWS/DigitalOcean
# Server runs 24/7 in the cloud
npm start
# OR
node server.js
# OR
pm2 start server.js --name school-backend

# Output (same as localhost):
# ✅ MongoDB connected successfully
# 🚀 Initializing Automated Cron Jobs...
# ✅ Teacher Attendance Cron Initialized (Runs at 6:05 PM IST daily)
# ✅ All Cron Jobs Started!
# 🚀 Server running on port 5000
```

**How it works:**
1. You deploy code to cloud server
2. Server starts automatically (24/7)
3. Cron jobs initialize automatically
4. They run every day at scheduled times
5. **Server never stops** (unless you manually stop it or it crashes)

**Good for:** Real-world usage, automatic daily operations

---

## 🌍 Deployment Platforms & Cron Support

### ✅ Platforms That Support Node-Cron

All major platforms support `node-cron` because it's **in-process** (runs inside your Node.js server):

| Platform | Support | Notes |
|----------|---------|-------|
| **Heroku** | ✅ Full Support | Works perfectly. Free tier may sleep after 30 min inactivity (upgrade to hobby/paid to keep running 24/7) |
| **Railway** | ✅ Full Support | Always running, no sleep issues |
| **DigitalOcean** | ✅ Full Support | VPS - full control, always running with PM2 |
| **AWS EC2** | ✅ Full Support | VPS - full control, always running |
| **Render** | ✅ Full Support | Free tier may sleep, paid tier runs 24/7 |
| **Vercel** | ❌ Not Recommended | Serverless - not suitable for long-running cron jobs |
| **Netlify** | ❌ Not Recommended | Static hosting - cannot run backend cron |

---

## ⚙️ Environment Configuration for Cron Jobs

### CRITICAL: Timezone Setting

For cron jobs to run at the **correct IST time**, you MUST set timezone:

**In `.env` file:**
```env
TZ=Asia/Kolkata
```

**Why this matters:**

Without timezone setting:
```
Your server timezone: UTC (default)
Cron scheduled for: 18:05 IST
Actual run time: 12:35 UTC (wrong!)
```

With timezone setting:
```
Your server timezone: Asia/Kolkata (IST)
Cron scheduled for: 18:05 IST
Actual run time: 18:05 IST (correct!)
```

### How to Set Timezone on Different Platforms

**Heroku:**
```bash
heroku config:set TZ=Asia/Kolkata
```

**Railway:**
```
Dashboard → Variables → Add:
TZ = Asia/Kolkata
```

**Vercel/Netlify:**
```
Project Settings → Environment Variables:
TZ = Asia/Kolkata
```

**VPS (DigitalOcean/AWS):**
```bash
# In .env file
TZ=Asia/Kolkata

# Or set system timezone
sudo timedatectl set-timezone Asia/Kolkata
```

**Docker:**
```dockerfile
ENV TZ=Asia/Kolkata
```

---

## 🧪 Testing Cron Jobs

### Before Deployment (Localhost)

**Method 1: Wait for scheduled time**
```bash
# Start server
cd Backend
npm start

# Wait until 6:05 PM IST
# Watch console logs - you'll see:
# ⏰ Running teacher attendance auto-mark...
# ✅ Successfully marked 3 teachers as leave
```

**Method 2: Force run immediately (Recommended)**
```bash
# Use the Test button in web UI
1. Login as admin
2. Go to Teacher Attendance page
3. Click "Automation Settings"
4. Click "Test Now" button
5. See results immediately
```

**Method 3: Temporary schedule change** (for testing only)
```javascript
// teacherAttendanceCron.js - TEMPORARY CHANGE FOR TESTING

// Change from:
cron.schedule('5 18 * * *', async () => {  // 6:05 PM

// To (runs every minute):
cron.schedule('* * * * *', async () => {  // Every minute

// REMEMBER TO CHANGE BACK AFTER TESTING!
```

### After Deployment (Production)

**Method 1: Check logs at scheduled time**

Heroku:
```bash
heroku logs --tail | Select-String "attendance"
```

Railway:
```
Dashboard → Deployments → Logs (real-time)
```

VPS:
```bash
pm2 logs school-backend
# OR
tail -f /var/log/school-backend.log
```

**Method 2: Use Test API endpoint**
```powershell
# Get admin token from browser
$token = "your-admin-token-here"

# Call test endpoint
Invoke-RestMethod -Uri "https://your-backend.herokuapp.com/api/system-config/test-teacher-attendance" -Method POST -Headers @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
```

**Method 3: Check database**
```javascript
// MongoDB Atlas dashboard or Compass
// Check collection: teacherattendances
// Look for recent auto-marked records

db.teacherattendances.find({
  leaveType: "Auto-marked",
  date: { $gte: new Date("2026-02-16T00:00:00") }
}).sort({ createdAt: -1 })
```

---

## 📊 Monitoring Cron Jobs in Production

### Daily Health Checks

**What to monitor:**
1. ✅ Backend server is running (24/7 uptime)
2. ✅ Cron logs show execution at scheduled time
3. ✅ Database has new attendance records
4. ✅ Email notifications sent (if enabled)

**Example monitoring script** (run daily):
```powershell
# check-cron-health.ps1

$backendUrl = "https://your-backend.herokuapp.com"
$adminToken = "your-token"

# Check server status
$status = Invoke-RestMethod -Uri "$backendUrl/api/system-config"
Write-Host "✅ Backend is online" -ForegroundColor Green

# Check last cron run (you'd need to add an endpoint for this)
# OR check database directly for recent auto-marks

# Check today's auto-marked attendance
Write-Host "Checking today's auto-marks..." -ForegroundColor Yellow
# Query MongoDB for count of auto-marked records
```

### Setting Up Alerts

**Option 1: Email alerts** (if cron fails)
Add to your cron job:
```javascript
cron.schedule('5 18 * * *', async () => {
  try {
    await autoMarkTeacherAttendance();
    // Send success email to admin
  } catch (error) {
    // Send failure alert email
    await sendAdminAlert('Cron job failed', error.message);
  }
});
```

**Option 2: Logging service**
- Use **Logtail**, **Papertrail**, or **Sentry**
- Automatically monitor logs
- Get alerts if cron doesn't run

**Option 3: Uptime monitoring**
- Use **UptimeRobot**, **Pingdom**
- Ping your backend every 5 minutes
- Alert if server goes down

---

## 🐛 Troubleshooting Cron Issues

### Issue: Cron not running on production

**Diagnosis:**
```bash
# Check backend logs
heroku logs --tail

# Look for:
# "✅ Teacher Attendance Cron Initialized"
```

**Solutions:**

1. **Server not running 24/7:**
   ```
   Problem: Heroku free tier sleeps after 30 min
   Solution: Upgrade to Hobby tier ($7/month) OR use Railway (free, no sleep)
   ```

2. **Timezone wrong:**
   ```bash
   # Set timezone environment variable
   heroku config:set TZ=Asia/Kolkata
   
   # Restart server
   heroku restart
   ```

3. **Code not deployed:**
   ```bash
   # Ensure latest code is pushed
   git push heroku main
   ```

4. **Environment variables missing:**
   ```bash
   # Check all env vars are set
   heroku config
   
   # Should see: TZ, MONGO_URI, JWT_SECRET, etc.
   ```

### Issue: Cron runs at wrong time

**Diagnosis:**
```javascript
// Add logging to see actual time
cron.schedule('5 18 * * *', async () => {
  const now = moment.tz('Asia/Kolkata');
  console.log(`Current IST time: ${now.format('YYYY-MM-DD HH:mm:ss')}`);
  await autoMarkTeacherAttendance();
});
```

**Solutions:**

1. **Set TZ environment variable** (most common fix)
2. **Verify timezone in code:**
   ```javascript
   cron.schedule('5 18 * * *', async () => {
     // ...
   }, {
     timezone: 'Asia/Kolkata'  // ← Must be here!
   });
   ```

### Issue: Cron doesn't run on weekends

**This is by design!** Check your settings:
```javascript
// In automation settings
excludeWeekends: true  // ← Skips Sundays

// Change to:
excludeWeekends: false  // Runs every day
```

---

## 📚 Summary - Cron Jobs Quick Reference

### Where Cron Jobs Work

| Location | Works? | Notes |
|----------|--------|-------|
| Localhost | ✅ YES | While `npm start` is running |
| Heroku | ✅ YES | Free tier sleeps, Hobby+ runs 24/7 |
| Railway | ✅ YES | Always running, recommended |
| DigitalOcean | ✅ YES | Full control, use PM2 |
| AWS EC2 | ✅ YES | Full control, use PM2 |
| Vercel | ❌ NO | Serverless, not suitable |

### Key Requirements

✅ Backend server must be running 24/7  
✅ Environment variable: `TZ=Asia/Kolkata`  
✅ MongoDB connection active  
✅ `node-cron` package installed  
✅ Cron initialization in `server.js`  

### Cron Schedule Format

```
* * * * *
│ │ │ │ │
│ │ │ │ └─ Day of week (0-6, Sunday=0)
│ │ │ └─── Month (1-12)
│ │ └───── Day of month (1-31)
│ └─────── Hour (0-23)
└───────── Minute (0-59)

Examples:
'5 18 * * *'  → 6:05 PM every day
'0 20 * * *'  → 8:00 PM every day
'0 9 * * 1'   → 9:00 AM every Monday
'*/15 * * * *' → Every 15 minutes
```

### Testing Checklist

Before Production:
- [ ] Test cron on localhost (use Test button)
- [ ] Verify timezone is IST
- [ ] Check database for auto-marked records
- [ ] Test email notifications
- [ ] Verify settings save/load correctly

After Deployment:
- [ ] Check server logs show cron initialized
- [ ] Wait for 6:05 PM IST, verify cron runs
- [ ] Check database for new records
- [ ] Monitor for 3-5 days to ensure consistency
- [ ] Set up monitoring/alerts

---

## ✅ Final Answer to Your Question

**Q: "Does the cron job work if backend and frontend are deployed, or only on localhost?"**

**A: Cron jobs work on BOTH localhost and deployed servers!**

✅ **Localhost:** Works while your terminal is running `npm start`  
✅ **Deployed:** Works 24/7 as long as backend server is running  
✅ **Built-in:** No external cron service needed (uses `node-cron`)  
✅ **Automatic:** Starts when server starts, runs at scheduled times  
✅ **Platform-independent:** Works on Heroku, Railway, VPS, AWS, etc.  

**The key is:** Your backend server must be running continuously. On localhost, it stops when you close the terminal. On production, it runs 24/7 in the cloud.

---

**Documentation Files:**
- Full automation explanation: `AUTOMATION_WORKFLOW.md`
- Deployment guide: `DEPLOYMENT_GUIDE.md`
- Environment setup: `Backend/.env.example`
- Verification script: `verify-automation.ps1`

**Last Updated:** February 16, 2026  
**Status:** Production Ready ✅
