import { api } from '@/lib/auth-service';
import { API_ENDPOINTS } from '@/lib/api-config';
import type { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from './types';

export class EmployeeService {
  /**
   * Fetch all employees/attendees
   */
  static async getEmployees(): Promise<Employee[]> {
    try {
      const response = await api.get<Employee[]>('/employees');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      throw error;
    }
  }

  /**
   * Get a specific employee by ID
   */
  static async getEmployeeById(id: number): Promise<Employee> {
    try {
      const response = await api.get<Employee>(`/employees/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch employee ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new employee
   */
  static async createEmployee(employeeData: CreateEmployeeRequest): Promise<Employee> {
    try {
      const response = await api.post<Employee>('/employees', employeeData);
      return response.data;
    } catch (error) {
      console.error('Failed to create employee:', error);
      throw error;
    }
  }

  /**
   * Update an existing employee
   */
  static async updateEmployee(employeeData: UpdateEmployeeRequest): Promise<Employee> {
    try {
      const response = await api.put<Employee>(`/employees/${employeeData.id}`, employeeData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update employee ${employeeData.id}:`, error);
      throw error;
    }
  }

  /**
   * Delete/deactivate an employee
   */
  static async deleteEmployee(id: number): Promise<void> {
    try {
      await api.delete(`/employees/${id}`);
    } catch (error) {
      console.error(`Failed to delete employee ${id}:`, error);
      throw error;
    }
  }

  /**
   * Revoke access for an employee (set status to inactive)
   */
  static async revokeEmployeeAccess(id: number): Promise<Employee> {
    try {
      const response = await api.patch<Employee>(`/employees/${id}/revoke-access`);
      return response.data;
    } catch (error) {
      console.error(`Failed to revoke access for employee ${id}:`, error);
      throw error;
    }
  }

  /**
   * Toggle employee status (active <-> inactive)
   */
  static async toggleEmployeeStatus(id: number): Promise<Employee> {
    try {
      const response = await api.patch<Employee>(`/employees/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error(`Failed to toggle status for employee ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update employee card information
   */
  static async updateEmployeeCard(id: number, cardData?: any): Promise<Employee> {
    try {
      const response = await api.post<Employee>(`/employees/${id}/update-card`, cardData || {});
      return response.data;
    } catch (error) {
      console.error(`Failed to update card for employee ${id}:`, error);
      throw error;
    }
  }
}
