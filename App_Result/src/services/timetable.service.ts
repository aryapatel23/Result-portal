/**
 * Timetable Service
 * 
 * Handles all timetable-related API calls
 */

import apiClient from '../config/axios.config';
import { API_ENDPOINTS } from '../config/api.config';
import { ApiResponse, Timetable } from '../types';

class TimetableService {
  /**
   * Get timetable for student's class
   */
  async getStudentTimetable(): Promise<Timetable[]> {
    try {
      const response = await apiClient.get<ApiResponse<Timetable[]>>(
        API_ENDPOINTS.STUDENT.TIMETABLE
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch timetable');
    }
  }

  /**
   * Get timetable by class and section
   */
  async getTimetableByClass(
    className: string,
    section: string
  ): Promise<Timetable[]> {
    try {
      const response = await apiClient.get<ApiResponse<Timetable[]>>(
        API_ENDPOINTS.TIMETABLE.BY_CLASS(className, section)
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch timetable');
    }
  }

  /**
   * Get all timetables
   */
  async getAllTimetables(): Promise<Timetable[]> {
    try {
      const response = await apiClient.get<ApiResponse<Timetable[]>>(
        API_ENDPOINTS.TIMETABLE.BASE
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch timetables');
    }
  }

  /**
   * Create timetable
   */
  async createTimetable(data: Partial<Timetable>): Promise<Timetable> {
    try {
      const response = await apiClient.post<ApiResponse<Timetable>>(
        API_ENDPOINTS.TIMETABLE.BASE,
        data
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Failed to create timetable');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create timetable');
    }
  }

  /**
   * Update timetable
   */
  async updateTimetable(id: string, data: Partial<Timetable>): Promise<Timetable> {
    try {
      const response = await apiClient.put<ApiResponse<Timetable>>(
        `${API_ENDPOINTS.TIMETABLE.BASE}/${id}`,
        data
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Failed to update timetable');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update timetable');
    }
  }
}

export default new TimetableService();
