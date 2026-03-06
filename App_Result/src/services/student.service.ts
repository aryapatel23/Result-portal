/**
 * Student Service
 * 
 * Handles all student-related API calls
 */

import apiClient from '../config/axios.config';
import { API_ENDPOINTS } from '../config/api.config';
import { ApiResponse, Student } from '../types';

class StudentService {
  /**
   * Get student profile
   */
  async getProfile(): Promise<Student> {
    try {
      const response = await apiClient.get<ApiResponse<Student>>(
        API_ENDPOINTS.STUDENT.PROFILE
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Failed to fetch profile');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  }

  /**
   * Update student profile
   */
  async updateProfile(data: Partial<Student>): Promise<Student> {
    try {
      const response = await apiClient.put<ApiResponse<Student>>(
        API_ENDPOINTS.STUDENT.UPDATE,
        data
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Failed to update profile');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }

  /**
   * Get student by ID
   */
  async getStudentById(id: string): Promise<Student> {
    try {
      const response = await apiClient.get<ApiResponse<Student>>(
        `/student/${id}`
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Student not found');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch student');
    }
  }

  /**
   * Get all students (for teachers/admin)
   */
  async getAllStudents(filters?: {
    className?: string;
    section?: string;
  }): Promise<Student[]> {
    try {
      const response = await apiClient.get<ApiResponse<Student[]>>(
        '/student/all',
        { params: filters }
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch students');
    }
  }
}

export default new StudentService();
