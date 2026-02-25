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
  studentName: string;
  grNumber: string;
  dateOfBirth: string;
  standard: string;
  examType: string;
  term: string;
  academicYear: string;
  subjects: Subject[];
  remarks?: string;
  status: 'draft' | 'published' | 'archived';
  uploadedBy?: { name: string; employeeId?: string } | string;
  uploadedByRole?: 'admin' | 'teacher';
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  name: string;
  marks: number;
  maxMarks: number;
}

// Computed helpers for Result
export function getResultTotals(result: Result) {
  const totalMarks = result.subjects.reduce((sum, s) => sum + s.maxMarks, 0);
  const obtainedMarks = result.subjects.reduce((sum, s) => sum + s.marks, 0);
  const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
  const grade =
    percentage >= 90 ? 'A+' :
    percentage >= 80 ? 'A' :
    percentage >= 70 ? 'B+' :
    percentage >= 60 ? 'B' :
    percentage >= 50 ? 'C' :
    percentage >= 40 ? 'D' : 'F';
  return { totalMarks, obtainedMarks, percentage, grade };
}

export interface StudentProfile {
  student: {
    name: string;
    grNumber: string;
    standard: string;
    dateOfBirth: string;
    email?: string;
  };
  statistics: {
    totalExamsTaken: number;
    averagePercentage: number | string;
  };
}

export interface TimetablePeriod {
  _id?: string;
  timeSlot: string;
  startTime?: string;
  endTime?: string;
  subject: string;
  class: string;
  room?: string;
  teacher?: string;
}

export interface TimetableSchedule {
  Monday: TimetablePeriod[];
  Tuesday: TimetablePeriod[];
  Wednesday: TimetablePeriod[];
  Thursday: TimetablePeriod[];
  Friday: TimetablePeriod[];
  Saturday: TimetablePeriod[];
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
