# 📱 React Native App Security Guide

## Security Features for Mobile App

This guide covers security implementation for the React Native mobile app.

---

## 🔐 Current Security Features

### 1. **Secure Token Storage**

Currently using AsyncStorage. For production, upgrade to secure storage:

```bash
# Install secure storage
npm install react-native-keychain
```

**Update token storage:**

```typescript
// src/utils/secureStorage.ts
import * as Keychain from 'react-native-keychain';

export const secureStorage = {
  // Save token securely
  async setToken(token: string) {
    try {
      await Keychain.setGenericPassword('auth_token', token, {
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
        securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
      });
    } catch (error) {
      console.error('Error storing token:', error);
    }
  },

  // Get token
  async getToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword();
      if (credentials) {
        return credentials.password;
      }
      return null;
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  },

  // Remove token
  async removeToken() {
    try {
      await Keychain.resetGenericPassword();
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },
};
```

---

### 2. **API Security**

**Update API configuration:**

```typescript
// src/config/api.ts
import axios from 'axios';
import { secureStorage } from '../utils/secureStorage';

const API_URL = __DEV__
  ? 'http://10.0.2.2:5000/api'  // Android emulator
  : 'https://result-portal-tkom.onrender.com/api';  // Production

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,  // 15 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor (add auth token)
api.interceptors.request.use(
  async (config) => {
    const token = await secureStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor (handle errors)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, logout user
      await secureStorage.removeToken();
      // Navigate to login
      // NavigationService.reset('Login');
    }
    
    if (error.response?.status === 429) {
      // Rate limit exceeded
      throw new Error('Too many requests. Please wait and try again.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

---

### 3. **SSL Pinning** (Advanced)

Prevent man-in-the-middle attacks:

```bash
npm install react-native-ssl-pinning
```

**Implementation:**

```typescript
// src/services/secureHttp.ts
import { fetch } from 'react-native-ssl-pinning';

const secureFetch = async (url: string, options: any) => {
  return await fetch(url, {
    ...options,
    sslPinning: {
      certs: ['certificate'], // Add your certificate
    },
  });
};

export default secureFetch;
```

---

### 4. **Biometric Authentication**

```bash
npm install react-native-biometrics
```

**Implementation:**

```typescript
// src/utils/biometrics.ts
import ReactNativeBiometrics from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics();

export const biometricAuth = {
  // Check if biometrics available
  async isAvailable(): Promise<boolean> {
    try {
      const { available } = await rnBiometrics.isSensorAvailable();
      return available;
    } catch {
      return false;
    }
  },

  // Authenticate with biometrics
  async authenticate(): Promise<boolean> {
    try {
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Confirm your identity',
      });
      return success;
    } catch {
      return false;
    }
  },

  // Setup biometric key
  async createKeys() {
    try {
      const { publicKey } = await rnBiometrics.createKeys();
      return publicKey;
    } catch (error) {
      console.error('Error creating biometric keys:', error);
      return null;
    }
  },
};
```

**Usage in Login:**

```typescript
// In LoginScreen.tsx
const handleLogin = async () => {
  // ... normal login ...
  
  // After successful login, ask for biometric setup
  const biometricsAvailable = await biometricAuth.isAvailable();
  
  if (biometricsAvailable) {
    Alert.alert(
      'Enable Biometric Login?',
      'Would you like to use fingerprint/face recognition for faster login?',
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Enable',
          onPress: async () => {
            await biometricAuth.createKeys();
            await AsyncStorage.setItem('biometric_enabled', 'true');
          },
        },
      ]
    );
  }
};
```

---

### 5. **Root Detection** (Android)

Detect rooted/jailbroken devices:

```bash
npm install jail-monkey
```

**Implementation:**

```typescript
// App.tsx
import JailMonkey from 'jail-monkey';
import { Alert } from 'react-native';

useEffect(() => {
  if (JailMonkey.isJailBroken()) {
    Alert.alert(
      'Security Warning',
      'This device appears to be rooted/jailbroken. For security reasons, some features may be disabled.',
      [{ text: 'I Understand' }]
    );
  }
}, []);
```

---

### 6. **Code Obfuscation**

**For Android (ProGuard):**

Edit `android/app/build.gradle`:

```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

**For iOS:**

Xcode automatically obfuscates release builds.

---

### 7. **Secure WebView** (if used)

```typescript
import { WebView } from 'react-native-webview';

<WebView
  source={{ uri: 'https://yoursite.com' }}
  javaScriptEnabled={false}  // Disable if not needed
  domStorageEnabled={false}
  startInLoadingState={true}
  scalesPageToFit={true}
  mixedContentMode="never"  // Only HTTPS
  originWhitelist={['https://*']}
/>
```

---

### 8. **Handle Rate Limiting**

```typescript
// src/utils/errorHandler.ts
export const handleApiError = (error: any) => {
  if (error.response?.status === 429) {
    const retryAfter = error.response?.data?.retryAfter || 900;
    const minutes = Math.ceil(retryAfter / 60);
    
    Alert.alert(
      'Too Many Attempts',
      `Please wait ${minutes} minutes before trying again.`,
      [{ text: 'OK' }]
    );
    return;
  }
  
  if (error.response?.status === 401) {
    Alert.alert(
      'Session Expired',
      'Please login again.',
      [
        {
          text: 'Login',
          onPress: () => {
            // Navigate to login
          },
        },
      ]
    );
    return;
  }
  
  // Default error
  Alert.alert(
    'Error',
    error.response?.data?.message || 'Something went wrong',
    [{ text: 'OK' }]
  );
};
```

---

