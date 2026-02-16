# Deployment Guide - Teacher Attendance Automation

Complete guide for deploying the automated teacher attendance system to production.

---

## 📋 Pre-Deployment Checklist

### Backend Requirements
- [x] Node.js 14+ installed
- [x] MongoDB database accessible
- [x] SMTP email service configured
- [x] Environment variables ready
- [x] Server timezone set to Asia/Kolkata

### Frontend Requirements
- [x] Node.js 14+ installed
- [x] Build environment configured
- [x] Hosting service selected (Vercel, Netlify, etc.)
- [x] API base URL configured

---

## 🚀 Backend Deployment

### Step 1: Environment Configuration

Create `.env` file in `Backend/` directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/school_db
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/school_db

# Server
PORT=5000
NODE_ENV=production

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Timezone (CRITICAL for cron jobs)
TZ=Asia/Kolkata

# Email Service (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=School Admin <your-email@gmail.com>

# CORS (adjust for your frontend URL)
CORS_ORIGIN=http://localhost:5173
# OR for production:
# CORS_ORIGIN=https://yourschool.com
```

### Step 2: Install Dependencies

```powershell
cd Backend
npm install
```

### Step 3: Initialize Database

**Option A: Auto-initialization (Recommended)**
The database will auto-create default configuration on first API call:
```powershell
# Start the server
npm start

# In another terminal, call the config endpoint
# This will trigger automatic creation of default config
curl http://localhost:5000/api/system-config
```

**Option B: Manual initialization**
```powershell
# Run the verification script
cd ..
./verify-automation.ps1

# Follow the prompts to initialize
```

**Option C: Direct database insert**
```javascript
// MongoDB shell or Compass
use school_db

db.systemconfigs.insertOne({
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
  "createdAt": new Date(),
  "updatedAt": new Date()
})
```

### Step 4: Verify Cron Jobs

Check that cron jobs are initialized in `Backend/server.js`:

```javascript
// server.js (should already have this)
const { initTeacherAttendanceCron } = require('./cron/teacherAttendanceCron');

// After MongoDB connection
initTeacherAttendanceCron();  // This starts the daily cron
console.log('✅ Cron jobs initialized');
```

### Step 5: Test Backend

```powershell
# Start the server
cd Backend
npm start

# You should see:
# ✅ Connected to MongoDB
# ✅ Cron jobs initialized
# ✅ Teacher Attendance Auto-Mark Cron Initialized (Runs at 6:05 PM IST daily)
# 🚀 Server running on port 5000
```

Test endpoints:
```powershell
# Test config endpoint (creates default if not exists)
curl http://localhost:5000/api/system-config

# Test with authentication
$token = "YOUR_ADMIN_TOKEN"
curl -H "Authorization: Bearer $token" http://localhost:5000/api/system-config/teacher-attendance-settings
```

### Step 6: Production Deployment

**For Heroku:**
```powershell
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create your-school-backend

# Set timezone
heroku config:set TZ=Asia/Kolkata

# Set environment variables
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-secret
heroku config:set EMAIL_HOST=smtp.gmail.com
# ... etc for all env vars

# Deploy
git push heroku main

# Check logs
heroku logs --tail
```

**For Railway:**
```powershell
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Set environment variables in Railway dashboard
# Deploy
railway up
```

**For DigitalOcean/AWS/VPS:**
```bash
# SSH into server
ssh user@your-server-ip

# Clone repo
git clone your-repo-url
cd your-repo/Backend

# Install dependencies
npm install --production

# Set timezone
export TZ=Asia/Kolkata

# Use PM2 for process management
npm install -g pm2
pm2 start server.js --name school-backend
pm2 save
pm2 startup

# Setup Nginx reverse proxy
sudo apt install nginx
# Configure Nginx to proxy :5000 to :80
```

---

## 🌐 Frontend Deployment

### Step 1: Configure API Base URL

Update `Frontend/src/` files to use production API URL:

**Option A: Environment Variables (Recommended)**

Create `Frontend/.env.production`:
```env
VITE_API_URL=https://your-backend-url.com
```

Update API calls in components to use:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

**Option B: Direct Configuration**

Search and replace all instances of `http://localhost:5000` with your production URL.

### Step 2: Build Frontend

```powershell
cd Frontend
npm install
npm run build

# This creates a 'dist' folder with production-ready files
```

### Step 3: Deploy to Vercel (Recommended)

```powershell
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd Frontend
vercel

# Follow prompts:
# - Project name: school-frontend
# - Framework: Vite
# - Build command: npm run build
# - Output directory: dist

# Set environment variables in Vercel dashboard
# VITE_API_URL = your-backend-url
```

