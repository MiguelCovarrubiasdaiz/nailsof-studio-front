import { apiClient, ApiResponse, PaginatedResponse } from '@/lib/api';

export interface Client {
  id: string;
  name: string;
  last_name: string;
  phone: string;
  email?: string;
  birth_date?: string;
  notes?: string;
  registered_at: string;
  last_visit?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientFormData {
  name: string;
  last_name: string;
  phone: string;
  email?: string;
  birth_date?: string;
  notes?: string;
}

export interface ClientFilters {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
}

class ClientService {
  async getClients(filters?: ClientFilters): Promise<{ clients: Client[]; pagination: any }> {
    const response = await apiClient.get<PaginatedResponse<Client>>('/clients', filters);
    return response.data;
  }

  async getClientById(id: string): Promise<Client> {
    const response = await apiClient.get<ApiResponse<Client>>(`/clients/${id}`);
    return response.data;
  }

  async createClient(data: ClientFormData): Promise<Client> {
    const response = await apiClient.post<ApiResponse<Client>>('/clients', data);
    return response.data;
  }

  async updateClient(id: string, data: Partial<ClientFormData>): Promise<Client> {
    const response = await apiClient.put<ApiResponse<Client>>(`/clients/${id}`, data);
    return response.data;
  }

  async deleteClient(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/clients/${id}`);
    return response.data;
  }

  async getClientAppointments(id: string): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<any[]>>(`/clients/${id}/appointments`);
    return response.data;
  }
}

export const clientService = new ClientService();