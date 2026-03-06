/**
 * Result Service
 * 
 * Handles all result-related API calls
 */

import apiClient from '../config/axios.config';
import { API_ENDPOINTS } from '../config/api.config';
import { ApiResponse, Result } from '../types';

class ResultService {
  /**
   * Get all results for a student
   */
  async getStudentResults(studentId?: string): Promise<Result[]> {
    try {
      const endpoint = studentId
        ? API_ENDPOINTS.RESULTS.BY_STUDENT(studentId)
        : API_ENDPOINTS.STUDENT.RESULTS;
      
      const response = await apiClient.get<ApiResponse<Result[]>>(endpoint);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch results');
    }
  }

  /**
   * Get result by ID
   */
  async getResultById(id: string): Promise<Result> {
    try {
      const response = await apiClient.get<ApiResponse<Result>>(
        API_ENDPOINTS.RESULTS.BY_ID(id)
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Result not found');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch result');
    }
  }

  /**
   * Get results by filters
   */
  async getResults(filters?: {
    className?: string;
    section?: string;
    examType?: string;
    term?: string;
    academicYear?: string;
  }): Promise<Result[]> {
    try {
      const response = await apiClient.get<ApiResponse<Result[]>>(
        API_ENDPOINTS.RESULTS.BASE,
        { params: filters }
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch results');
    }
  }

  /**
   * Create new result
   */
  async createResult(data: Partial<Result>): Promise<Result> {
    try {
      const response = await apiClient.post<ApiResponse<Result>>(
        API_ENDPOINTS.RESULTS.BASE,
        data
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Failed to create result');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create result');
    }
  }

  /**
   * Update result
   */
  async updateResult(id: string, data: Partial<Result>): Promise<Result> {
    try {
      const response = await apiClient.put<ApiResponse<Result>>(
        API_ENDPOINTS.RESULTS.BY_ID(id),
        data
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Failed to update result');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update result');
    }
  }

  /**
   * Delete result
   */
  async deleteResult(id: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<ApiResponse>(
        API_ENDPOINTS.RESULTS.BY_ID(id)
      );
      
      return response.data.success;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete result');
    }
  }
}

export default new ResultService();