**Using Vercel Dashboard:**
1. Go to vercel.com
2. Import Git repository
3. Select `Frontend` folder as root
4. Add environment variable: `VITE_API_URL`
5. Deploy

### Step 4: Deploy to Netlify

```powershell
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd Frontend
netlify deploy --prod

# Configure in netlify.toml
```

Or use Netlify dashboard:
1. Go to netlify.com
2. Drag & drop `Frontend/dist` folder
3. Or connect Git repository
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Environment variables: `VITE_API_URL`

---

## 🧪 Post-Deployment Testing

### 1. Backend Health Check

```powershell
# Test base URL
curl https://your-backend-url.com/api/system-config

# Should return config object (creates default if not exists)
```

### 2. Frontend Access

Navigate to your frontend URL:
```
https://your-school-app.vercel.app
```

### 3. Login as Admin

```
1. Go to login page
2. Enter admin credentials
3. Should see admin dashboard
```

### 4. Test Automation Settings

```
1. Click "Teacher Attendance"
2. Click "Automation Settings" button (top right)
3. Modal should open with current settings
4. Make a change (e.g., change deadline time)
5. Click "Save Settings"
6. Should see success toast
7. Close modal and reopen
8. Settings should persist
```

### 5. Test Immediate Automation

```
1. In Automation Settings modal
2. Click "Test Now" button
3. Wait for response
4. Should see toast with results
5. Check database for new attendance records
```

### 6. Verify Database Persistence

**MongoDB Atlas Dashboard:**
```
1. Login to MongoDB Atlas
2. Go to Collections
3. Find database: school_db
4. Check collection: systemconfigs
5. Should see document with key: 'default_config'
6. Check teacherAttendanceSettings subdocument
```

**MongoDB Compass:**
```
1. Open MongoDB Compass
2. Connect to production database
3. school_db → systemconfigs
4. Find { "key": "default_config" }
5. Verify teacherAttendanceSettings exists
```

### 7. Check Cron Logs

Wait until 6:05 PM IST and check backend logs:

**Heroku:**
```powershell
heroku logs --tail | Select-String "attendance"
```

**Railway:**
```
Check Railway dashboard logs
```

**VPS:**
```bash
pm2 logs school-backend
```

Expected output:
```
[6:05 PM] Running teacher attendance auto-mark...
[6:05 PM] Auto-mark settings: enabled=true, deadline=18:00
[6:05 PM] Current time: 18:05, Deadline: 18:00
[6:05 PM] Found 3 teachers without attendance
[6:05 PM] Successfully marked 3 teachers as leave
[6:05 PM] Email notifications sent
```

---

## 📊 Monitoring & Maintenance

### Daily Monitoring

**Check Cron Execution:**
```powershell
# Every day at 6:05 PM IST, verify:
# 1. Backend logs show cron ran
# 2. Attendance records created
# 3. Emails sent (if enabled)
```

**Database Query:**
```javascript
// MongoDB shell - check today's auto-marked attendance
db.teacherattendances.find({
  date: ISODate("2024-11-20"),
  "leaveType": "Auto-marked"
}).count()
```

### Weekly Maintenance

**Check Email Service:**
```powershell
# Verify SMTP credentials still valid
# Check email delivery logs
# Ensure no bounces/failures
```

**Review Settings:**
```
1. Login as admin
2. Check automation settings
3. Verify deadline time still appropriate
4. Adjust if needed based on feedback
```

### Monthly Audit

**Review Automation Effectiveness:**
```sql
-- Check how many auto-marks vs manual marks
db.teacherattendances.aggregate([
  {
    $match: {
      date: { $gte: ISODate("2024-11-01"), $lt: ISODate("2024-12-01") }
    }
  },
  {
    $group: {
      _id: "$leaveType",
      count: { $sum: 1 }
    }
  }
])
```

**Performance Check:**
```
1. Backend response times
2. Database query performance
3. Email delivery success rate
4. User feedback on system
```

---

## 🔧 Troubleshooting

### Issue: Cron not running

**Diagnosis:**
```powershell
# Check backend logs
heroku logs --tail | Select-String "cron"

# Look for: "Cron jobs initialized"
```

**Solutions:**
1. **Verify timezone:**
   ```powershell
   # Check server timezone
   heroku run node -e "console.log(new Date().toString())"
   
   # Should show IST/Asia/Kolkata
   ```

2. **Restart backend:**
   ```powershell
   heroku restart
   # Or
   pm2 restart school-backend
   ```

3. **Check cron initialization:**
   - Verify `initTeacherAttendanceCron()` called in `server.js`
   - Check no errors in cron file

### Issue: Database not persisting

**Diagnosis:**
```powershell
# Run verification script
./verify-automation.ps1

# Check if config exists
```

