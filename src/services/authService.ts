import { apiClient, ApiResponse } from '@/lib/api';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'employee' | 'client';
  active: boolean;
  last_login?: string;
  client?: any;
  employee?: any;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'employee' | 'client';
  name: string;
  last_name: string;
  phone: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

class AuthService {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response;
  }


  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }
}

export const authService = new AuthService();