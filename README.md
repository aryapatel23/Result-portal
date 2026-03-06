# 🎓 Student Result Portal

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-19.1.0-blue.svg)
![React Native](https://img.shields.io/badge/react--native-0.84.0-blue.svg)

**A comprehensive educational management system with automated attendance, result management, and performance tracking.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage) • [API Documentation](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Mobile App](#-mobile-app)
- [Security](#-security)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## 🌟 Overview

The **Student Result Portal** is a full-stack educational management platform designed to streamline academic operations for schools and colleges. It provides a comprehensive solution for managing students, teachers, results, attendance, and performance analytics with modern security features and automated workflows.

### Key Highlights

- 🤖 **Automated Attendance** - Face recognition-based attendance system with cron job automation
- 📊 **Result Management** - Bulk upload, individual result entry, and PDF generation
- 👨‍🏫 **Teacher Management** - Performance tracking, attendance monitoring, and timetable integration
- 📱 **Multi-Platform** - Web application and native mobile apps (iOS & Android)
- 🔒 **Enterprise Security** - JWT authentication, rate limiting, data sanitization, and helmet protection
- 🌐 **Internationalization** - Multi-language support with i18next
- 📈 **Analytics Dashboard** - Real-time insights and performance metrics

---

## ✨ Features

### Student Management
- ✅ Student registration and profile management
- ✅ Bulk student import via Excel/CSV
- ✅ Student promotion between classes
- ✅ Advanced search and filtering
- ✅ Face registration for attendance

### Result Management
- ✅ Individual result entry with validation
- ✅ Bulk result upload via Excel
- ✅ Result cards with PDF generation
- ✅ Grade calculation and analytics
- ✅ Result history tracking
- ✅ Export results to various formats

### Attendance System
- ✅ **Automated face recognition attendance**
- ✅ GPS location verification
- ✅ Scheduled cron jobs for attendance marking
- ✅ Manual attendance override
- ✅ Attendance reports and analytics
- ✅ Holiday management integration

### Teacher Management
- ✅ Teacher profile management
- ✅ Performance tracking and evaluation
- ✅ Attendance monitoring
- ✅ Timetable assignment
- ✅ Subject allocation
- ✅ Leave management

### Admin Features
- ✅ User role management (Admin, Teacher, Student)
- ✅ System configuration
- ✅ Public holiday management
- ✅ Timetable creation and management
- ✅ Security audit logs
- ✅ Database backup and restore

### Additional Features
- ✅ Real-time notifications
- ✅ Email integration with Nodemailer
- ✅ Responsive UI with dark/light themes
- ✅ RESTful API architecture
- ✅ Data export (PDF, Excel)
- ✅ Comprehensive error handling

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js v5
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** Helmet, HPP, Rate Limiting, XSS Protection, Mongo Sanitize
- **File Processing:** Multer, ExcelJS, XLSX
- **PDF Generation:** PDFKit
- **Task Scheduling:** Node-Cron
- **Face Recognition:** face-api.js
- **Email:** Nodemailer
- **Validation:** Express Validator
- **Logging:** Morgan, Winston
- **Compression:** Gzip Compression

### Frontend (Web)
- **Framework:** React 19
- **Build Tool:** Vite
- **State Management:** Redux Toolkit
- **Styling:** Tailwind CSS v4
- **Routing:** React Router DOM v7
- **HTTP Client:** Axios
- **Icons:** Lucide React, React Icons
- **Notifications:** React Hot Toast, React Toastify
- **Internationalization:** i18next, react-i18next
- **Carousel:** React Slick

### Mobile App
- **Framework:** React Native 0.84
- **Navigation:** React Navigation v7
- **State Management:** AsyncStorage
- **UI Components:** React Native Vector Icons
- **Styling:** Linear Gradient
- **Location:** React Native Geolocation
- **Date/Time:** DateTimePicker
- **HTTP Client:** Axios

### DevOps & Tools
- **Version Control:** Git & GitHub
- **Package Manager:** npm
- **Environment:** dotenv
- **Code Quality:** ESLint, Prettier
- **Testing:** Jest
- **Deployment:** Render (Backend), Vercel (Frontend)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Web App     │  │  Android App │  │   iOS App    │      │
│  │  (React)     │  │(React Native)│  │(React Native)│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Express.js Server                                    │   │
│  │  - CORS, Security Headers, Rate Limiting              │   │
│  │  - Request Validation & Sanitization                  │   │
│  │  - Authentication & Authorization (JWT)               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Business Logic Layer                        │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐              │
│  │Controllers │ │ Services   │ │ Middleware │              │
│  └────────────┘ └────────────┘ └────────────┘              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  MongoDB Database                                     │   │
│  │  - Students, Teachers, Results, Attendance, Users     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 External Services                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  Email   │  │  Storage │  │ Face API │                  │
│  │ Service  │  │  Service │  │          │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6.0 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** (v9.0.0 or higher) - Comes with Node.js
- **Git** - [Download](https://git-scm.com/downloads)
- **Android Studio** (for mobile app development) - [Download](https://developer.android.com/studio)
- **Xcode** (for iOS development - macOS only) - [Download](https://developer.apple.com/xcode/)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/aryapatel23/Result-portal.git
cd Result-portal
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd Backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure environment variables (see Configuration section)
# Edit .env file with your settings

# Start MongoDB (if running locally)
# Windows: mongod
# Linux/Mac: sudo systemctl start mongod

# Run database seeders (optional - creates sample data)
npm run seed

# Start development server
npm run dev

# Or start production server
npm start
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd Frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure API URL in .env
# VITE_API_URL=http://localhost:5000/api

# Start development server
npm run dev

# Build for production
npm run build
```

The frontend will run on `http://localhost:5173`

### 4. Mobile App Setup

```bash
# Navigate to mobile app directory
cd ResultApp

# Install dependencies
npm install

# Install iOS dependencies (macOS only)
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# Run on Android (in a new terminal)
npm run android

# Run on iOS (macOS only, in a new terminal)
npm run ios
```

---

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `Backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/result_portal
# Or use MongoDB Atlas
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/result_portal

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_min_32_characters
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=noreply@resultportal.com

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Timezone
TZ=Asia/Kolkata

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760

# Cron Job Settings
ENABLE_CRON_JOBS=true
ATTENDANCE_CRON_SCHEDULE=0 9 * * 1-5
TEACHER_ATTENDANCE_CRON_SCHEDULE=0 9 * * 1-5
```

### Frontend Environment Variables

Create a `.env` file in the `Frontend` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME=Student Result Portal
VITE_APP_VERSION=1.0.0
```

### Mobile App Configuration

Update the API URL in `ResultApp/src/config/api.ts`:

```typescript
export const API_URL = 'http://YOUR_LOCAL_IP:5000/api';
// For production
// export const API_URL = 'https://your-backend-url.com/api';
```

---

## 📖 Usage

### Default Admin Credentials

After running the seed script, use these credentials:

- **Email:** `admin@example.com`
- **Password:** `admin123`

⚠️ **Important:** Change the default password immediately after first login!

### Common Tasks

#### Create Admin User
```bash
cd Backend
node seedAdmin.js
```

#### Reset Admin Password
```bash
cd Backend
npm run reset-admin-password
```

#### Verify Cron Jobs
```bash
cd Backend
npm run verify-cron
```

#### Run Tests
```bash
# Backend tests
cd Backend
npm test

# Frontend tests
cd Frontend
npm test

# Mobile app tests
cd ResultApp
npm test
```

---

## 📚 API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### API Endpoints

#### Authentication
```http
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # User login
POST   /api/auth/logout            # User logout
POST   /api/auth/forgot-password   # Request password reset
POST   /api/auth/reset-password    # Reset password
GET    /api/auth/me                # Get current user
```

#### Students
```http
GET    /api/students               # Get all students
GET    /api/students/:id           # Get student by ID
POST   /api/students               # Create new student
PUT    /api/students/:id           # Update student
DELETE /api/students/:id           # Delete student
POST   /api/students/bulk          # Bulk upload students
POST   /api/students/promote       # Promote students to next class
```

#### Results
```http
GET    /api/results                # Get all results
GET    /api/results/:id            # Get result by ID
POST   /api/results                # Create new result
PUT    /api/results/:id            # Update result
DELETE /api/results/:id            # Delete result
POST   /api/results/bulk           # Bulk upload results
GET    /api/results/student/:id    # Get student results
GET    /api/results/pdf/:id        # Generate result PDF
```

#### Teachers
```http
GET    /api/teachers               # Get all teachers
GET    /api/teachers/:id           # Get teacher by ID
POST   /api/teachers               # Create new teacher
PUT    /api/teachers/:id           # Update teacher
DELETE /api/teachers/:id           # Delete teacher
GET    /api/teachers/:id/performance # Get teacher performance
```

#### Attendance
```http
GET    /api/attendance             # Get attendance records
POST   /api/attendance             # Mark attendance
GET    /api/attendance/student/:id # Get student attendance
GET    /api/attendance/report      # Generate attendance report
POST   /api/attendance/face        # Face recognition attendance
```

#### Timetable
```http
GET    /api/timetable              # Get timetables
POST   /api/timetable              # Create timetable
PUT    /api/timetable/:id          # Update timetable
DELETE /api/timetable/:id          # Delete timetable
```

#### System Configuration
```http
GET    /api/config                 # Get system config
PUT    /api/config                 # Update system config
GET    /api/holidays               # Get holidays
POST   /api/holidays               # Add holiday
DELETE /api/holidays/:id           # Delete holiday
```

### Response Format

#### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful"
}
```

#### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

### Rate Limiting

- General API: 100 requests per 15 minutes
- Authentication: 5 requests per 15 minutes
- File uploads: 10 requests per 15 minutes
- Bulk operations: 20 requests per 15 minutes

---

## 📱 Mobile App

### Features
- Student login and profile management
- View results and download PDFs
- Mark attendance with face recognition
- View timetable and notifications
- Teacher attendance tracking
- Offline support with data caching

### Build APK (Android)

```bash
cd ResultApp

# Generate release APK
cd android
./gradlew assembleRelease

# APK location: android/app/build/outputs/apk/release/app-release.apk
```

### Build iOS App

```bash
cd ResultApp
cd ios

# Open in Xcode
open ResultApp.xcworkspace

# Build and archive from Xcode
# Product > Archive
```

---

## 🔒 Security

### Implemented Security Measures

- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Password Hashing** - bcrypt with salt rounds
- ✅ **Rate Limiting** - Prevents DDoS and brute force attacks
- ✅ **Helmet.js** - Secures HTTP headers
- ✅ **CORS Protection** - Whitelisted origins only
- ✅ **XSS Protection** - xss-clean middleware
- ✅ **NoSQL Injection Protection** - express-mongo-sanitize
- ✅ **HPP Protection** - Prevents HTTP parameter pollution
- ✅ **Input Validation** - express-validator
- ✅ **Data Sanitization** - Sanitizes all inputs
- ✅ **Security Logging** - Tracks suspicious activities
- ✅ **HTTPS Enforcement** - SSL/TLS in production
- ✅ **Cookie Security** - httpOnly, secure, sameSite flags

### Best Practices

1. **Always use HTTPS in production**
2. **Keep dependencies updated** - Run `npm audit` regularly
3. **Use strong JWT secrets** - Minimum 32 characters
4. **Implement proper RBAC** - Role-based access control
5. **Regular backups** - Automate database backups
6. **Monitor logs** - Check security.log for suspicious activities
7. **Change default credentials** - Never use default passwords in production

---

## 🚢 Deployment

### Backend Deployment (Render)

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure build settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add environment variables from your `.env` file
5. Deploy!

### Frontend Deployment (Vercel)

```bash
cd Frontend

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# For production
vercel --prod
```

### Database (MongoDB Atlas)

1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Update `MONGO_URI` in backend environment variables
4. Whitelist your application IP addresses

### Mobile App Deployment

#### Google Play Store (Android)
1. Create a developer account
2. Generate signed APK/AAB
3. Upload to Play Console
4. Complete store listing
5. Submit for review

#### Apple App Store (iOS)
1. Create Apple Developer account
2. Configure App Store Connect
3. Archive and upload from Xcode
4. Complete app information
5. Submit for review

---

## 🧪 Testing

### Running Tests

```bash
# Backend tests
cd Backend
npm test

# Frontend tests
cd Frontend
npm test

# Mobile app tests
cd ResultApp
npm test

# Run tests with coverage
npm test -- --coverage
```

### Test Structure

```
Backend/
  __tests__/
    controllers/
    middleware/
    models/
    routes/
    integration/
```

---

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Ensure MongoDB is running. Start with `mongod` or `sudo systemctl start mongod`

#### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Kill the process using the port or change PORT in `.env`
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

#### JWT Token Invalid
```
Error: JsonWebTokenError: invalid token
```
**Solution:** Clear browser cookies/localStorage and login again

#### React Native Metro Bundler Issues
```bash
# Reset Metro cache
npm start -- --reset-cache

# Clean build
cd android && ./gradlew clean && cd ..
```

#### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 🤝 Contributing

We welcome contributions to the Student Result Portal! Here's how you can help:

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Coding Standards

- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Keep code DRY (Don't Repeat Yourself)
- Comment complex logic

### Development Workflow

1. Pick an issue or create a new one
2. Discuss your approach in the issue
3. Implement the feature/fix
4. Write/update tests
5. Submit PR with detailed description
6. Address review comments
7. Merge after approval

---

## 📄 License

This project is licensed under the **ISC License**.

```
Copyright (c) 2024-2026 Student Result Portal

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

---

## 📞 Support

### Get Help

- **Documentation:** [GitHub Wiki](https://github.com/aryapatel23/Result-portal/wiki)
- **Issues:** [GitHub Issues](https://github.com/aryapatel23/Result-portal/issues)
- **Discussions:** [GitHub Discussions](https://github.com/aryapatel23/Result-portal/discussions)

### Contact

- **Developer:** Arya Patel
- **GitHub:** [@aryapatel23](https://github.com/aryapatel23)
- **Email:** support@resultportal.com

---

## 🎯 Roadmap

### Current Version (v1.0.0)
- ✅ Core student and result management
- ✅ Automated attendance system
- ✅ Teacher management
- ✅ Mobile applications
- ✅ Security implementation

### Upcoming Features (v1.1.0)
- 🔄 Real-time notifications with WebSockets
- 🔄 Advanced analytics dashboard
- 🔄 Parent portal
- 🔄 SMS integration
- 🔄 Fee management system

### Future Plans (v2.0.0)
- 🔮 AI-powered insights
- 🔮 Video conferencing integration
- 🔮 Assignment management
- 🔮 Library management
- 🔮 Transport management

---

## 🌟 Acknowledgments

Special thanks to all contributors and the open-source community for making this project possible:

- React & React Native teams
- MongoDB team
- Express.js community
- Face-api.js creators
- All package maintainers

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/aryapatel23/Result-portal?style=social)
![GitHub forks](https://img.shields.io/github/forks/aryapatel23/Result-portal?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/aryapatel23/Result-portal?style=social)

---

<div align="center">

**Made with ❤️ by [Arya Patel](https://github.com/aryapatel23)**

⭐ Star this repository if you find it helpful!

[⬆ Back to top](#-student-result-portal)

</div>
