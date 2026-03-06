/**
 * Teacher Service
 * 
 * Handles all teacher-related API calls
 */

import apiClient from '../config/axios.config';
import { API_ENDPOINTS } from '../config/api.config';
import { ApiResponse, Teacher, Attendance } from '../types';

class TeacherService {
  /**
   * Get teacher profile
   */
  async getProfile(): Promise<Teacher> {
    try {
      const response = await apiClient.get<ApiResponse<Teacher>>(
        API_ENDPOINTS.TEACHER.PROFILE
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
   * Update teacher profile
   */
  async updateProfile(data: Partial<Teacher>): Promise<Teacher> {
    try {
      const response = await apiClient.put<ApiResponse<Teacher>>(
        API_ENDPOINTS.TEACHER.UPDATE,
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
   * Mark attendance
   */
  async markAttendance(data: {
    date: string;
    status: 'present' | 'absent' | 'late' | 'half-day';
    checkInTime?: string;
    checkOutTime?: string;
    remarks?: string;
  }): Promise<Attendance> {
    try {
      const response = await apiClient.post<ApiResponse<Attendance>>(
        API_ENDPOINTS.TEACHER.ATTENDANCE,
        data
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Failed to mark attendance');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to mark attendance');
    }
  }

  /**
   * Get attendance history
   */
  async getAttendanceHistory(filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<Attendance[]> {
    try {
      const response = await apiClient.get<ApiResponse<Attendance[]>>(
        API_ENDPOINTS.TEACHER.ATTENDANCE,
        { params: filters }
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch attendance');
    }
  }
}

export default new TeacherService();
