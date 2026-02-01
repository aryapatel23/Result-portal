# Backend Integration Guide

## Overview
This document describes the end-to-end integration between the React Native mobile app and the Node.js backend API.

## Backend Configuration

### Backend Server
- **URL**: `http://172.29.112.1:5000`
- **API Base**: `http://172.29.112.1:5000/api`
- **Status**: ✅ Running and accessible

### Available API Endpoints

#### Student Endpoints
- **Login**: `POST /api/student/login`
  - Body: `{ grNumber, password }`
  - Returns: `{ token, student }`

- **Get Results**: `GET /api/student/results`
  - Headers: `Authorization: Bearer <token>`
  - Returns: Array of results

- **Get Profile**: `GET /api/student/profile`
  - Headers: `Authorization: Bearer <token>`
  - Returns: Student profile data

- **Get Latest Result**: `GET /api/student/latest-result`
  - Public endpoint
  - Returns: Latest result data

- **Get Student by GR Number**: `GET /api/student/gr/:grNumber`
  - Public endpoint
  - Returns: Student data

#### Teacher Endpoints
- **Get Timetable**: `GET /api/teacher/timetable`
  - Headers: `Authorization: Bearer <token>`
  - Returns: Teacher's timetable

#### PDF Endpoints
- **Get PDF**: `GET /api/pdf/latest-result/:grNumber`
  - Returns: PDF file

## Mobile App Configuration

### API Configuration
Location: `ResultApp/src/config/api.config.ts`

```typescript
export const BASE_URL = 'http://172.29.112.1:5000/api';
export const API_TIMEOUT = 30000;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    STUDENT_LOGIN: '/student/login',
  },
  STUDENT: {
    PROFILE: '/student/profile',
    RESULTS: '/student/results',
    LATEST_RESULT: '/student/latest-result',
    BY_GR: (grNumber: string) => `/student/gr/${grNumber}`,
  },
  TEACHER: {
    TIMETABLE: '/teacher/timetable',
  },
  PDF: {
    LATEST_RESULT: (grNumber: string) => `/pdf/latest-result/${grNumber}`,
  },
};
```

### Authentication Flow

#### Token Storage
- Tokens are stored in AsyncStorage with key `authToken`
- Axios interceptors automatically add `Authorization: Bearer <token>` header

#### Login Process
1. User enters GR Number and password
2. App sends POST to `/api/student/login`
3. Backend returns JWT token
4. App stores token in AsyncStorage
5. App navigates to main screens

