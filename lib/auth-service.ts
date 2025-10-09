import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from './api-config';

// Types for authentication
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string | null;
  userId: string | null;
  email: string | null;
  fullName: string | null;
  role: string | null;
  success: boolean;
  message: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// Token management
class TokenManager {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';

  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.TOKEN_KEY, token);
    // Also set as cookie for middleware access
    document.cookie = `${this.TOKEN_KEY}=${token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setRefreshToken(refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  static clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    // Clear cookies
    document.cookie = `${this.TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

// Create axios instance
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });

  // Request interceptor to add auth token
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = TokenManager.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle API errors
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Check if the response has a success field and it's false
      if (response.data && typeof response.data === 'object' && 'success' in response.data && !response.data.success) {
        // For login endpoint, let the login method handle this
        if (response.config.url?.includes('/auth/login')) {
          return response;
        }
        
        // For other endpoints, treat as error
        const apiError: ApiError = {
          message: response.data.message || 'Request failed',
          status: response.status,
          code: response.data.code || 'API_ERROR',
        };
        return Promise.reject(apiError);
      }
      
      return response;
    },
    async (error) => {
      // Handle 401 errors by redirecting to login
      if (error.response?.status === 401) {
        // Clear tokens and redirect to login
        TokenManager.clearTokens();
        if (typeof window !== 'undefined') {
          console.log('Authentication failed, redirecting to login...');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      // Transform error response
      const apiError: ApiError = {
        message: error.response?.data?.message || error.message || 'An error occurred',
        status: error.response?.status || 500,
        code: error.response?.data?.code,
      };

      return Promise.reject(apiError);
    }
  );

  return instance;
};

// Global API instance
export const api = createApiInstance();

// Authentication service
export class AuthService {
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      
      const responseData = response.data;
      
      // Check if login was successful
      if (!responseData.success || !responseData.token) {
        throw {
          message: responseData.message || 'Login failed',
          status: 401,
          code: 'LOGIN_FAILED'
        } as ApiError;
      }
      
      // Store tokens (assuming refreshToken might be separate or part of response)
      TokenManager.setToken(responseData.token);
      // For now, we'll use the token as refresh token until backend provides separate refresh token
      TokenManager.setRefreshToken(responseData.token);
      
      return responseData;
    } catch (error) {
      // If it's already an ApiError we threw, pass it through
      if (error && typeof error === 'object' && 'message' in error && 'status' in error) {
        throw error as ApiError;
      }
      // Otherwise, handle axios errors
      throw error as ApiError;
    }
  }

  static async logout(): Promise<void> {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Even if logout fails on server, clear local tokens
      console.error('Logout error:', error);
    } finally {
      TokenManager.clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  static async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        { email }
      );
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  }

  static isAuthenticated(): boolean {
    return TokenManager.isAuthenticated();
  }

  static getToken(): string | null {
    return TokenManager.getToken();
  }

  static clearAuth(): void {
    TokenManager.clearTokens();
  }
}

// Export token manager for use in other parts of the app
export { TokenManager };