**Solutions:**
1. **Trigger auto-creation:**
   ```powershell
   # Call GET endpoint (triggers creation)
   curl https://your-backend-url.com/api/system-config
   ```

2. **Manual insert:**
   ```javascript
   // Use MongoDB Compass or shell
   // Insert default config document
   ```

3. **Check MongoDB connection:**
   ```powershell
   # Verify MONGODB_URI environment variable
   heroku config:get MONGODB_URI
   ```

### Issue: Emails not sending

**Diagnosis:**
```powershell
# Check email config
heroku config | Select-String "EMAIL"
```

**Solutions:**
1. **Verify SMTP credentials:**
   ```powershell
   # Test email service
   node -e "
     const nodemailer = require('nodemailer');
     const transport = nodemailer.createTransport({
       host: 'smtp.gmail.com',
       port: 587,
       auth: { user: 'your-email', pass: 'your-password' }
     });
     transport.verify((err, success) => {
       console.log(err ? 'FAIL: ' + err : 'SUCCESS');
     });
   "
   ```

2. **Check Gmail settings:**
   - Enable "Less secure app access" (if using Gmail)
   - OR use App-Specific Password
   - OR use OAuth2

3. **Disable notifications temporarily:**
   ```
   Admin → Automation Settings → Email Notifications → OFF
   ```

### Issue: Wrong timezone execution

**Diagnosis:**
```powershell
# Check server time vs expected time
node -e "console.log(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))"
```

**Solutions:**
1. **Set TZ environment variable:**
   ```powershell
   heroku config:set TZ=Asia/Kolkata
   ```

2. **Use explicit timezone in cron:**
   - Already implemented in `teacherAttendanceCron.js`
   - Uses `moment-tz` with 'Asia/Kolkata'

---

## 📚 Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/school_db` |
| `JWT_SECRET` | Secret key for JWT tokens | `my-super-secret-key-12345` |
| `TZ` | Server timezone (CRITICAL) | `Asia/Kolkata` |

### Optional Variables

| Variable | Description | Example | Default |
|----------|-------------|---------|---------|
| `PORT` | Server port | `5000` | `5000` |
| `NODE_ENV` | Environment mode | `production` | `development` |
| `EMAIL_HOST` | SMTP server | `smtp.gmail.com` | - |
| `EMAIL_PORT` | SMTP port | `587` | `587` |
| `EMAIL_USER` | Email username | `school@gmail.com` | - |
| `EMAIL_PASS` | Email password | `app-specific-password` | - |
| `EMAIL_FROM` | From email | `School <school@gmail.com>` | - |
| `CORS_ORIGIN` | Allowed frontend URL | `https://school.vercel.app` | `*` |

---

## ✅ Final Checklist

Before going live:

### Backend
- [ ] Environment variables set
- [ ] Database connected
- [ ] Timezone set to Asia/Kolkata
- [ ] Cron jobs initialized
- [ ] Email service tested
- [ ] API endpoints working
- [ ] Admin authentication working
- [ ] Logs showing cron schedule

### Frontend
- [ ] API base URL configured
- [ ] Production build successful
- [ ] Deployed to hosting
- [ ] Login page accessible
- [ ] Admin dashboard loads
- [ ] Automation settings modal opens
- [ ] Can save settings
- [ ] Test button works

### Database
- [ ] systemconfigs collection exists
- [ ] default_config document present
- [ ] teacherAttendanceSettings subdocument populated
- [ ] Settings persist after save
- [ ] Test creates attendance records

### Testing
- [ ] Manual login works
- [ ] Settings save successfully
- [ ] Test automation works
- [ ] Database updates confirmed
- [ ] Emails sent (if enabled)
- [ ] Wait for 6:05 PM - cron runs
- [ ] Check logs for execution
- [ ] Verify attendance marked

### Documentation
- [ ] Team trained on admin panel
- [ ] AUTOMATION_WORKFLOW.md reviewed
- [ ] Troubleshooting guide accessible
- [ ] Emergency contacts documented
- [ ] Backup/recovery plan in place

---

## 📞 Support & Resources

**Documentation:**
- `AUTOMATION_WORKFLOW.md` - How automation works
- `BACKEND_INTEGRATION.md` - API reference
- `README.md` - General setup

**Scripts:**
- `verify-automation.ps1` - Database verification
- `Backend/scripts/testRajesh.js` - Test utilities

**Logs:**
- Backend console: Daily at 6:05 PM IST
- MongoDB: Check `teacherattendances` collection
- Email service: Check SMTP delivery reports

---

**Last Updated:** 2024
**Version:** 1.0
**Status:** Production Ready ✅
