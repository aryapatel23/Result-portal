// Type definitions for the Result Portal App

export interface User {
  _id: string;
  name: string;
  email?: string;
  role: 'student' | 'teacher' | 'admin';
  grNumber?: string;
  dateOfBirth?: string;
  standard?: string;
  penNo?: string;
  mobile?: string;
  parentContact?: string;
  employeeId?: string;
  subjects?: string[];
  classTeacher?: string;
  assignedClasses?: string[];
  phone?: string;
  isActive?: boolean;
}

export interface LoginCredentials {
  role: 'student' | 'teacher' | 'admin';
  // Student login fields
  grNumber?: string;
  dateOfBirth?: string;
  // Staff login fields
  email?: string;
  password?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface Result {
  _id: string;
  studentId: string;
  studentName: string;
  grNumber: string;
  standard: string;
  examType: string;
  term: string;
  academicYear: string;
  subjects: Subject[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  rank?: number;
  attendance?: number;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  name: string;
  totalMarks: number;
  obtainedMarks: number;
  grade: string;
}

export interface Student {
  _id: string;
  name: string;
  grNumber: string;
  standard: string;
  dateOfBirth: string;
  mobile?: string;
  parentContact?: string;
  penNo?: string;
  email?: string;
  isActive: boolean;
}

export interface Teacher {
  _id: string;
  name: string;
  email: string;
  employeeId: string;
  phone?: string;
  subjects?: string[];
  classTeacher?: string;
  assignedClasses?: string[];
  isActive: boolean;
}

export interface Attendance {
  _id: string;
  userId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
  markedBy?: string;
  remarks?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