#### Protected Requests
All protected endpoints automatically include the token:
```typescript
const token = await AsyncStorage.getItem('authToken');
const response = await axios.get(endpoint, {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

## Screen Integration Status

### ✅ Results Screen
**Status**: Fully Integrated

**Implementation**:
- Fetches from `/api/student/results` when authenticated
- Falls back to mock data when not authenticated
- Displays exam results with search functionality
- Shows detailed view for each result

**Code Location**: `ResultApp/src/screens/ResultsScreen.tsx`

```typescript
const loadResults = async () => {
  try {
    if (isAuthenticated) {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${BASE_URL}/student/results`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      setResults(data);
    } else {
      // Use mock data
    }
  } catch (error) {
    console.error('Error loading results:', error);
  }
};
```

### 🔄 Timetable Screen
**Status**: Needs Integration

**Current**: Using mock data
**Required**: Connect to `/api/teacher/timetable`

**Note**: Backend endpoint requires teacher authentication. Need to either:
- Create student timetable endpoint
- Keep using mock data for students

### 🔄 Profile Screen
**Status**: Needs Integration

**Current**: Using AuthContext data
**Required**: Connect to `/api/student/profile` for complete profile data

**Implementation Plan**:
- Add `loadProfile()` function to fetch from backend
- Display statistics and student information
- Add profile update functionality

### ✅ Dashboard Screen
**Status**: Working with Static Data

**Implementation**:
- Shows quick stats cards
- Provides navigation to other screens
- Displays recent activities

## Testing the Integration

### Prerequisites
1. Backend server must be running on `http://172.29.112.1:5000`
2. Device must be on the same network as the backend server
3. MongoDB must be connected and populated with test data

### Test Scenarios

#### 1. Test Results Fetching (With Authentication)
```bash
# 1. Login with test credentials
# 2. Navigate to Results tab
# 3. Should see results from backend API
# 4. Search should filter results
# 5. Tap on result to see details
```

#### 2. Test Results Fetching (Without Authentication)
```bash
# 1. Open app (not logged in)
# 2. Navigate to Results tab
# 3. Should see mock data with 1 sample result
```

#### 3. Test Profile Screen
```bash
# 1. Login with test credentials
# 2. Navigate to Profile tab
# 3. Should see user information
# 4. Logout should clear token
```

### Debugging Connection Issues

#### Check Backend Accessibility
```bash
# From your PC
curl http://172.29.112.1:5000/api/student/latest-result

# Should return result data
```

#### Check Device Network
```bash
# Get device IP
adb shell ip addr show wlan0

# Check if device can reach backend
adb shell ping 172.29.112.1
```

#### View App Logs
```bash
# Filter for app logs
adb logcat | findstr "ResultApp"

# View network errors
adb logcat | findstr "fetch"
```

## Authentication Middleware

### Backend Middleware
Location: `Backend/middleware/authMiddleware.js`

```javascript
const protectStudent = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  // Verify JWT token
  // Attach student to req.student
  next();
};
```

### Frontend Interceptor
Location: `ResultApp/src/config/axios.config.ts`

```typescript
// Request interceptor - adds token automatically
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

// Response interceptor - handles 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      await AsyncStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);
```

## Next Steps

### Immediate Actions Required
1. ✅ Add AsyncStorage import to ResultsScreen - **COMPLETED**
2. ✅ Fix API_TIMEOUT duplicate export - **COMPLETED**
3. ✅ Build and install updated app - **COMPLETED**
4. 🔄 Test Results API connection with real backend
5. 🔄 Add login functionality to AuthContext
6. 🔄 Update ProfileScreen with backend integration
7. 🔄 Decide on Timetable approach (student endpoint or mock data)

### Future Enhancements
- Add pull-to-refresh on all screens
- Implement offline caching with AsyncStorage
- Add loading skeletons
- Add error handling with retry logic
- Implement PDF download functionality
- Add face recognition integration

## Troubleshooting

### Common Issues

#### 1. Network Request Failed
**Problem**: App can't reach backend
**Solutions**:
- Verify backend is running on 172.29.112.1:5000
- Check device is on same network
- Disable VPN if active
- Check Windows Firewall settings

#### 2. 401 Unauthorized
**Problem**: Token is invalid or expired
**Solutions**:
- Logout and login again
- Check token storage: `AsyncStorage.getItem('authToken')`
- Verify backend JWT_SECRET matches

#### 3. CORS Errors
**Problem**: Backend rejects request
**Solutions**:
- Check backend CORS configuration in server.js
- Ensure origin is allowed for mobile app

#### 4. Timeout Errors
**Problem**: Request takes too long
**Solutions**:
- Check network speed
- Increase API_TIMEOUT in api.config.ts
- Optimize backend queries

## App Build Information

### Latest Build
- **Build Date**: January 2025
- **Build Status**: ✅ Successful
- **APK Location**: `ResultApp/android/app/build/outputs/apk/release/app-release.apk`
- **Version**: 1.0.0
- **Device**: SM-A356E (Real Android Device)

### Build Commands
```bash
# Build release APK
cd ResultApp/android
./gradlew assembleRelease

# Install on device
adb install -r app/build/outputs/apk/release/app-release.apk

# Run app
adb shell am start -n com.resultapp/.MainActivity
```

## Backend Server Setup

### Starting Backend
```bash
cd Backend
npm install
npm start
# Server starts on http://0.0.0.0:5000
```

### Environment Variables
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/school_db
JWT_SECRET=your_secret_key
```

### Network Configuration
The backend listens on `0.0.0.0:5000`, making it accessible on:
- Localhost: `http://localhost:5000`
- Network IP: `http://172.29.112.1:5000`
- Any network interface

## Summary

The React Native app is now configured to connect with the backend API:

✅ **Completed**:
- API configuration with correct backend URL
- Axios interceptors for authentication
- ResultsScreen backend integration
- Token management with AsyncStorage
- Error handling and fallback to mock data

🔄 **In Progress**:
- Testing real API connections
- ProfileScreen integration
- Login functionality

📋 **Pending**:
- Timetable backend integration (if needed)
- PDF download functionality
- Face recognition features

The app is **ready for end-to-end testing** with the backend server! 🚀
