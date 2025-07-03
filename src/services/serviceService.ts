import { apiClient, ApiResponse, PaginatedResponse } from '@/lib/api';

export interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  category_id: string;
  category?: {
    id: string;
    name: string;
    description?: string;
  };
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceFormData {
  name: string;
  description?: string | null;
  duration: number;
  price: number;
  category_id: string;
  active?: boolean;
}

export interface GetServicesParams {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: string;
  active?: boolean;
  sort?: string;
}

export interface GetServicesResponse {
  services: Service[];
  pagination: {
    current: number;
    total: number;
    pages: number;
    limit: number;
  };
}

class ServiceService {
  async getServices(params: GetServicesParams = {}): Promise<GetServicesResponse> {
    const response = await apiClient.get<PaginatedResponse<Service>>('/services', params);
    return {
      services: response.data.services || [],
      pagination: response.data.pagination
    };
  }

  async getService(id: string): Promise<Service> {
    const response = await apiClient.get<ApiResponse<Service>>(`/services/${id}`);
    return response.data;
  }

  async createService(serviceData: ServiceFormData): Promise<Service> {
    const response = await apiClient.post<ApiResponse<Service>>('/services', serviceData);
    return response.data;
  }

  async updateService(id: string, serviceData: Partial<ServiceFormData>): Promise<Service> {
    const response = await apiClient.put<ApiResponse<Service>>(`/services/${id}`, serviceData);
    return response.data;
  }

  async deleteService(id: string): Promise<void> {
    await apiClient.delete(`/services/${id}`);
  }

  // This method is deprecated - use categoryService.getActiveCategories() instead
  getCategories(): string[] {
    console.warn('serviceService.getCategories() is deprecated. Use categoryService.getActiveCategories() instead.');
    return [
      'Cabello',
      'Uñas',
      'Facial',
      'Masajes',
      'Cejas y Pestañas',
      'Depilación',
      'Tratamientos Corporales',
      'Maquillaje'
    ];
  }
}

export const serviceService = new ServiceService();