import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL - Update this based on your backend
const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:5000/api' // Android emulator
  : 'https://result-portal-tkom.onrender.com/api'; // Production

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

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('user');
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(identifier: string, password: string, role: string) {
    const response = await this.api.post('/auth/login', {
      identifier,
      password,
      role,
    });
    return response.data;
  }

  async registerStudent(data: any) {
    const response = await this.api.post('/auth/register/student', data);
    return response.data;
  }

  // Student endpoints
  async getStudentDashboard() {
    const response = await this.api.get('/student/dashboard');
    return response.data;
  }

  async getStudentResults(grNumber: string) {
    const response = await this.api.get(`/results/student/${grNumber}`);
    return response.data;
  }

  async getResultById(resultId: string) {
    const response = await this.api.get(`/results/${resultId}`);
    return response.data;
  }

  // Teacher endpoints
  async getTeacherDashboard() {
    const response = await this.api.get('/teacher/dashboard');
    return response.data;
  }

  async getTeacherStudents() {
    const response = await this.api.get('/teacher/students');
    return response.data;
  }

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

  async markAttendance(attendanceData: any) {
    const response = await this.api.post('/teacher-attendance/mark', attendanceData);
    return response.data;
  }

  // Admin endpoints
  async getAdminDashboard() {
    const response = await this.api.get('/admin/dashboard');
    return response.data;
  }

  async getAllStudents() {
    const response = await this.api.get('/admin/students');
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
    const response = await this.api.put(`/admin/students/${studentId}`, studentData);
    return response.data;
  }

  async deleteTeacher(teacherId: string) {
    const response = await this.api.delete(`/admin/teachers/${teacherId}`);
    return response.data;
  }

  async deleteStudent(studentId: string) {
    const response = await this.api.delete(`/admin/students/${studentId}`);
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
