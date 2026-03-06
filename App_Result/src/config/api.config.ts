/**
 * API Configuration
 * 
 * This file contains all API endpoint configurations
 * Update BASE_URL with your actual backend server address
 */

// 🔧 IMPORTANT: Change this to your actual backend URL
// For local development:
// - Android Emulator: use 10.0.2.2
// - iOS Simulator: use localhost
// - Real device on same network: use your computer's IP address (e.g., 192.168.1.100)
// --- CONFIGURATION MODES ---
const ENV_MODES = {
  DEV_USB: 'http://localhost:5000/api', // Use with 'adb reverse tcp:5000 tcp:5000'
  DEV_WIFI: 'http://10.47.176.30:5000/api', // For real device on same Wi-Fi
  EMULATOR: 'http://10.0.2.2:5000/api',
  PRODUCTION: 'https://result-portal-tkom.onrender.com/api' // Deployed backend
};

// 🔧 SET THIS TO CHANGE ENVIRONMENT
const CURRENT_MODE: keyof typeof ENV_MODES = 'PRODUCTION';

export const BASE_URL = ENV_MODES[CURRENT_MODE];
// export const BASE_URL = 'http://192.168.1.100:5000/api'; // For real device
// export const BASE_URL = 'http://localhost:5000/api'; // For iOS simulator

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER_STUDENT: '/auth/register/student',
    REGISTER_TEACHER: '/auth/register/teacher',
  },

  // Student
  STUDENT: {
    PROFILE: '/student/profile',
    UPDATE: '/student/update',
    RESULTS: '/student/results',
    TIMETABLE: '/student/timetable',
    BY_GR: (gr: string) => `/student/gr/${gr}`,
  },

  // Teacher
  TEACHER: {
    PROFILE: '/teacher/profile',
    UPDATE: '/teacher/update',
    STUDENTS: '/teacher/students',
    ATTENDANCE: '/teacher-attendance',
    DASHBOARD: '/teacher/dashboard',
  },

  // Results
  RESULTS: {
    BASE: '/results',
    BY_ID: (id: string) => `/results/${id}`,
    BY_STUDENT: (studentId: string) => `/results/student/${studentId}`,
    BULK: '/bulk-results',
    ADMIN: '/results/admin',
  },

  // Timetable
  TIMETABLE: {
    BASE: '/timetable',
    TEACHER: '/timetable/teacher/timetable',
    STUDENT: '/timetable/student/timetable',
    BY_CLASS: (className: string, section: string) =>
      `/timetable/class/${className}/section/${section}`,
    ADMIN: (teacherId: string) => `/timetable/admin/timetable/${teacherId}`,
  },

  // PDF
  PDF: {
    GENERATE: '/pdf/generate',
    DOWNLOAD: '/pdf/download',
  },

  // Face Recognition
  FACE: {
    REGISTER: '/face/register',
    VERIFY: '/face/verify',
  },

  // Admin
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    TEACHERS: '/admin/teachers',
    RESULTS_ACTIVITY: '/admin/results-activity',
    CREATE_STUDENT: '/admin/students',
    ATTENDANCE_SUMMARY: '/admin/attendance/today-summary',
    ATTENDANCE_ALL: '/admin/attendance/all',
    ATTENDANCE_AUTO_MARK: '/admin/attendance/auto-mark-leaves',
    TEACHERS_LIST: '/admin/teachers-list',
    UPDATE_TEACHER: (id: string) => `/admin/teachers/${id}`,
    HOLIDAYS: '/admin/holidays',
    HOLIDAY_BY_ID: (id: string) => `/admin/holidays/${id}`,
    HOLIDAYS_UPCOMING: '/admin/holidays/upcoming',
    HOLIDAYS_CHECK: '/admin/holidays/check',
  },

  // Profile (Common)
  PROFILE: {
    ME: '/profile/me',
    UPDATE: '/profile/update',
    CHANGE_PASSWORD: '/profile/change-password',
  },
};

export const API_TIMEOUT = 60000; // 60 seconds (increased for Render cold starts)
