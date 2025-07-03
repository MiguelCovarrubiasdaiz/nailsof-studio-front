import { apiClient, ApiResponse, PaginatedResponse } from '@/lib/api';

export interface Client {
  id: string;
  name: string;
  last_name: string;
  phone: string;
  email?: string;
}

export interface Employee {
  id: string;
  name: string;
  last_name: string;
  phone: string;
  email?: string;
}

export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  category: string;
}

export interface Appointment {
  id: string;
  client_id: string;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'programada' | 'confirmada' | 'en_proceso' | 'completada' | 'cancelada' | 'no_asistio';
  notes?: string | null;
  total_price: number;
  cancellation_reason?: string | null;
  client?: Client;
  employee?: Employee;
  services?: (Service & { AppointmentService: { price: number } })[];
  created_at: string;
  updated_at: string;
}

export interface AppointmentServiceData {
  service_id: string;
  price: number;
}

export interface AppointmentFormData {
  client_id: string;
  employee_id: string;
  date: Date;
  start_time: string;
  end_time: string;
  status?: 'programada' | 'confirmada' | 'en_proceso' | 'completada' | 'cancelada' | 'no_asistio';
  notes?: string | null;
  total_price: number;
  services: AppointmentServiceData[];
}

export interface GetAppointmentsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  client_id?: string;
  employee_id?: string;
  sort?: string;
}

export interface GetAppointmentsResponse {
  appointments: Appointment[];
  pagination: {
    current: number;
    total: number;
    pages: number;
    limit: number;
  };
}

class AppointmentService {
  async getAppointments(params: GetAppointmentsParams = {}): Promise<GetAppointmentsResponse> {
    const response = await apiClient.get<PaginatedResponse<Appointment>>('/appointments', params);
    return {
      appointments: response.data.appointments || [],
      pagination: response.data.pagination
    };
  }

  async getAppointment(id: string): Promise<Appointment> {
    const response = await apiClient.get<ApiResponse<Appointment>>(`/appointments/${id}`);
    return response;
  }

  async createAppointment(appointmentData: AppointmentFormData): Promise<Appointment> {
    const response = await apiClient.post<ApiResponse<Appointment>>('/appointments', appointmentData);
    return response;
  }

  async updateAppointment(id: string, appointmentData: Partial<AppointmentFormData>): Promise<Appointment> {
    const response = await apiClient.put<ApiResponse<Appointment>>(`/appointments/${id}`, appointmentData);
    return response;
  }

  async deleteAppointment(id: string): Promise<void> {
    await apiClient.delete(`/appointments/${id}`);
  }

  async updateAppointmentStatus(id: string, status: string): Promise<Appointment> {
    const response = await apiClient.patch<ApiResponse<Appointment>>(`/appointments/${id}/status`, { status });
    return response;
  }

  async getAppointmentsByDate(date: string, params: { status?: string; employee_id?: string } = {}): Promise<Appointment[]> {
    const response = await apiClient.get<ApiResponse<Appointment[]>>(`/appointments/date/${date}`, params);
    return response.data;
  }

  async cancelAppointment(id: string, cancellation_reason: string): Promise<Appointment> {
    const response = await apiClient.patch<ApiResponse<Appointment>>(`/appointments/${id}/cancel`, { cancellation_reason });
    return response;
  }

  getStatusOptions(): Array<{ value: string; label: string; color: string }> {
    return [
      { value: 'programada', label: 'Programada', color: 'blue' },
      { value: 'confirmada', label: 'Confirmada', color: 'green' },
      { value: 'en_proceso', label: 'En Proceso', color: 'yellow' },
      { value: 'completada', label: 'Completada', color: 'green' },
      { value: 'cancelada', label: 'Cancelada', color: 'red' },
      { value: 'no_asistio', label: 'No Asistió', color: 'gray' }
    ];
  }

  getStatusColor(status: string): string {
    const statusOption = this.getStatusOptions().find(s => s.value === status);
    return statusOption?.color || 'gray';
  }

  getStatusLabel(status: string): string {
    const statusOption = this.getStatusOptions().find(s => s.value === status);
    return statusOption?.label || status;
  }
}

export const appointmentService = new AppointmentService();