# Production Setup - Complete Configuration

Your system is configured and deployed to production!

---

## 🌐 Production URLs

### Backend (Render)
**URL:** `https://result-portal-tkom.onrender.com`  
**API Base:** `https://result-portal-tkom.onrender.com/api`  
**Status:** ✅ Active

### Database (MongoDB Atlas)
**Connection:** `mongodb+srv://aryapatelcg:***@cluster1.k2ox7.mongodb.net/studentResults`  
**Status:** ✅ Connected

### Email Service (Gmail SMTP)
**From:** `aryapatel.cg@gmail.com`  
**Status:** ✅ Configured with App Password

---

## ✅ Current Configuration

### Backend Environment (Render)

Your backend on Render should have these environment variables:

```env
# Database
MONGO_URI=mongodb+srv://aryapatelcg:arya2302@cluster1.k2ox7.mongodb.net/studentResults?retryWrites=true&w=majority

# Authentication
JWT_SECRET=fb9c8102fb2da59d16acb142e524f181b9679d4201e3f0c9a423685becf68132eff5609ab98896bcd2ef00647b6dbc8408672412bfd0e9002ab8c9e77b0bd520

# Admin Credentials
ADMIN_EMAIL=vipulunjha@gmail.com
ADMIN_PASSWORD=Kamli@0409

# Server
PORT=5000
NODE_ENV=production

# ⚠️ CRITICAL: Timezone for cron jobs!
TZ=Asia/Kolkata

# School Location
SCHOOL_LATITUDE=22.81713251852116
SCHOOL_LONGITUDE=72.47335209589137
SCHOOL_ATTENDANCE_RADIUS_KM=3

# Email (Gmail)
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=aryapatel.cg@gmail.com
EMAIL_PASSWORD=wzag mjkt zkxd gczk
EMAIL_FROM_NAME=School Management System

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-url-here.vercel.app
CORS_ORIGIN=https://your-frontend-url-here.vercel.app
```

### Frontend Environment

**Production Build (.env.production):**
```env
VITE_API_URL=https://result-portal-tkom.onrender.com/api
VITE_SCHOOL_LATITUDE=22.81713251852116
VITE_SCHOOL_LONGITUDE=72.47335209589137
VITE_SCHOOL_ATTENDANCE_RADIUS_KM=3
```

**Local Development (.env):**
```env
VITE_API_URL=http://localhost:5000/api
# OR to test with production:
# VITE_API_URL=https://result-portal-tkom.onrender.com/api
```

### React Native App

**Config:** `ResultApp/src/config/api.config.ts`
```typescript
CURRENT_MODE: 'PRODUCTION'
BASE_URL: 'https://result-portal-tkom.onrender.com/api'
```

✅ **Status:** Already configured correctly!

---

## 🚀 Deployment Steps

### 1. ✅ Backend is Deployed (Render)

Your backend is already live at: `https://result-portal-tkom.onrender.com`

**Verify it's working:**
```powershell
# Test backend health
Invoke-RestMethod -Uri "https://result-portal-tkom.onrender.com/api/system-config" | ConvertTo-Json
```

**Check Render Dashboard:**
1. Go to render.com dashboard
2. Find your service
3. Check "Environment" tab
4. **CRITICAL:** Ensure `TZ=Asia/Kolkata` is set!

**To update environment variables:**
1. Render Dashboard → Your Service
2. Environment tab
3. Add/Update variables
4. Click "Save Changes"
5. Service will auto-redeploy

### 2. Deploy Frontend (Web App)

**Option A: Vercel (Recommended)**

```powershell
# Install Vercel CLI
npm install -g vercel

# Navigate to Frontend
cd Frontend

# Build production
npm run build

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard:
# VITE_API_URL = https://result-portal-tkom.onrender.com/api
```

**Option B: Netlify**

```powershell
cd Frontend
npm run build

# Drag & drop 'dist' folder to netlify.com
# Or use Netlify CLI
```

