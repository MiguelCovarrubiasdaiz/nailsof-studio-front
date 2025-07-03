import { apiClient, ApiResponse, PaginatedResponse } from '@/lib/api';

export interface Category {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  serviceCount?: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  active?: boolean;
}

export interface CategoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

class CategoryService {
  async getCategories(filters?: CategoryFilters): Promise<{ categories: Category[]; pagination: any }> {
    const response = await apiClient.get<PaginatedResponse<Category>>('/categories', filters);
    return response.data;
  }

  async getCategoryById(id: string): Promise<Category> {
    const response = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data;
  }

  async createCategory(data: CategoryFormData): Promise<Category> {
    const response = await apiClient.post<ApiResponse<Category>>('/categories', data);
    return response.data;
  }

  async updateCategory(id: string, data: Partial<CategoryFormData>): Promise<Category> {
    const response = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, data);
    return response.data;
  }

  async deleteCategory(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/categories/${id}`);
    return response.data;
  }

  async getActiveCategories(): Promise<Category[]> {
    const response = await apiClient.get<PaginatedResponse<Category>>('/categories', { 
      active: true,
      limit: 100 // Get all active categories
    });
    return response.data.categories;
  }
}

export const categoryService = new CategoryService();