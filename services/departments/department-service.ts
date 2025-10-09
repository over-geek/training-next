import { api } from '@/lib/auth-service';
import type { Department } from './types';

export class DepartmentService {
  static async getDepartments(): Promise<Department[]> {
    try {
      const response = await api.get<Department[]>('/departments');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      throw error;
    }
  }
}
