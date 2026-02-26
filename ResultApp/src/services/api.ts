import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API Base URL - Configure for real device access
const API_BASE_URL = 'https://result-portal-tkom.onrender.com/api';

// For local development on real device:
// Replace 'localhost' with your computer's local IP address
// Example: 'http://192.168.1.100:5000/api'

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('API initialized with base URL:', API_BASE_URL);

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('API Request:', config.method?.toUpperCase(), config.url);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => {
        console.log('API Response:', response.config.url, response.status);
        return response;
      },
      async (error: AxiosError) => {
        console.log('API Error:', error.message, error.response?.status);
        if (error.response?.status === 401) {
          // Token expired or invalid
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('user');
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints - Updated to match backend exactly
  async login(credentials: { role: string; email?: string; password?: string; grNumber?: string; dateOfBirth?: string }) {
    console.log('Login request:', { ...credentials, password: '***' });
    const response = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async registerStudent(data: any) {
    const response = await this.api.post('/auth/register/student', data);
    return response.data;
  }

  // Student endpoints
  async getStudentProfile() {
    const response = await this.api.get('/student/profile');
    return response.data;
  }

  async getStudentResults() {
    const response = await this.api.get('/student/results');
    return response.data;
  }

  async getStudentResultById(resultId: string) {
    const response = await this.api.get(`/student/results/${resultId}`);
    return response.data;
  }

  async getMyProfile() {
    const response = await this.api.get('/profile/me');
    return response.data;
  }

  async updateProfile(data: { name?: string; email?: string; phone?: string; parentPhone?: string }) {
    const response = await this.api.put('/profile/update', data);
    return response.data;
  }

  async changePassword(data: { oldPassword: string; newPassword: string }) {
    const response = await this.api.put('/profile/change-password', data);
    return response.data;
  }

  // Timetable endpoints
  async getStudentTimetable() {
    const response = await this.api.get('/timetable/student/timetable');
    return response.data;
  }

  // Teacher endpoints
  async getTeacherDashboard() {
    const response = await this.api.get('/teacher/dashboard');
    return response.data;
  }

  async getTeacherStudents() {
    const response = await this.api.get('/student-management');
    return response.data;
  }

  // Teacher Result endpoints (teacher-specific routes)
  async uploadTeacherResult(resultData: any) {
    const response = await this.api.post('/teacher/results', resultData);
    return response.data;
  }

  async getTeacherResults(params?: { standard?: string; term?: string }) {
    const response = await this.api.get('/teacher/results', { params });
    return response.data;
  }

  async getTeacherResultById(resultId: string) {
    const response = await this.api.get(`/teacher/results/${resultId}`);
    return response.data;
  }

  async editTeacherResult(resultId: string, resultData: any) {
    const response = await this.api.put(`/teacher/results/${resultId}`, resultData);
    return response.data;
  }

  async deleteTeacherResult(resultId: string) {
    const response = await this.api.delete(`/teacher/results/${resultId}`);
    return response.data;
  }

  // Legacy result endpoints (admin / generic)
  async uploadResult(resultData: any) {
    const response = await this.api.post('/results', resultData);
    return response.data;
  }

  async updateResult(resultId: string, resultData: any) {
    const response = await this.api.put(`/results/${resultId}`, resultData);
    return response.data;
  }

  async deleteResult(resultId: string) {
    const response = await this.api.delete(`/results/${resultId}`);
    return response.data;
  }

  // Teacher Attendance endpoints
  async markAttendance(attendanceData: any) {
    const response = await this.api.post('/teacher-attendance/mark', attendanceData);
    return response.data;
  }

  async getTodayAttendance() {
    const response = await this.api.get('/teacher-attendance/today');
    return response.data;
  }

  async getAttendanceHistory() {
    const response = await this.api.get('/teacher-attendance/my-history');
    return response.data;
  }

  async getTeacherTimetable(teacherId: string) {
    const response = await this.api.get(`/timetable/${teacherId}`);
    return response.data;
  }

  // Admin endpoints
  async getAdminDashboard() {
    const response = await this.api.get('/admin/dashboard');
    return response.data;
  }

  async getAllStudents() {
    const response = await this.api.get('/student-management');
    return response.data;
  }

  async getAllTeachers() {
    const response = await this.api.get('/admin/teachers');
    return response.data;
  }

  async createTeacher(teacherData: any) {
    const response = await this.api.post('/admin/create-teacher', teacherData);
    return response.data;
  }

  async createStudent(studentData: any) {
    const response = await this.api.post('/admin/create-student', studentData);
    return response.data;
  }

  async updateTeacher(teacherId: string, teacherData: any) {
    const response = await this.api.put(`/admin/teachers/${teacherId}`, teacherData);
    return response.data;
  }

  async updateStudent(studentId: string, studentData: any) {
    const response = await this.api.put(`/student-management/${studentId}`, studentData);
    return response.data;
  }

  async deleteTeacher(teacherId: string) {
    const response = await this.api.delete(`/admin/teachers/${teacherId}`);
    return response.data;
  }

  async deleteStudent(studentId: string) {
    const response = await this.api.delete(`/student-management/${studentId}`);
    return response.data;
  }

  async getAllResults() {
    const response = await this.api.get('/results');
    return response.data;
  }

  async getAttendanceRecords(params?: any) {
    const response = await this.api.get('/admin/attendance', { params });
    return response.data;
  }
}

export default new ApiService();
