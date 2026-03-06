/**
 * TypeScript Type Definitions
 * 
 * Contains all type definitions for the application
 */

// User Types
export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  name?: string;
  className?: string;
  section?: string;
  rollNumber?: string;
  phone?: string;
  parentPhone?: string;
  subject?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Auth Types
// Auth Types
export interface LoginCredentials {
  role: 'admin' | 'teacher' | 'student';
  username?: string; // used for email in backend for staff
  password?: string;
  email?: string; // Explicit email field
  grNumber?: string;
  dateOfBirth?: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

export interface RegisterStudentData {
  username: string;
  password: string;
  email: string;
  name: string;
  className: string;
  section: string;
  rollNumber: string;
  phone?: string;
  parentPhone?: string;
}

export interface RegisterTeacherData {
  username: string;
  password: string;
  email: string;
  name: string;
  subject: string;
  phone?: string;
}

// Student Types
export interface Student {
  _id: string;
  username: string;
  email: string;
  name: string;
  className: string;
  section: string;
  rollNumber: string;
  phone?: string;
  parentPhone?: string;
  faceDescriptor?: number[];
  createdAt: string;
  updatedAt: string;
}

// Teacher Types
export interface Teacher {
  _id: string;
  username: string;
  email: string;
  name: string;
  subject: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

// Result Types
export interface Result {
  _id: string;
  studentId: string | Student;
  className: string;
  section: string;
  rollNumber: string;
  examType: string;
  term: string;
  academicYear: string;
  subjects: SubjectResult[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  rank?: number;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectResult {
  subject: string;
  totalMarks: number;
  obtainedMarks: number;
  grade: string;
}

// Timetable Types
export interface Timetable {
  _id: string;
  className: string;
  section: string;
  day: string;
  periods: Period[];
  createdAt: string;
  updatedAt: string;
}

export interface Period {
  periodNumber: number;
  subject: string;
  teacher: string;
  startTime: string;
  endTime: string;
}

// Attendance Types
export interface Attendance {
  _id: string;
  teacherId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
  checkInTime?: string;
  checkOutTime?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  totalCount: number;
  page: number;
  totalPages: number;
}

// Navigation Types
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  StudentDashboard: undefined;
  TeacherDashboard: undefined;
  AdminDashboard: undefined;
  Profile: undefined;
  Results: undefined;
  Timetable: undefined;
  Attendance: undefined;
  Settings: undefined;
};