**Option C: Render Static Site**

1. Connect GitHub repo
2. Root directory: `Frontend`
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variable: `VITE_API_URL`

### 3. Deploy React Native App (Mobile)

**Android APK:**
```bash
cd ResultApp
npm run android:release

# Or build APK:
cd android
./gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

**iOS:**
```bash
cd ResultApp
cd ios
pod install
# Open Xcode and build for release
```

**App Configuration:**
- ✅ Already set to PRODUCTION mode
- ✅ API URL: `https://result-portal-tkom.onrender.com/api`
- No changes needed!

---

## 🔧 Render-Specific Configuration

### Critical Settings for Render

**1. Environment Variables (MUST HAVE):**

In Render Dashboard → Environment:
```
TZ = Asia/Kolkata    ← CRITICAL for cron jobs!
NODE_ENV = production
MONGO_URI = your-mongodb-atlas-uri
JWT_SECRET = your-secret
EMAIL_USER = aryapatel.cg@gmail.com
EMAIL_PASSWORD = wzag mjkt zkxd gczk
```

**2. Build Command:**
```
npm install
```

**3. Start Command:**
```
npm start
```
or
```
node server.js
```

**4. Health Check Path:**
```
/api/system-config
```

**5. Auto-Deploy:**
- ✅ Enable auto-deploy from Git
- Branch: main (or master)

### Render Free Tier Limitations

⚠️ **IMPORTANT:** Render free tier has limitations:

1. **Inactivity Spindown:**
   - Service spins down after 15 minutes of inactivity
   - **Cron jobs WILL NOT RUN when service is asleep!**
   - First request after sleep takes 30-60 seconds (cold start)

