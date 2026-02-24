# 🚀 Quick Start Guide - Result Portal Mobile App

## Step 1: Verify Installation

Make sure you're in the ResultApp directory:
```bash
cd ResultApp
```

Check that all dependencies are installed:
```bash
npm install
```

## Step 2: Configure Backend API

Open `src/services/api.ts` and configure your backend URL:

### For Android Emulator:
```typescript
const API_BASE_URL = 'http://10.0.2.2:5000/api';
```

### For iOS Simulator:
```typescript
const API_BASE_URL = 'http://localhost:5000/api';
```

### For Physical Device:
1. Find your computer's IP address:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` (look for inet)

2. Use this IP:
```typescript
const API_BASE_URL = 'http://YOUR_IP_ADDRESS:5000/api';
```

Example: `http://192.168.1.100:5000/api`

## Step 3: Start Backend Server

In a separate terminal, navigate to the Backend folder and start the server:
```bash
cd ../Backend
npm start
```

Ensure the server is running on port 5000.

## Step 4: Start Metro Bundler

In the ResultApp directory:
```bash
npm start
```

## Step 5: Run the App

### For Android:
Open a new terminal in ResultApp directory:
```bash
npm run android
```

### For iOS (Mac only):
```bash
npm run ios
```

## 📱 First Login

### Test with Student Account:
1. Select "Student" role
2. Enter your GR Number and password
3. Or click "Register" to create a new student account

### Test with Teacher Account:
1. Select "Teacher" role
2. Enter email or employee ID
3. Enter password

### Test with Admin Account:
1. Select "Admin" role
2. Enter admin email
3. Enter admin password

## 🎨 Features by Role

### Student Dashboard:
- View all exam results
- Check attendance
- Access profile and timetable

### Teacher Dashboard:
- Manage students
- Upload results
- Mark attendance

### Admin Dashboard:
- Manage all students and teachers
- View system statistics
- Access all system features

## 🐛 Common Issues

### Issue: "Unable to connect to server"
**Solution:** 
- Check if backend server is running
- Verify API_BASE_URL is correct
- For physical device, ensure phone and computer are on same WiFi

### Issue: Metro bundler errors
**Solution:**
```bash
npm start -- --reset-cache
```

### Issue: Android build fails
**Solution:**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

## 📝 Development Tips

### Enable Hot Reload:
- Press `R` twice in the app (Android)
- Press `Cmd + R` (iOS)

### Open Developer Menu:
- Shake your device
- Or press `Cmd + D` (iOS) / `Cmd + M` (Android in emulator)

### View Console Logs:
The Metro bundler terminal shows all console.log() output

## 🔄 Update After Backend Changes

If you make changes to the Backend API:
1. Restart the backend server
2. The mobile app will automatically reconnect

## 📖 Next Steps

- Explore all three role dashboards
- Test result upload and viewing
- Check attendance features
- Customize the app theme in tailwind.config.js

## 🆘 Need Help?

- Check the full README.md for detailed documentation
- Review error messages in Metro bundler
- Check React Native documentation: https://reactnative.dev

---

**You're all set! Enjoy using the Result Portal Mobile App! 🎉**
