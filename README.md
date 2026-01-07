# 🎓 School Management System with AI Face Verification

> A comprehensive, full-stack school management platform with student result management, teacher attendance tracking, and AI-powered facial recognition verification.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.17+-green.svg)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-5.1.0-lightgrey.svg)](https://expressjs.com/)
[![Face-API.js](https://img.shields.io/badge/Face--API.js-0.22.2-orange.svg)](https://github.com/justadudewhohacks/face-api.js)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Face Verification System](#face-verification-system)
- [User Roles & Permissions](#user-roles--permissions)
- [Usage Guide](#usage-guide)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

The **School Management System** is an end-to-end web application designed to streamline academic operations in educational institutions. It provides three distinct user interfaces (Admin, Teacher, Student) with role-based access control, comprehensive student result management, teacher performance tracking, and cutting-edge **AI-powered face verification** for teacher attendance.

### Why This System?

- **🔐 Secure & Verified**: AI facial recognition prevents attendance fraud
- **📊 Data-Driven**: Real-time analytics and performance metrics
- **🌐 Multi-Lingual**: Supports multiple languages (i18n)
- **📱 Responsive**: Works seamlessly on desktop, tablet, and mobile
- **⚡ Fast & Scalable**: Built with modern technologies for optimal performance
- **🎨 Modern UI**: Clean, intuitive interface with Tailwind CSS


--- 

## 🚀 Key Features


### 👨‍💼 Admin Portal
- ✅ **Teacher Management**
  - Create, edit, delete teacher accounts
  - View detailed teacher profiles with performance metrics
  - Assign subjects and classes
  - Generate teacher timetables
  - Monitor teacher attendance records
  
- ✅ **Student Management**
  - Bulk student upload via Excel/CSV
  - Individual student registration
  - Student promotion across grades
  - Edit and manage student profiles
  
- ✅ **Result Management**
  - View all student results across all standards
  - Advanced filtering by class, term, academic year
  - Bulk result upload
  - Edit and delete results
  - Generate PDF report cards
  
- ✅ **Attendance Monitoring**
  - View all teacher attendance with location data
  - Filter by date range and teacher
  - Export attendance reports
  - Face verification logs

- ✅ **Analytics Dashboard**
  - Total students, teachers, results overview
  - Class-wise performance charts
  - Teacher performance metrics
  - Attendance statistics

### 👨‍🏫 Teacher Portal
- ✅ **AI Face Registration** (One-time setup)
  - Capture facial features using camera
  - 128-dimensional facial descriptor extraction
  - Quality validation (lighting, position, clarity)
  - Reference photo storage
  
- ✅ **Biometric Attendance Marking**
  - Real-time face verification with AI
  - GPS location validation (3km radius)
  - Match percentage calculation
  - Status selection (Present/Half-Day/Leave)
  
- ✅ **Result Management**
  - Upload student results (individual/bulk)
  - Edit submitted results
  - Subject-wise mark entry
  - Auto-calculation of totals and percentages
  
- ✅ **Student Operations**
  - Register new students
  - Bulk student upload
  - View and manage student records
  - Filter by class/section
  
- ✅ **Timetable Management**
  - View personal teaching schedule
  - Day-wise class allocation
  - Subject assignments

### 👨‍🎓 Student Portal
- ✅ **Account Management**
  - Self-registration with GR number
  - Secure login with password
  - Profile viewing
  
- ✅ **Result Viewing**
  - View all exam results
  - Subject-wise marks breakdown
  - Performance graphs
  - Download PDF report cards
  
- ✅ **Academic History**
  - Filter by term and academic year
  - Track progress over time
  - Remarks and feedback viewing

### 🤖 AI-Powered Features
- ✅ **Face Detection & Recognition**
  - Real-time face detection in camera stream
  - 128-dimensional facial embedding extraction
  - Euclidean distance similarity calculation
  - Anti-spoofing quality checks
  
- ✅ **Location Verification**
  - GPS-based geofencing
  - Distance calculation from school
  - Location spoofing prevention
  
- ✅ **Smart Validations**
  - Duplicate attendance prevention
  - Face registration enforcement
  - Match threshold (40% minimum)

### 📁 Document Management
- ✅ **Excel Import/Export**
  - Bulk student data upload
  - Bulk result upload
  - Template generation
  - Data validation
  
- ✅ **PDF Generation**
  - Professional report cards
  - School branding
  - Multiple term support
  - Auto-formatted marks tables

### 🌐 Additional Features
- ✅ **Multi-language Support** (i18next)
- ✅ **Responsive Design** (Mobile-first)
- ✅ **Dark Mode Ready**
- ✅ **Real-time Notifications** (Toast messages)
- ✅ **Advanced Search & Filters**
- ✅ **Data Export** (Excel, PDF)
- ✅ **Secure Authentication** (JWT tokens)
- ✅ **Password Encryption** (bcrypt)
- ✅ **API Rate Limiting**
- ✅ **Error Handling & Logging**

--- 
## 🏗️ System Architecture

### High-Level Architecture Diagram



┌─────────────────────────────────────────────────────────────────────────┐
│ CLIENT LAYER (Browser) │
├─────────────────────────────────────────────────────────────────────────┤
│ │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│ │ Admin Panel │ │Teacher Portal│ │Student Portal│ │
│ │ (React) │ │ (React) │ │ (React) │ │
│ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ │
│ │ │ │ │
│ └──────────────────┴──────────────────┘ │
│ │ │
│ ┌────────▼────────┐ │
│ │ React Router │ │
│ │ Redux Store │ │
│ │ Axios Client │ │
│ └────────┬────────┘ │
│ │ │
│ ┌─────────────────────────┴──────────────────────────┐ │
│ │ Face-API.js (Client-Side) │ │
│ │ • Face Detection • Descriptor Extraction │ │
│ │ • Live Camera • Quality Validation │ │
│ └────────────────────────────────────────────────────┘ │
│ │
└────────────────────────────┬─────────────────────────────────────────────┘
│ HTTPS/REST API
│
┌────────────────────────────▼─────────────────────────────────────────────┐
│ APPLICATION LAYER │
├──────────────────────────────────────────────────────────────────────────┤
│ Express.js Server │
│ (Node.js) │
│ │
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │ API Routes Layer │ │
│ ├────────────────────────────────────────────────────────────────┤ │
│ │ /api/auth │ Authentication & Authorization │ │
│ │ /api/admin │ Admin operations │ │
│ │ /api/teacher │ Teacher operations │ │
│ │ /api/student │ Student operations │ │
│ │ /api/results │ Result management │ │
│ │ /api/face │ Face registration & verification │ │
│ │ /api/teacher-attendance │ Attendance marking │ │
│ │ /api/bulk-students │ Bulk student upload │ │
│ │ /api/bulk-results │ Bulk result upload │ │
│ │ /api/pdf │ PDF generation │ │
│ │ /api/timetable │ Timetable management │ │
│ └────────────────────────────────────────────────────────────────┘ │
│ │
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │ Controller Layer │ │
│ ├────────────────────────────────────────────────────────────────┤ │
│ │ • authController • resultController │ │
│ │ • adminController • studentController │ │
│ │ • teacherController • faceRegistrationController │ │
│ │ • teacherAttendanceController • pdfController │ │
│ │ • bulkUploadController • timetableController │ │
│ └────────────────────────────────────────────────────────────────┘ │
│ │
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │ Middleware Layer │ │
│ ├────────────────────────────────────────────────────────────────┤ │
│ │ • JWT Authentication • Role-based Authorization │ │
│ │ • Request Validation • Error Handling │ │
│ │ • CORS • Body Parser │ │
│ │ • Multer (File Upload) • Rate Limiting │ │
│ └────────────────────────────────────────────────────────────────┘ │
│ │
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │ Service Layer │ │
│ ├────────────────────────────────────────────────────────────────┤ │
│ │ • Email Service (Nodemailer) │ │
│ │ • PDF Generation (PDFKit) │ │
│ │ • Excel Processing (ExcelJS, XLSX) │ │
│ │ • Face Verification (Euclidean Distance) │ │
│ │ • Geolocation Validation │ │
│ └────────────────────────────────────────────────────────────────┘ │
│ │
└────────────────────────────┬─────────────────────────────────────────────┘
│ MongoDB Driver (Mongoose)
│
┌────────────────────────────▼─────────────────────────────────────────────┐
│ DATA LAYER │
├──────────────────────────────────────────────────────────────────────────┤
│ MongoDB Database │
│ │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│ │ Users │ │ Students │ │ Results │ │
│ │ Collection │ │ Collection │ │ Collection │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ │
│ │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│ │ Teachers │ │ Timetables │ │ Attendance │ │
│ │ Collection │ │ Collection │ │ Collection │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ │
│ │
└──────────────────────────────────────────────────────────────────────────┘



### Request Flow Diagram


┌─────────────────────────────────────────────────────────────────────┐
│ TEACHER ATTENDANCE WITH FACE VERIFICATION │
└─────────────────────────────────────────────────────────────────────┘

Teacher Browser Backend Server Database
│ │ │
│ 1. Login │ │
├─────────────────────────────►│ │
│ POST /api/auth/login │ │
│ {email, password} │ │
│ │ 2. Verify credentials │
│ ├────────────────────────►│
│ │ User.findOne() │
│ │◄────────────────────────┤
│ │ {user + JWT token} │
│ 3. JWT Token │ │
│◄─────────────────────────────┤ │
│ │ │
│ 4. Navigate to Mark Attendance│ │
│ 5. Load Face Models │ │
│ (face-api.js) │ │
│ │ │
│ 6. Check Face Registration │ │
├─────────────────────────────►│ │
│ GET /api/face/status │ │
│ │ 7. Query user │
│ ├────────────────────────►│
│ │ User.findById() │
│ │◄────────────────────────┤
│ │ {faceRegistered: true}│
│ 8. Status Response │ │
│◄─────────────────────────────┤ │
│ │ │
│ 9. Get GPS Location │ │
│ (navigator.geolocation) │ │
│ │ │
│ 10. Open Camera │ │
│ (getUserMedia) │ │
│ │ │
│ 11. Capture Photo │ │
│ • Detect face │ │
│ • Extract 128D descriptor│ │
│ │ │
│ 12. Submit Attendance │ │
├─────────────────────────────►│ │
│ POST /api/teacher- │ │
│ attendance/mark │ │
│ { │ │
│ status: "present", │ │
│ location: {lat, lng}, │ │
│ faceDescriptor: [...] │ │
│ } │ │
│ │ 13. Verify Location │
│ │ (distance < 3km?) │
│ │ │
│ │ 14. Load stored face │
│ ├────────────────────────►│
│ │ User.findById() │
│ │◄────────────────────────┤
│ │ {faceDescriptor: [...]}│
│ │ │
│ │ 15. Compare Faces │
│ │ Calculate Euclidean │
│ │ Distance │
│ │ Match > 40%? │
│ │ │
│ │ 16. Save Attendance │
│ ├────────────────────────►│
│ │ Attendance.create() │
│ │◄────────────────────────┤
│ │ {saved record} │
│ 17. Success Response │ │
│◄─────────────────────────────┤ │
│ { │ │
│ success: true, │ │
│ match: "87.5%" │ │
│ } │ │
│ │ │
│ 18. Show Success Toast │ │
│ │ │


### Data Flow for Student Results


┌─────────────────────────────────────────────────────────────────────┐
│ STUDENT RESULT MANAGEMENT FLOW │
└─────────────────────────────────────────────────────────────────────┘

Teacher/Admin Backend Server Database
│ │ │
│ 1. Upload Result (Single) │ │
├─────────────────────────────►│ │
│ POST /api/results/upload │ │
│ { │ │
│ studentName, │ │
│ grNumber, │ │
│ standard, │ │
│ subjects: [{name,marks}]│ │
│ term, academicYear │ │
│ } │ │
│ │ 2. Validate JWT │
│ │ (authMiddleware) │
│ │ │
│ │ 3. Check permissions │
│ │ (teacher/admin only) │
│ │ │
│ │ 4. Calculate totals │
│ │ & percentage │
│ │ │
│ │ 5. Save to DB │
│ ├────────────────────────►│
│ │ Result.create() │
│ │◄────────────────────────┤
│ │ │
│ 6. Success Response │ │
│◄─────────────────────────────┤ │
│ │ │
│ 7. Bulk Upload (Excel) │ │
├─────────────────────────────►│ │
│ POST /api/bulk-results │ │
│ (multipart/form-data) │ │
│ file: results.xlsx │ │
│ │ 8. Parse Excel │
│ │ (XLSX library) │
│ │ │
│ │ 9. Validate each row │
│ │ • Check GR number │
│ │ • Validate marks │
│ │ • Check duplicates │
│ │ │
│ │ 10. Bulk insert │
│ ├────────────────────────►│
│ │ Result.insertMany() │
│ │◄────────────────────────┤
│ │ │
│ 11. Upload report │ │
│◄─────────────────────────────┤ │
│ { │ │
│ success: 45, │ │
│ failed: 2, │ │
│ errors: [...] │ │
│ } │ │
│ │ │

Student Backend Server Database
│ │ │
│ 1. View Results │ │
├─────────────────────────────►│ │
│ GET /api/student/results │ │
│ Header: JWT Token │ │
│ │ 2. Extract student ID │
│ │ from JWT │
│ │ │
│ │ 3. Fetch results │
│ ├────────────────────────►│
│ │ Result.find({ │
│ │ grNumber: "GR123" │
│ │ }) │
│ │◄────────────────────────┤
│ │ [results array] │
│ │ │
│ 4. Results List │ │
│◄─────────────────────────────┤ │
│ │ │
│ 5. Download PDF │ │
├─────────────────────────────►│ │
│ GET /api/pdf/generate/ │ │
│ :resultId │ │
│ │ 6. Fetch result details │
│ ├────────────────────────►│
│ │◄────────────────────────┤
│ │ │
│ │ 7. Generate PDF │
│ │ (PDFKit) │
│ │ • Add school logo │
│ │ • Format marks table │
│ │ • Add signatures │
│ │ │
│ 8. PDF Download │ │
│◄─────────────────────────────┤ │
│ (application/pdf) │ │
│ │ │

--- 

## 💻 Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.1.0 | UI component library |
| **React Router DOM** | 7.6.0 | Client-side routing |
| **Redux Toolkit** | 2.11.2 | State management |
| **Axios** | 1.9.0 | HTTP client for API calls |
| **Tailwind CSS** | 4.1.7 | Utility-first CSS framework |
| **Vite** | 6.3.5 | Build tool and dev server |
| **Face-API.js** | 0.22.2 | Client-side face detection & recognition |
| **React Hot Toast** | 2.5.2 | Toast notifications |
| **React Toastify** | 11.0.5 | Additional notifications |
| **i18next** | 25.5.2 | Internationalization |
| **Lucide React** | 0.511.0 | Icon library |
| **React Slick** | 0.31.0 | Carousel component |
| **XLSX** | 0.18.5 | Excel file processing |

### Backend Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 18+ | Runtime environment |
| **Express.js** | 5.1.0 | Web application framework |
| **MongoDB** | 6.17.0 | NoSQL database |
| **Mongoose** | 8.16.1 | MongoDB object modeling |
| **JWT** | 9.0.2 | JSON Web Tokens for auth |
| **bcryptjs** | 3.0.2 | Password hashing |
| **Multer** | 2.0.2 | File upload handling |
| **Nodemailer** | 7.0.11 | Email sending |
| **PDFKit** | 0.17.2 | PDF generation |
| **ExcelJS** | 4.4.0 | Excel file manipulation |
| **XLSX** | 0.18.5 | Excel parsing |
| **CORS** | 2.8.5 | Cross-origin resource sharing |
| **dotenv** | 17.0.1 | Environment variables |
| **Face-API.js** | 0.22.2 | Face verification (server-side) |
| **Nodemon** | 3.1.10 | Development auto-reload |

### AI & Machine Learning

| Model | Purpose | Size |
|-------|---------|------|
| **Tiny Face Detector** | Fast face detection | ~1 MB |
| **Face Landmark 68** | Facial landmark detection | ~350 KB |
| **Face Recognition Model** | 128D descriptor extraction | ~6.2 MB |
| **Face Expression Model** | Expression detection (optional) | ~310 KB |

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control
- **Postman** - API testing
- **VS Code** - Code editor

### Deployment & DevOps

- **PM2** - Process management (production)
- **Nginx** - Reverse proxy (optional)
- **Docker** - Containerization (optional)
- **MongoDB Atlas** - Cloud database
- **Vercel/Netlify** - Frontend hosting
- **Heroku/Railway** - Backend hosting

---

## 🗄️ Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  name: String,              // Full name
  email: String,             // Unique email
  password: String,          // Bcrypt hashed
  role: String,              // "admin" | "teacher" | "student"
  phoneNumber: String,       // Contact number
  
  // Teacher-specific fields
  employeeId: String,        // Unique teacher ID
  subject: String,           // Primary subject
  qualification: String,     // Educational qualification
  experience: Number,        // Years of experience
  joiningDate: Date,         // Date of joining
  
  // Student-specific fields
  grNumber: String,          // Unique GR number
  standard: String,          // Class/grade
  dateOfBirth: Date,         // Date of birth
  parentContact: String,     // Parent phone number
  
  // Face verification fields
  faceDescriptor: [Number],  // 128-dimensional array
  referenceFaceImage: String, // Base64 encoded image
  faceRegistered: Boolean,   // Registration status
  lastFaceUpdate: Date,      // Last registration update
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}

Results Collection


{
  _id: ObjectId,
  studentName: String,       // Student full name
  grNumber: String,          // Student GR number (indexed)
  dateOfBirth: Date,         // Student DOB
  standard: String,          // Class/grade (indexed)
  
  subjects: [
    {
      name: String,          // Subject name (e.g., "Mathematics")
      marks: Number,         // Obtained marks
      maxMarks: Number       // Maximum marks
    }
  ],
  
  remarks: String,           // Teacher remarks
  
  // Tracking fields
  uploadedBy: ObjectId,      // Reference to User (teacher/admin)
  uploadedByRole: String,    // "admin" | "teacher"
  
  // Academic details
  academicYear: String,      // e.g., "2024-25"
  term: String,              // "Term-1" | "Term-2" | "Mid-term" | "Final"
  examType: String,          // "ANNUAL EXAMINATION" etc.
  
  // Status
  status: String,            // "draft" | "published" | "archived"
  lastModifiedBy: ObjectId,  // Last editor reference
  lastModifiedAt: Date,      // Last modification time
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}

// Indexes
Index: { grNumber: 1, term: 1, academicYear: 1 } (unique)
Index: { standard: 1 }
Index: { uploadedBy: 1 }


TeacherAttendance Collection


{
  _id: ObjectId,
  teacherId: ObjectId,       // Reference to User
  teacherName: String,       // Full name
  date: Date,                // Attendance date (indexed)
  status: String,            // "present" | "absent" | "half-day" | "leave"
  
  // Location verification
  location: {
    latitude: Number,        // GPS latitude
    longitude: Number,       // GPS longitude
    timestamp: Date,         // Location capture time
    accuracy: Number         // GPS accuracy in meters
  },
  
  distance: Number,          // Distance from school (km)
  
  // Face verification
  faceVerified: Boolean,     // Verification success status
  faceMatchPercentage: Number, // Match percentage (0-100)
  capturedFaceImage: String, // Base64 image (optional)
  
  // Check-in/Check-out
  checkInTime: Date,         // Check-in timestamp
  checkOutTime: Date,        // Check-out timestamp (optional)
  
  // Approval
  approvedBy: ObjectId,      // Admin reference (if manual)
  approvalStatus: String,    // "pending" | "approved" | "rejected"
  rejectionReason: String,   // Reason if rejected
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}

// Indexes
Index: { teacherId: 1, date: 1 } (unique)
Index: { date: 1 }
Index: { status: 1 }

Teachers Collection (Performance)


{
  _id: ObjectId,
  teacherId: ObjectId,       // Reference to User
  academicYear: String,      // e.g., "2024-25"
  term: String,              // "Term-1" etc.
  
  metrics: {
    totalResultsUploaded: Number,
    totalStudentsTaught: Number,
    classAveragePercentage: Number,
    passPercentage: Number,
    
    topScorer: {
      studentName: String,
      marks: Number,
      grNumber: String
    },
    
    subjectWisePerformance: [
      {
        subject: String,
        averageMarks: Number,
        totalStudents: Number
      }
    ]
  },
  
  uploadHistory: [
    {
      date: Date,
      resultCount: Number,
      standard: String
    }
  ],
  
  ratings: {
    adminRating: Number,     // 1-5 scale
    studentFeedback: Number, // Average feedback
    punctuality: Number      // Based on attendance
  },
  
  createdAt: Date,
  updatedAt: Date
}

Timetables Collection


{
  _id: ObjectId,
  teacherId: ObjectId,       // Reference to User
  teacherName: String,       // Full name
  academicYear: String,      // e.g., "2024-25"
  
  schedule: [
    {
      day: String,           // "Monday" - "Saturday"
      periods: [
        {
          periodNumber: Number, // 1-8
          startTime: String,    // "09:00 AM"
          endTime: String,      // "09:45 AM"
          subject: String,      // Subject name
          standard: String,     // Class
          room: String          // Room number (optional)
        }
      ]
    }
  ],
  
  createdAt: Date,
  updatedAt: Date
}

// Index
Index: { teacherId: 1 } (unique)

Students Collection (Basic)

{
  _id: ObjectId,
  studentName: String,       // Full name
  grNumber: String,          // Unique GR number (indexed)
  dateOfBirth: Date,         // DOB
  standard: String,          // Current class
  section: String,           // Section (A, B, C)
  rollNumber: Number,        // Roll number
  
  parentDetails: {
    fatherName: String,
    motherName: String,
    contact: String,
    email: String,
    address: String
  },
  
  previousStandard: String,  // For promotion tracking
  promotionHistory: [
    {
      fromStandard: String,
      toStandard: String,
      academicYear: String,
      promotionDate: Date
    }
  ],
  
  status: String,            // "active" | "inactive" | "transferred"
  
  createdAt: Date,
  updatedAt: Date
}

// Index
Index: { grNumber: 1 } (unique)
Index: { standard: 1 }

Database Relationships


Users (role: teacher)
   │
   ├──► Results (uploadedBy)
   ├──► TeacherAttendance (teacherId)
   ├──► Teachers (teacherId)
   └──► Timetables (teacherId)

Results
   │
   └──► Students (grNumber) [Logical reference]

TeacherAttendance
   │
   └──► Users (approvedBy)

```
   
---

# **SECTION 6: Project Structure**

```markdown
## 📂 Project Structure


Result/
│
├── 📁 Backend/ # Node.js Backend
│ ├── 📄 server.js # Main server entry point
│ ├── 📄 package.json # Backend dependencies
│ ├── 📄 seedData.js # Database seeding script
│ ├── 📄 testRoutes.js # Route testing utility
│ │
│ ├── 📁 config/ # Configuration files
│ │ ├── db.js # MongoDB connection
│ │ └── emailConfig.js # Email service config
│ │
│ ├── 📁 controllers/ # Business logic
│ │ ├── authController.js # Authentication logic
│ │ ├── adminController.js # Admin operations
│ │ ├── adminTeacherController.js # Teacher management
│ │ ├── teacherController.js # Teacher operations
│ │ ├── studentController.js # Student operations
│ │ ├── resultController.js # Result management
│ │ ├── faceRegistrationController.js # Face registration
│ │ ├── teacherAttendanceController.js # Attendance with verification
│ │ ├── bulkResultController.js # Bulk result upload
│ │ ├── bulkStudentController.js # Bulk student upload
│ │ ├── studentManagementController.js # Student CRUD
│ │ ├── studentPromotionController.js # Student promotion
│ │ ├── fetchResultController.js # Result retrieval
│ │ ├── pdfController.js # PDF generation
│ │ ├── timetableController.js # Timetable management
│ │ └── userController.js # User management
│ │
│ ├── 📁 models/ # Mongoose schemas
│ │ ├── User.js # User model (with face data)
│ │ ├── Result.js # Result model
│ │ ├── Student.js # Student model
│ │ ├── Teacher.js # Teacher performance model
│ │ ├── TeacherAttendance.js # Attendance model
│ │ └── Timetable.js # Timetable model
│ │
│ ├── 📁 routes/ # API routes
│ │ ├── authRoutes.js # /api/auth/*
│ │ ├── adminRoutes.js # /api/admin/*
│ │ ├── adminTeacherRoutes.js # /api/admin/teachers/*
│ │ ├── teacherRoutes.js # /api/teacher/*
│ │ ├── studentRoutes.js # /api/student/*
│ │ ├── resultRoutes.js # /api/results/*
│ │ ├── faceRegistrationRoutes.js # /api/face/*
│ │ ├── teacherAttendanceRoutes.js # /api/teacher-attendance/*
│ │ ├── bulkResultRoutes.js # /api/bulk-results/*
│ │ ├── bulkStudentRoutes.js # /api/bulk-students/*
│ │ ├── studentManagementRoutes.js # /api/student-management/*
│ │ ├── studentPromotionRoutes.js # /api/student-promotion/*
│ │ ├── pdfRoutes.js # /api/pdf/*
│ │ ├── timetableRoutes.js # /api/timetables/*
│ │ ├── userRoutes.js # /api/users/*
│ │ └── adminAttendanceRoutes.js # /api/admin/attendance/*
│ │
│ ├── 📁 middleware/ # Express middleware
│ │ └── authMiddleware.js # JWT verification & authorization
│ │
│ ├── 📁 utils/ # Utility functions
│ │ ├── emailService.js # Email sending service
│ │ └── standardFormatter.js # Data formatting utilities
│ │
│ └── 📁 scripts/ # Utility scripts
│ ├── fixResultIndexes.js # Database maintenance
│ ├── testRajesh.js # Test script
│ └── updateTeachers.js # Teacher data update
│
├── 📁 Frontend/ # React Frontend
│ ├── 📄 index.html # HTML entry point
│ ├── 📄 package.json # Frontend dependencies
│ ├── 📄 vite.config.js # Vite configuration
│ ├── 📄 eslint.config.js # ESLint configuration
│ │
│ ├── 📁 public/ # Static assets
│ │ └── 📁 models/ # Face-API.js AI models
│ │ ├── tiny_face_detector_model-*
│ │ ├── face_landmark_68_model-*
│ │ ├── face_recognition_model-*
│ │ └── face_expression_model-*
│ │
│ └── 📁 src/ # Source code
│ ├── 📄 main.jsx # React entry point
│ ├── 📄 App.jsx # Main App component with routes
│ ├── 📄 App.css # Global styles
│ ├── 📄 index.css # Base styles
│ ├── 📄 i18n.js # Internationalization setup
│ │
│ ├── 📁 api/ # API configuration
│ │ └── axios.js # Axios instance setup
│ │
│ ├── 📁 assets/ # Images, fonts, etc.
│ │
│ ├── 📁 components/ # React components
│ │ ├── Home.jsx # Landing page
│ │ ├── Navbar.jsx # Navigation bar
│ │ ├── Activities.jsx # Activities page
│ │ ├── LoginModal.jsx # Login modal
│ │ │
│ │ ├── 👨‍💼 Admin Components
│ │ ├── AdminLogin.jsx
│ │ ├── AdminDashboard.jsx
│ │ ├── AdminCreateTeacher.jsx
│ │ ├── AdminEditTeacher.jsx
│ │ ├── AdminTeacherDetail.jsx
│ │ ├── AdminCreateStudent.jsx
│ │ ├── AdminResultView.jsx
│ │ ├── AdminAttendanceView.jsx
│ │ │
│ │ ├── 👨‍🏫 Teacher Components
│ │ ├── TeacherLogin.jsx
│ │ ├── TeacherDashboard.jsx
│ │ ├── RegisterFace.jsx # 🔥 Face registration
│ │ ├── TeacherMarkAttendance.jsx # 🔥 Attendance with face verification
│ │ ├── UploadResult.jsx
│ │ ├── TeacherEditResult.jsx
│ │ ├── BulkResultUpload.jsx
│ │ ├── BulkStudentUpload.jsx
│ │ ├── ManageStudents.jsx
│ │ ├── PromoteStudents.jsx
│ │ ├── RegisterStudent.jsx
│ │ ├── TeacherTimetable.jsx
│ │ │
│ │ └── 👨‍🎓 Student Components
│ │ ├── StudentRegister.jsx
│ │ ├── StudentLogin.jsx
│ │ ├── StudentDashboard.jsx
│ │ ├── StudentResultDetail.jsx
│ │ └── ViewResult.jsx
│ │
│ ├── 📁 redux/ # Redux store
│ │ ├── store.js # Redux store configuration
│ │ └── slices/ # Redux slices
│ │
│ ├── 📁 locales/ # Translation files
│ │ ├── en/ # English translations
│ │ └── hi/ # Hindi translations
│ │
│ └── 📁 data/ # Static data
│ └── activitiesData.js # Activities content
│
├── 📁 Documentation/ # Project documentation
│ ├── 📄 README.md # This file
│ ├── 📄 ARCHITECTURE.md # System architecture details
│ ├── 📄 IMPLEMENTATION_SUMMARY.md # Implementation details
│ ├── 📄 FACE_VERIFICATION_README.md # Face verification docs
│ ├── 📄 FACE_VERIFICATION_SETUP.md # Setup guide
│ └── 📄 QUICK_START.md # Quick start guide
│
├── 📁 Scripts/ # Setup scripts
│ ├── 📄 download-models.bat # Windows model download script
│ ├── 📄 download-models.sh # Linux/Mac model download script
│ └── 📄 install.ps1 # PowerShell installation script
│
├── 📄 .gitignore # Git ignore file
├── 📄 .env.example # Environment variables template
└── 📄 LICENSE # Project license




### Key Directories Explained

#### Backend Controllers
Each controller handles specific business logic:
- **authController**: Login, registration, JWT generation
- **faceRegistrationController**: Face registration and updates
- **teacherAttendanceController**: Attendance marking with face & location verification
- **bulkResultController**: Excel parsing and bulk insertion
- **pdfController**: Dynamic PDF report card generation

#### Frontend Components
Organized by user role:
- **Admin**: User management, oversight, analytics
- **Teacher**: Result upload, attendance, student management
- **Student**: Result viewing, profile management

#### Middleware
- **authMiddleware**: Verifies JWT tokens and checks user roles

#### Models
Mongoose schemas defining database structure with validation

#### Public Models
AI model files for face-api.js (must be downloaded separately)

---

## 🚀 Installation & Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download here](https://www.mongodb.com/try/download/community) or use MongoDB Atlas
- **npm** or **yarn** - Package manager (comes with Node.js)
- **Git** - Version control [Download here](https://git-scm.com/)
- **Web Browser** - Chrome/Edge (recommended for face verification)

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/school-management-system.git
cd school-management-system
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd Backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your configuration
nano .env  # or use your preferred editor
```

**Required Environment Variables (.env):**

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/school_management
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/school_management

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRE=7d

# Email Configuration (Optional - for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=School Management <noreply@school.com>

# School Location (for attendance verification)
SCHOOL_LATITUDE=28.6139
SCHOOL_LONGITUDE=77.2090
MAX_DISTANCE_KM=3

# File Upload
MAX_FILE_SIZE=10485760  # 10MB in bytes

# Face Verification
FACE_MATCH_THRESHOLD=0.6  # 60% match required
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd Frontend

# Install dependencies
npm install

# Create .env file (optional)
nano .env
```

**Frontend Environment Variables (.env - optional):**

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=School Management System
```

### Step 4: Download AI Models

Face verification requires pre-trained models. Download them using:

**Windows:**
```bash
# From project root
.\download-models.bat
```

**Linux/Mac:**
```bash
# From project root
chmod +x download-models.sh
./download-models.sh
```

**Manual Download:**
If scripts don't work, manually download models from [face-api.js models](https://github.com/justadudewhohacks/face-api.js/tree/master/weights) and place them in `Frontend/public/models/`

Required files:
- `tiny_face_detector_model-weights_manifest.json`
- `tiny_face_detector_model-shard1`
- `face_landmark_68_model-weights_manifest.json`
- `face_landmark_68_model-shard1`
- `face_recognition_model-weights_manifest.json`
- `face_recognition_model-shard1`
- `face_recognition_model-shard2`

### Step 5: Seed Database (Optional)

```bash
# From Backend directory
node seedData.js
```

This creates:
- 1 Admin account (email: admin@school.com, password: admin123)
- 5 Sample teachers
- 20 Sample students
- 50 Sample results

### Step 6: Start the Application

**Terminal 1 - Backend:**
```bash
cd Backend
npm start
# Or for development with auto-reload:
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
```

### Step 7: Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Test**: http://localhost:5000/

### Default Login Credentials

After seeding:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@school.com | admin123 |
| **Teacher** | teacher1@school.com | teacher123 |
| **Student** | Register with GR number | Create password |

**⚠️ Important:** Change default passwords immediately in production!

---

## ⚙️ Configuration

### MongoDB Configuration

**Local MongoDB:**
```javascript
MONGO_URI=mongodb://localhost:27017/school_management
```

**MongoDB Atlas (Cloud):**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster
3. Get connection string:
```javascript
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/school_management?retryWrites=true&w=majority
```

### School Location Configuration

Update school coordinates for attendance verification:

**File:** `Backend/controllers/teacherAttendanceController.js`

```javascript
const SCHOOL_LOCATION = {
  latitude: 28.6139,   // Your school's latitude
  longitude: 77.2090,  // Your school's longitude
  maxDistance: 3       // Maximum distance in kilometers
};
```

To find your school's coordinates:
1. Open Google Maps
2. Right-click on your school location
3. Click on the coordinates to copy them

### Email Configuration

For sending notifications (optional):

**Gmail Setup:**
1. Enable 2-factor authentication
2. Generate App Password: [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Use App Password in `.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=generated-app-password
```

### Face Verification Threshold

Adjust face matching sensitivity:

**File:** `Backend/controllers/teacherAttendanceController.js`

```javascript
const FACE_MATCH_THRESHOLD = 0.6;  // 60% similarity required
// Lower value = stricter matching
// Higher value = more lenient matching
// Recommended range: 0.5 - 0.7
```

### CORS Configuration

Update allowed origins for production:

**File:** `Backend/server.js`

```javascript
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:5173', 'https://yourschool.com'],
  credentials: true
}));
```

---

## 📡 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication

All protected routes require JWT token in header:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN'
}
```

### API Endpoints

#### 🔐 Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| GET | `/auth/me` | Get current user | Yes |
| PUT | `/auth/updatepassword` | Update password | Yes |

**Example: Login**
```javascript
POST /api/auth/login
Content-Type: application/json

{
  "email": "teacher@school.com",
  "password": "password123"
}

// Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "teacher@school.com",
    "role": "teacher",
    "faceRegistered": true
  }
}
```

#### 👨‍🏫 Teacher Routes (`/api/teacher`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/teacher/profile` | Get teacher profile | Yes (Teacher) |
| PUT | `/teacher/profile` | Update profile | Yes (Teacher) |
| GET | `/teacher/results` | Get uploaded results | Yes (Teacher) |
| GET | `/teacher/students` | Get students list | Yes (Teacher) |

#### 🎓 Student Routes (`/api/student`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/student/results` | Get student results | Yes (Student) |
| GET | `/student/result/:id` | Get specific result | Yes (Student) |
| GET | `/student/profile` | Get student profile | Yes (Student) |

#### 📊 Result Routes (`/api/results`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/results/upload` | Upload single result | Yes (Teacher/Admin) |
| GET | `/results` | Get all results | Yes (Teacher/Admin) |
| GET | `/results/:id` | Get result by ID | Yes |
| PUT | `/results/:id` | Update result | Yes (Teacher/Admin) |
| DELETE | `/results/:id` | Delete result | Yes (Admin) |
| GET | `/results/student/:grNumber` | Get student results | Yes |

**Example: Upload Result**
```javascript
POST /api/results/upload
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "studentName": "Rahul Kumar",
  "grNumber": "GR2024001",
  "dateOfBirth": "2010-05-15",
  "standard": "10th",
  "academicYear": "2024-25",
  "term": "Term-1",
  "subjects": [
    { "name": "Mathematics", "marks": 85, "maxMarks": 100 },
    { "name": "Science", "marks": 92, "maxMarks": 100 },
    { "name": "English", "marks": 78, "maxMarks": 100 }
  ],
  "remarks": "Excellent performance"
}

// Response:
{
  "success": true,
  "message": "Result uploaded successfully",
  "result": {
    "_id": "507f1f77bcf86cd799439011",
    "studentName": "Rahul Kumar",
    "totalMarks": 255,
    "percentage": 85,
    ...
  }
}
```

#### 📤 Bulk Upload Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/bulk-students/upload` | Bulk student upload | Yes (Admin) |
| POST | `/bulk-results/upload` | Bulk result upload | Yes (Teacher/Admin) |
| GET | `/bulk-students/template` | Download Excel template | Yes |
| GET | `/bulk-results/template` | Download Excel template | Yes |

**Example: Bulk Result Upload**
```javascript
POST /api/bulk-results/upload
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

FormData:
- file: results.xlsx
- academicYear: "2024-25"
- term: "Term-1"

// Response:
{
  "success": true,
  "message": "Bulk upload completed",
  "stats": {
    "total": 50,
    "successful": 48,
    "failed": 2
  },
  "errors": [
    { "row": 5, "error": "Invalid GR number" },
    { "row": 12, "error": "Duplicate entry" }
  ]
}
```

#### 🤖 Face Registration Routes (`/api/face`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/face/register` | Register face | Yes (Teacher) |
| PUT | `/face/update` | Update face data | Yes (Teacher) |
| GET | `/face/status` | Check registration status | Yes (Teacher) |
| DELETE | `/face/delete` | Delete face data | Yes (Teacher) |

**Example: Register Face**
```javascript
PUT /api/face/update
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "faceDescriptor": [0.123, -0.456, 0.789, ...], // 128 numbers
  "referenceImage": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}

// Response:
{
  "success": true,
  "message": "Face registered successfully",
  "faceRegistered": true
}
```

#### ✅ Attendance Routes (`/api/teacher-attendance`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/teacher-attendance/mark` | Mark attendance | Yes (Teacher) |
| GET | `/teacher-attendance/my-attendance` | Get own attendance | Yes (Teacher) |
| GET | `/teacher-attendance/today` | Today's attendance | Yes (Admin) |
| GET | `/teacher-attendance/:teacherId` | Teacher attendance history | Yes (Admin) |

**Example: Mark Attendance with Face Verification**
```javascript
POST /api/teacher-attendance/mark
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "status": "present",
  "location": {
    "latitude": 28.6145,
    "longitude": 77.2085,
    "accuracy": 15
  },
  "faceDescriptor": [0.123, -0.456, ...], // 128 numbers
  "capturedImage": "data:image/jpeg;base64,..." // Optional
}

// Response:
{
  "success": true,
  "message": "Attendance marked successfully",
  "attendance": {
    "_id": "507f1f77bcf86cd799439011",
    "date": "2026-01-07",
    "status": "present",
    "faceVerified": true,
    "faceMatchPercentage": 87.5,
    "distance": 0.8,
    "checkInTime": "2026-01-07T09:15:00.000Z"
  }
}
```

#### 📄 PDF Routes (`/api/pdf`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/pdf/generate/:resultId` | Generate PDF report | Yes |
| GET | `/pdf/bulk-generate` | Generate multiple PDFs | Yes (Admin) |

#### 👨‍💼 Admin Routes (`/api/admin`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/admin/dashboard` | Dashboard statistics | Yes (Admin) |
| POST | `/admin/create-teacher` | Create teacher | Yes (Admin) |
| PUT | `/admin/teacher/:id` | Update teacher | Yes (Admin) |
| DELETE | `/admin/teacher/:id` | Delete teacher | Yes (Admin) |
| GET | `/admin/teachers` | List all teachers | Yes (Admin) |
| GET | `/admin/attendance` | All attendance records | Yes (Admin) |

### Error Responses

All API errors follow this format:

```javascript
{
  "success": false,
  "error": "Error message here",
  "statusCode": 400
}
```

Common Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## 🤖 Face Verification System

### How It Works

The face verification system uses **face-api.js**, a JavaScript API for face detection and recognition built on TensorFlow.js.

#### Technology Stack

1. **Tiny Face Detector** - Lightweight CNN for fast face detection
2. **Face Landmark Model** - Detects 68 facial landmarks
3. **Face Recognition Model** - Extracts 128-dimensional face descriptors

#### Process Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   FACE VERIFICATION FLOW                    │
└─────────────────────────────────────────────────────────────┘

Step 1: REGISTRATION (One-time)
├─ Teacher opens camera
├─ System detects face in real-time
├─ Validates face quality:
│  ├─ Face centered (±20% from center)
│  ├─ Appropriate size (20-80% of frame)
│  └─ Good lighting (brightness check)
├─ Extracts 128D face descriptor
└─ Stores in database with reference image

Step 2: VERIFICATION (Daily attendance)
├─ Teacher captures photo
├─ System extracts 128D descriptor from captured image
├─ Loads stored descriptor from database
├─ Calculates Euclidean distance:
│  
│  distance = √(Σ(desc1[i] - desc2[i])²)
│  
│  Match% = (1 - distance) × 100
│
├─ Compares with threshold (default: 60%)
└─ Approves if match ≥ threshold
```

### Face Descriptor

A **face descriptor** is a 128-dimensional numerical array representing unique facial features:

```javascript
[
  0.123, -0.456, 0.789, -0.234, 0.567, ...
  // 128 numbers total
]
```

**Why 128 dimensions?**
- Optimized balance between accuracy and performance
- Each dimension represents specific facial features
- Mathematically comparable using Euclidean distance

### Similarity Calculation

**Euclidean Distance Formula:**

```
distance = √(Σ(a[i] - b[i])²) for i = 0 to 127
```

**Match Percentage:**

```javascript
matchPercentage = (1 - distance) × 100

// Example:
// distance = 0.25 → match = 75%
// distance = 0.40 → match = 60%
// distance = 0.55 → match = 45% (Rejected)
```

### Quality Checks

Before registration, the system validates:

1. **Face Detection** - At least one face must be detected
2. **Face Centering** - Face must be within center 60% of frame
3. **Face Size** - Face must occupy 20-80% of frame
4. **No Multiple Faces** - Only one person should be visible
5. **Lighting** - Adequate brightness for clear features

### Security Features

✅ **Liveness Detection**
- Quality validation prevents photo spoofing
- Real-time camera feed required (no uploads)

✅ **Secure Storage**
- Face descriptors encrypted in database
- Reference images stored as Base64

✅ **Privacy**
- No raw biometric data exposed via API
- Facial data deletable by user

✅ **Threshold Protection**
- Minimum 60% match required
- Prevents false positives

### Troubleshooting Face Verification

**❌ Face Not Detected**
- Ensure adequate lighting
- Face camera directly
- Remove glasses/mask
- Clean camera lens

**❌ Low Match Percentage**
- Use same appearance as registration
- Maintain consistent lighting
- Ensure stable camera
- Re-register if appearance changed significantly

**❌ Models Not Loading**
- Check browser console for errors
- Verify models exist in `Frontend/public/models/`
- Re-run `download-models.bat/sh`
- Check internet connection

**❌ Camera Access Denied**
- Enable camera permissions in browser
- Use HTTPS or localhost (required for getUserMedia)
- Use Chrome/Edge (best support)

---

## 👥 User Roles & Permissions

### Role Hierarchy

```
        ┌─────────┐
        │  ADMIN  │  ← Full access
        └────┬────┘
             │
        ┌────▼────┐
        │ TEACHER │  ← Limited management
        └────┬────┘
             │
        ┌────▼────┐
        │ STUDENT │  ← View only
        └─────────┘
```

### Detailed Permissions

#### 🔴 Admin

**Full System Access:**

| Feature | Create | Read | Update | Delete |
|---------|--------|------|--------|--------|
| Teachers | ✅ | ✅ | ✅ | ✅ |
| Students | ✅ | ✅ | ✅ | ✅ |
| Results | ✅ | ✅ | ✅ | ✅ |
| Attendance | ❌ | ✅ | ✅ | ✅ |
| Timetables | ✅ | ✅ | ✅ | ✅ |
| Users | ✅ | ✅ | ✅ | ✅ |

**Special Privileges:**
- View all system analytics
- Override attendance records
- Manage teacher accounts
- Access audit logs
- Export all data
- System configuration

#### 🟡 Teacher

**Limited Management:**

| Feature | Create | Read | Update | Delete |
|---------|--------|------|--------|--------|
| Teachers | ❌ | ❌ | ❌ | ❌ |
| Students | ✅ | ✅ | ✅ | ❌ |
| Results | ✅ | ✅ | ✅ (Own) | ❌ |
| Attendance | ✅ (Self) | ✅ (Self) | ❌ | ❌ |
| Timetables | ❌ | ✅ (Self) | ❌ | ❌ |

**Capabilities:**
- Upload student results (individual/bulk)
- Register new students
- Edit own uploaded results
- Mark own attendance with face verification
- View own timetable
- Download student reports
- Manage assigned students

#### 🟢 Student

**View-Only Access:**

| Feature | Create | Read | Update | Delete |
|---------|--------|------|--------|--------|
| Teachers | ❌ | ❌ | ❌ | ❌ |
| Students | ❌ | ❌ | ❌ | ❌ |
| Results | ❌ | ✅ (Own) | ❌ | ❌ |
| Attendance | ❌ | ❌ | ❌ | ❌ |
| Timetables | ❌ | ❌ | ❌ | ❌ |

**Capabilities:**
- View own results
- Download PDF report cards
- View academic history
- Update profile (limited)
- View performance graphs

### Authorization Implementation

**Middleware:** `Backend/middleware/authMiddleware.js`

```javascript
// Protect routes
router.get('/results', protect, getResults);

// Role-based access
router.post('/upload', protect, authorize('teacher', 'admin'), uploadResult);

// Admin only
router.delete('/user/:id', protect, authorize('admin'), deleteUser);
```

---

## 📖 Usage Guide

### For Administrators

#### Initial Setup

1. **Login as Admin**
   - Navigate to `/admin/login`
   - Use default credentials or created account

2. **Create Teacher Accounts**
   - Go to "Create Teacher"
   - Fill in details:
     - Name, Email, Phone
     - Employee ID
     - Subject, Qualification
     - Experience, Joining Date
   - Teacher receives credentials

3. **Upload Students (Bulk)**
   - Download template from "Bulk Upload Students"
   - Fill Excel with student data
   - Upload file
   - Review errors and re-upload if needed

4. **Configure School Location**
   - Edit `Backend/controllers/teacherAttendanceController.js`
   - Update `SCHOOL_LOCATION` coordinates

#### Daily Operations

1. **Monitor Attendance**
   - Dashboard → "View Attendance"
   - Filter by date, teacher
   - Check face verification status
   - Review location data

2. **Review Results**
   - "View Results" section
   - Filter by class, term
   - Verify teacher uploads
   - Generate reports

3. **Manage Teachers**
   - View teacher list
   - Check performance metrics
   - Update details
   - Manage timetables

### For Teachers

#### First-Time Setup

1. **Login**
   - Use credentials provided by admin
   - Navigate to `/teacher/login`

2. **Register Face (Mandatory)**
   - Dashboard → "Register Face"
   - Click "Start Camera"
   - Position face in center
   - Ensure good lighting
   - Click "Capture Face"
   - Review preview
   - Click "Confirm & Register"
   - ✅ Face registered successfully!

#### Daily Routine

**Mark Attendance:**

1. Navigate to "Mark Attendance"
2. Select status (Present/Half-Day/Leave)
3. Click "Capture Location"
   - Allow GPS permission
   - Wait for accurate location
4. Click "Open Camera"
   - Allow camera permission
5. Capture photo
   - System auto-detects face
   - Shows match percentage
6. Click "Submit Attendance"
7. ✅ Attendance marked!

**Upload Results:**

**Single Result:**
1. Dashboard → "Upload Result"
2. Fill student details
3. Add subjects and marks
4. System auto-calculates total and percentage
5. Add remarks
6. Submit

**Bulk Upload:**
1. "Bulk Upload Results"
2. Download template
3. Fill Excel file
4. Upload completed file
5. Review success/error report

**Manage Students:**
1. "Manage Students"
2. View, search, filter
3. Edit student details
4. Promote students (admin may restrict)

### For Students

#### Registration

1. Navigate to `/student/register`
2. Enter GR Number
3. Fill personal details
4. Create password
5. Register

#### Viewing Results

1. Login at `/student/login`
2. Dashboard shows all results
3. Filter by term, academic year
4. Click result to view details:
   - Subject-wise marks
   - Total and percentage
   - Teacher remarks
5. Download PDF report card

---

## 🚀 Deployment

### Production Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Update JWT secret (strong, random)
- [ ] Configure production MongoDB URI
- [ ] Set up email service
- [ ] Update school location coordinates
- [ ] Configure CORS for production domain
- [ ] Enable HTTPS/SSL
- [ ] Set up environment variables
- [ ] Test face verification in production
- [ ] Configure backup strategy
- [ ] Set up monitoring/logging
- [ ] Review security headers

### Backend Deployment

#### Option 1: Heroku

```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create your-school-backend

# Set environment variables
heroku config:set MONGO_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Open app
heroku open
```

#### Option 2: Railway

1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically on push

#### Option 3: VPS (Ubuntu)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone your-repo-url
cd Backend

# Install dependencies
npm install --production

# Start with PM2
pm2 start server.js --name school-backend
pm2 startup
pm2 save

# Configure Nginx reverse proxy
sudo apt install nginx
sudo nano /etc/nginx/sites-available/school
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name api.yourschool.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Frontend Deployment

#### Option 1: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd Frontend
vercel

# Set production environment variables in Vercel dashboard
```

#### Option 2: Netlify

```bash
# Build project
npm run build

# Drag and drop 'dist' folder to Netlify

# Or use CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### Option 3: Static Hosting

```bash
# Build
npm run build

# Upload 'dist' folder to:
# - AWS S3 + CloudFront
# - Azure Static Web Apps
# - GitHub Pages
# - Firebase Hosting
```

### MongoDB Deployment

#### MongoDB Atlas (Recommended)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Whitelist IP addresses (0.0.0.0/0 for any)
4. Create database user
5. Get connection string
6. Update `MONGO_URI` in environment variables

### Environment Variables Management

**Production .env:**
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=complex_random_string_here
JWT_EXPIRE=7d
SCHOOL_LATITUDE=28.6139
SCHOOL_LONGITUDE=77.2090
MAX_DISTANCE_KM=3
FACE_MATCH_THRESHOLD=0.6
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=school@example.com
EMAIL_PASS=app_password_here
```

### SSL/HTTPS Setup

**Using Let's Encrypt (Free):**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourschool.com -d www.yourschool.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Monitoring & Logging

**PM2 Monitoring:**
```bash
pm2 status
pm2 logs school-backend
pm2 monit
```

**Error Tracking:**
- [Sentry](https://sentry.io/) - Error tracking
- [LogRocket](https://logrocket.com/) - Frontend monitoring
- [DataDog](https://www.datadoghq.com/) - Full-stack monitoring

---

## 🔧 Troubleshooting

### Common Issues

#### Backend Issues

**❌ MongoDB Connection Error**
```
Error: MongooseServerSelectionError: connect ECONNREFUSED
```

**Solutions:**
1. Check MongoDB is running: `sudo systemctl status mongod`
2. Verify connection string in `.env`
3. Check network firewall/security groups
4. For Atlas: Whitelist IP address

**❌ JWT Token Invalid**
```
Error: jwt malformed
```

**Solutions:**
1. Clear browser localStorage
2. Re-login to get new token
3. Check JWT_SECRET is same on all servers

**❌ Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**
```bash
# Find process using port
lsof -i :5000
# Kill process
kill -9 PID
# Or change port in .env
PORT=5001
```

#### Frontend Issues

**❌ Cannot Connect to Backend**
```
Network Error / CORS Error
```

**Solutions:**
1. Check backend is running
2. Verify API URL in axios config
3. Check CORS configuration in backend
4. Ensure same protocol (HTTP/HTTPS)

**❌ Face Models Not Loading**
```
Error loading models
```

**Solutions:**
1. Check models exist in `public/models/`
2. Verify file names match exactly
3. Re-download models
4. Check browser console for 404 errors
5. Clear browser cache

**❌ Camera Not Working**
```
Permission denied / NotAllowedError
```

**Solutions:**
1. Use HTTPS or localhost
2. Enable camera in browser settings
3. Try different browser (Chrome recommended)
4. Check camera not in use by another app

#### Face Verification Issues

**❌ Face Not Detected**
**Solutions:**
- Improve lighting
- Face camera directly
- Remove glasses/mask
- Move closer to camera
- Clean camera lens

**❌ Low Match Percentage (<60%)**
**Solutions:**
- Ensure consistent appearance
- Check lighting conditions
- Use same angle as registration
- Re-register face if appearance changed
- Adjust threshold if needed

**❌ Location Verification Failed**
**Solutions:**
- Enable GPS/location services
- Allow location permission in browser
- Wait for accurate GPS lock
- Check school coordinates configured correctly
- Verify within 3km radius

#### Deployment Issues

**❌ Build Fails**
```
npm ERR! code ELIFECYCLE
```

**Solutions:**
```bash
# Clear cache
npm cache clean --force
# Remove node_modules
rm -rf node_modules package-lock.json
# Reinstall
npm install
```

**❌ Environment Variables Not Working**
**Solutions:**
1. Check .env file exists
2. Restart server after changing .env
3. For Vite: Variables must start with `VITE_`
4. For production: Set in hosting platform dashboard

### Debug Mode

**Enable verbose logging:**

**Backend:**
```javascript
// server.js
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}
```

**Frontend:**
```javascript
// Check localStorage
console.log(localStorage.getItem('token'));
console.log(localStorage.getItem('user'));

// Check API calls
// Open DevTools → Network tab
```

### Performance Issues

**Slow Face Detection:**
- Use "Tiny Face Detector" model (fastest)
- Reduce video resolution
- Close other tabs/applications

**Database Slow Queries:**
- Check indexes exist
- Use `.explain()` on queries
- Add compound indexes for filters
- Consider pagination

### Getting Help

1. **Check Documentation:**
   - README.md (this file)
   - ARCHITECTURE.md
   - FACE_VERIFICATION_README.md

2. **Browser Console:**
   - F12 → Console tab
   - Check for errors

3. **Server Logs:**
   ```bash
   # Development
   Check terminal output
   
   # Production (PM2)
   pm2 logs school-backend
   ```

4. **Community Support:**
   - GitHub Issues
   - Stack Overflow
   - Discord/Slack community

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### How to Contribute

1. **Fork the repository**
2. **Create feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open Pull Request**

### Coding Standards

- **JavaScript**: Follow ES6+ standards
- **React**: Use functional components with hooks
- **Naming**: camelCase for variables, PascalCase for components
- **Comments**: Add JSDoc for functions
- **Formatting**: Use Prettier (2 spaces)

### Testing

```bash
# Run tests
npm test

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

### Commit Messages

Follow conventional commits:

```
feat: Add new feature
fix: Bug fix
docs: Documentation update
style: Formatting changes
refactor: Code restructuring
test: Add tests
chore: Maintenance tasks
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 School Management System

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- **face-api.js** - AI face detection and recognition
- **TensorFlow.js** - Machine learning framework
- **MongoDB** - Database platform
- **React Team** - Frontend framework
- **Express.js** - Backend framework
- **Open Source Community** - For amazing tools and libraries

---

## 📞 Support

For questions, issues, or feature requests:

- **Email**: support@yourschool.com
- **GitHub Issues**: [Create an issue](https://github.com/yourusername/school-management-system/issues)
- **Documentation**: Check existing docs in `/Documentation` folder

---

## 🔄 Version History

### v1.0.0 (Current) - January 2026
- ✅ Initial release
- ✅ Complete MERN stack implementation
- ✅ AI-powered face verification
- ✅ GPS-based attendance
- ✅ Bulk upload features
- ✅ PDF report generation
- ✅ Multi-language support
- ✅ Role-based access control

### Upcoming Features (v1.1.0)
- 🔄 Mobile app (React Native)
- 🔄 Push notifications
- 🔄 Advanced analytics dashboard
- 🔄 SMS integration
- 🔄 Exam scheduling module
- 🔄 Fee management system
- 🔄 Library management
- 🔄 Online exam portal

---

## 🌟 Star History

If this project helped you, please ⭐ star the repository!

---

<div align="center">

**Built with ❤️ for Educational Institutions**

[Report Bug](https://github.com/yourusername/school-management-system/issues) · [Request Feature](https://github.com/yourusername/school-management-system/issues) · [View Demo](https://demo.yourschool.com)

</div>