2. **Solution:**
   - Upgrade to Render Paid Tier ($7/month)
   - OR use external service to ping your backend every 10 minutes
   - OR use Railway instead (free tier doesn't sleep)

**Ping Service Setup (Keep Render Awake):**

Use a free service like:
- UptimeRobot.com
- Cron-job.org
- Pingdom

Configure to ping: `https://result-portal-tkom.onrender.com/api/system-config` every 10 minutes

---

## 🤖 Cron Jobs on Render

### How Cron Works on Render

✅ **Cron jobs work on Render** - they're built into your backend!

**Your Active Cron Jobs:**
1. **Teacher Attendance Auto-Mark:** 6:05 PM IST daily
2. **Student Attendance Auto-Mark:** 8:00 PM IST daily

**How They Initialize:**
```javascript
// server.js runs on startup
startTeacherAttendanceCron(); // ← Registers cron
// Cron runs at scheduled time if service is awake
```

**CRITICAL Requirement:**
```env
TZ=Asia/Kolkata  ← MUST be set in Render environment!
```

**Verify Cron is Running:**

Check Render Logs:
1. Render Dashboard → Your Service
2. "Logs" tab
3. Look for: `✅ Teacher Attendance Cron Initialized`

**At 6:05 PM IST, you should see:**
```
⏰ Running teacher attendance auto-mark...
✅ Successfully marked X teachers as leave
```

### Problem: Free Tier Sleep

**Issue:** If service is asleep at 6:05 PM, cron won't run!

**Solutions:**

1. **Upgrade to Paid Tier ($7/month):**
   - Service stays awake 24/7
   - Cron runs reliably

2. **Use Ping Service:**
   - Keep service awake with regular pings
   - Set up ping at 5:55 PM IST (10 min before cron)

3. **Switch to Railway:**
   - Railway free tier doesn't sleep
   - 500 hours/month (enough for 24/7 if optimized)

---

## 🧪 Testing Production Setup

### 1. Test Backend API

```powershell
# Test base endpoint
Invoke-RestMethod -Uri "https://result-portal-tkom.onrender.com/api/system-config"

# Login as admin
$loginData = @{
    email = "vipulunjha@gmail.com"
    password = "Kamli@0409"
    role = "admin"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://result-portal-tkom.onrender.com/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"

$token = $response.token
Write-Host "Token: $token"

# Test protected endpoint
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "https://result-portal-tkom.onrender.com/api/system-config/teacher-attendance-settings" -Headers $headers
```

### 2. Test Frontend Build

```powershell
cd Frontend

# Build with production env
npm run build

# Preview production build
npm run preview

# Should connect to: https://result-portal-tkom.onrender.com/api
```

### 3. Test React Native App

**Android Emulator:**
```bash
cd ResultApp

# Ensure CURRENT_MODE is 'PRODUCTION' in api.config.ts
npm run android

# Test login, attendance, etc.
# Should connect to production backend
```

### 4. Test Cron Jobs

**Method 1: Manual Trigger**

Login to web app as admin → Teacher Attendance → Automation Settings → Click "Test Now"

**Method 2: API Call**

```powershell
# Use admin token from login
$headers = @{
    "Authorization" = "Bearer YOUR_TOKEN_HERE"
}

Invoke-RestMethod -Uri "https://result-portal-tkom.onrender.com/api/system-config/test-teacher-attendance" -Method POST -Headers $headers
```

**Method 3: Wait for Scheduled Time**

- Wait until 6:05 PM IST
- Check Render logs
- Verify attendance records in database

---

## 📊 Monitoring Production

### Daily Checks

**1. Check Render Service Status:**
- Render Dashboard → Service → Status should be "Live"

**2. Check Cron Execution:**
- View Render logs at 6:05 PM IST
- Look for: "Running teacher attendance auto-mark..."

**3. Check Database:**
```javascript
// MongoDB Atlas dashboard
// Collection: teacherattendances
// Filter: { leaveType: "Auto-marked", date: today }
```

**4. Check Email Notifications:**
- Verify teachers received auto-mark emails

### Weekly Tasks

**1. Review Attendance Data:**
- Login as admin
- Check attendance summary
- Verify automation is working

**2. Check Render Logs:**
- Look for errors or warnings
- Verify service uptime

**3. Test Key Features:**
- Student login
- Teacher attendance marking
- Result viewing
- Timetable access

---

## 🐛 Troubleshooting Production Issues

### Issue: Backend Not Responding

**Check:**
1. Render Dashboard - Is service running?
2. Check logs for errors
3. Verify environment variables are set

**Solutions:**
```powershell
# Manual redeploy from Render dashboard
# OR push update to Git (triggers auto-deploy)

git add .
git commit -m "Trigger redeploy"
git push
```

### Issue: Cron Not Running

**Diagnosis:**
```
Check Render logs:
1. Is service awake at 6:05 PM?
2. Do you see cron initialization?
3. Is TZ=Asia/Kolkata set?
```

**Solutions:**
1. Set `TZ=Asia/Kolkata` in Render environment
2. Upgrade to paid tier (if free tier sleeping)
3. Set up ping service to keep awake
4. Manual redeploy

### Issue: Database Connection Errors

**Check:**
1. MongoDB Atlas cluster is running
2. IP whitelist includes `0.0.0.0/0` (allow all)
3. Database user credentials are correct
4. Connection string is correct

**Solutions:**
```
1. MongoDB Atlas → Network Access → Add IP: 0.0.0.0/0
2. Verify MONGO_URI in Render environment
3. Test connection from Render logs
```

### Issue: Email Not Sending

**Check:**
1. Gmail App Password is correct (not regular password)
2. 2-Step Verification is enabled on Gmail
3. App Password hasn't expired

**Solutions:**
```
1. Generate new App Password:
   - Google Account → Security → 2-Step Verification → App Passwords
2. Update EMAIL_PASSWORD in Render environment
3. Redeploy service
```

### Issue: CORS Errors from Frontend

**Check:**
```
Render logs showing: "CORS policy blocked..."
```

**Solution:**
```javascript
// Update CORS_ORIGIN in Render environment
CORS_ORIGIN = https://your-frontend-url.vercel.app

// OR allow all (not recommended for production):
CORS_ORIGIN = *
```

---

## 📱 Mobile App Production Notes

### React Native App Status

✅ **Already configured for production!**

**Current Settings:**
- Mode: `PRODUCTION`
- Backend: `https://result-portal-tkom.onrender.com/api`
- No changes needed

### Building Production APK

```bash
cd ResultApp

# Android Release Build
npm run android:release

# Or manually:
cd android
./gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

### Distribution Options

**1. Google Play Store:**
- Create Play Console account
- Upload APK/AAB
- Set up app listing
- Publish

**2. Direct Distribution:**
- Share APK file directly
- Users enable "Install from Unknown Sources"
- Install APK

**3. Internal Testing:**
- Use Firebase App Distribution
- Share with beta testers

---

## ✅ Production Checklist

### Backend (Render)
- [x] Service deployed and running
- [x] MongoDB Atlas connected
- [x] Environment variables configured
- [ ] **CRITICAL:** `TZ=Asia/Kolkata` set in Render
- [x] Email service configured
- [x] JWT authentication working
- [ ] Cron jobs initialized (check logs)
- [ ] Consider upgrading to paid tier (for 24/7 uptime)

### Frontend (Web)
- [ ] Build production bundle
- [ ] Deploy to Vercel/Netlify/Render
- [ ] Update `CORS_ORIGIN` in backend
- [ ] Test all features with production API
- [ ] Verify login, attendance, results work

### Mobile App (React Native)
- [x] API configured to production
- [ ] Build release APK/IPA
- [ ] Test on real devices
- [ ] Distribute to users

### Database
- [x] MongoDB Atlas cluster running
- [x] IP whitelist includes all IPs (0.0.0.0/0)
- [x] Database user has read/write permissions
- [ ] Verify systemconfigs collection exists
- [ ] Test database queries work

### Email
- [x] Gmail SMTP configured
- [x] App Password created
- [ ] Test email sending works
- [ ] Verify teachers receive notifications

### Cron Jobs
- [ ] **VERIFY:** `TZ=Asia/Kolkata` in Render
- [ ] Check logs show cron initialized
- [ ] Wait for 6:05 PM IST, verify cron runs
- [ ] Check database for auto-marked records
- [ ] Consider ping service (if free tier)

### Monitoring
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Enable Render email alerts
- [ ] Check logs daily
- [ ] Monitor database size/usage
- [ ] Track email sending limits

---

## 📞 Quick Reference

### Production URLs
- **Backend:** https://result-portal-tkom.onrender.com
- **API Base:** https://result-portal-tkom.onrender.com/api
- **Frontend:** (Deploy and add here)

### Admin Login
- **Email:** vipulunjha@gmail.com
- **Password:** Kamli@0409

### Important Times (IST)
- **Teacher Attendance Cron:** 6:05 PM daily
- **Student Attendance Cron:** 8:00 PM daily

### Support Documents
- [CRON_JOBS_EXPLAINED.md](CRON_JOBS_EXPLAINED.md) - How cron works
- [AUTOMATION_WORKFLOW.md](AUTOMATION_WORKFLOW.md) - Automation details
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Deployment steps

---

## 🎯 Next Steps

1. **CRITICAL:** Add `TZ=Asia/Kolkata` to Render environment variables
2. Deploy frontend to Vercel/Netlify
3. Update `CORS_ORIGIN` in backend with frontend URL
4. Test complete flow: login → attendance → cron test
5. Set up uptime monitoring
6. Consider upgrading Render to paid tier ($7/month) for 24/7 uptime
7. Build and distribute React Native app

---

**Last Updated:** February 16, 2026  
**Backend:** Render (Live)  
**Database:** MongoDB Atlas (Connected)  
**Status:** ✅ Production Ready  
**Cron Jobs:** ⚠️ Verify timezone setting!