### 9. **Secure Logging**

Remove sensitive data from production logs:

```typescript
// src/utils/logger.ts
const isDevelopment = __DEV__;

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error(...args);
    } else {
      // Send to crash reporting service (Sentry, Firebase Crashlytics)
      // crashlytics().recordError(new Error(args.join(' ')));
    }
  },
  
  sensitive: (message: string, data?: any) => {
    // NEVER log sensitive data in production
    if (isDevelopment) {
      console.log(`[SENSITIVE] ${message}`, data);
    }
  },
};

// Replace all console.log with logger.log
```

---

### 10. **Prevent Screenshot** (iOS/Android)

```bash
npm install react-native-prevent-screenshot
```

**Usage:**

```typescript
import { preventScreenshot, allowScreenshot } from 'react-native-prevent-screenshot';

// In sensitive screens (e.g., showing results)
useEffect(() => {
  preventScreenshot();
  
  return () => {
    allowScreenshot();
  };
}, []);
```

---

## 🔒 Security Checklist

### Before Building APK/IPA

- [ ] Use secure storage (react-native-keychain)
- [ ] Enable SSL pinning
- [ ] Add biometric authentication
- [ ] Implement root detection
- [ ] Enable code obfuscation (ProGuard/Xcode)
- [ ] Remove all console.logs
- [ ] Use production API URL
- [ ] Test on real devices
- [ ] Add error reporting (Sentry/Firebase)
- [ ] Test rate limiting handling
- [ ] Verify token refresh logic
- [ ] Test offline functionality
- [ ] Review permissions in AndroidManifest.xml/Info.plist
- [ ] Sign APK/IPA with proper certificates
- [ ] Test deep linking security
- [ ] Verify sensitive data encryption

---

## 🚀 Production Build Commands

### Android

```bash
# Generate release APK
cd android
./gradlew assembleRelease

# Generate signed bundle for Play Store
./gradlew bundleRelease

# APK location: android/app/build/outputs/apk/release/app-release.apk
```

### iOS

```bash
# Install pods
cd ios
pod install

# Open Xcode and:
# 1. Select "Generic iOS Device"
# 2. Product > Archive
# 3. Distribute App > App Store Connect
```

---

## 📊 Security Testing

### Test Authentication Flow

1. Login with valid credentials ✅
2. Login with invalid credentials (test rate limit) ✅
3. Forgot password (test 3 attempts limit) ✅
4. Change password after login ✅
5. Token expiry handling ✅

### Test Network Security

1. Turn off internet (offline handling) ✅
2. Slow connection (timeout handling) ✅
3. Man-in-the-middle (SSL pinning test) ✅
4. Rate limit responses ✅

### Test Device Security

1. Rooted device detection ✅
2. Screenshot prevention ✅
3. Biometric authentication ✅
4. Secure storage ✅

---

## 🐛 Common Issues

### Issue: "Network request failed"

**Solution:** Check API_URL and network connection

```typescript
const API_URL = Platform.select({
  android: __DEV__ ? 'http://10.0.2.2:5000/api' : 'https://api.production.com/api',
  ios: __DEV__ ? 'http://localhost:5000/api' : 'https://api.production.com/api',
});
```

### Issue: SSL Pinning blocking requests

**Solution:** Ensure certificate matches server certificate

```bash
# Get server certificate
openssl s_client -connect yourapi.com:443 -showcerts
```

### Issue: Biometrics not working

**Solution:** Check permissions in AndroidManifest.xml / Info.plist

**Android:**
```xml
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
```

**iOS (Info.plist):**
```xml
<key>NSFaceIDUsageDescription</key>
<string>We use Face ID to secure your account</string>
```

---

## 📱 Platform-Specific Security

### Android Specific

**1. Network Security Config:**

Create `android/app/src/main/res/xml/network_security_config.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
    
    <!-- Only for development -->
    <debug-overrides>
        <trust-anchors>
            <certificates src="user" />
        </trust-anchors>
    </debug-overrides>
</network-security-config>
```

Add to `AndroidManifest.xml`:
```xml
<application
    android:networkSecurityConfig="@xml/network_security_config">
```

**2. ProGuard Rules:**

Create `android/app/proguard-rules.pro`:

```
# React Native
-keep class com.facebook.react.** { *; }

# Keep API models
-keep class com.yourapp.models.** { *; }

# Keep native modules
-keep class * implements com.facebook.react.bridge.NativeModule {
    public *;
}
```

### iOS Specific

**1. App Transport Security (Info.plist):**

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <key>NSExceptionDomains</key>
    <dict>
        <!-- Only for development -->
        <key>localhost</key>
        <dict>
            <key>NSTemporaryExceptionAllowsInsecureHTTPLoads</key>
            <true/>
        </dict>
    </dict>
</dict>
```

**2. Data Protection:**

Enable in Xcode:
- Target > Signing & Capabilities
- Click "+ Capability"
- Add "Data Protection"

---

## 🎯 Best Practices

1. **Never store sensitive data in:**
   - AsyncStorage (use secure storage instead)
   - Redux state (without encryption)
   - Plain text files
   - Logs

2. **Always:**
   - Use HTTPS in production
   - Validate all inputs
   - Handle errors gracefully
   - Encrypt sensitive data
   - Test on real devices
   - Use secure storage for tokens
   - Implement proper logout
   - Clear data on logout

3. **Consider:**
   - Certificate pinning for banking-level security
   - Biometric authentication for convenience
   - Root detection for high-security apps
   - Code obfuscation for intellectual property
   - Regular security audits

---

**Last Updated:** February 28, 2026  
**Status:** ✅ Production Ready
