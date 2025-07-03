import { apiClient, ApiResponse, PaginatedResponse } from '@/lib/api';

export interface Employee {
  id: string;
  name: string;
  last_name: string;
  phone: string;
  email?: string;
  active: boolean;
  schedules?: EmployeeSchedule[];
  created_at: string;
  updated_at: string;
}

export interface EmployeeSchedule {
  id?: string;
  day: string; // 0 = Sunday, 1 = Monday, etc.
  start_time: string;
  end_time: string;
  employee_id?: string;
}

export interface EmployeeFormData {
  name: string;
  last_name: string;
  phone: string;
  email?: string;
  active?: boolean;
  schedules?: EmployeeSchedule[];
}

export interface EmployeeFilters {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
  sort?: string;
}

class EmployeeService {
  async getEmployees(filters?: EmployeeFilters): Promise<{ employees: Employee[]; pagination: any }> {
    const response = await apiClient.get<PaginatedResponse<Employee>>('/employees', filters);
    return response.data;
  }

  async getEmployeeById(id: string): Promise<Employee> {
    const response = await apiClient.get<ApiResponse<Employee>>(`/employees/${id}`);
    return response.data;
  }

  async createEmployee(data: EmployeeFormData): Promise<Employee> {
    const response = await apiClient.post<ApiResponse<Employee>>('/employees', data);
    return response.data;
  }

  async updateEmployee(id: string, data: Partial<EmployeeFormData>): Promise<Employee> {
    const response = await apiClient.put<ApiResponse<Employee>>(`/employees/${id}`, data);
    return response.data;
  }

  async deleteEmployee(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/employees/${id}`);
    return response.data;
  }

  async getEmployeeAppointments(id: string, filters?: { startDate?: string; endDate?: string; status?: string }): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<any[]>>(`/employees/${id}/appointments`, filters);
    return response.data;
  }

  async getEmployeeSchedule(id: string): Promise<EmployeeSchedule[]> {
    const response = await apiClient.get<ApiResponse<EmployeeSchedule[]>>(`/employees/${id}/schedule`);
    return response.data;
  }

  async updateEmployeeSchedule(id: string, schedules: EmployeeSchedule[]): Promise<EmployeeSchedule[]> {
    const response = await apiClient.post<ApiResponse<EmployeeSchedule[]>>(`/employees/${id}/schedule`, { schedules });
    return response.data;
  }
}

export const employeeService = new EmployeeService();