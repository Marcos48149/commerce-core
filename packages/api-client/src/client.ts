import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { PaginatedResult } from '@commerce/shared';

interface ApiWrapper<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export class ApiClient {
  private readonly http: AxiosInstance;
  private _refreshToken?: string;

  constructor(baseURL: string, private token?: string) {
    this.http = axios.create({
      baseURL,
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    this.http.interceptors.response.use(
      (response: AxiosResponse) => {
        const body = response.data;
        if (body && typeof body === 'object' && 'success' in body && 'data' in body && 'timestamp' in body) {
          response.data = (body as ApiWrapper<unknown>).data;
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && this._refreshToken && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const baseUrl = this.http.defaults.baseURL || '';
            const res = await axios.post(`${baseUrl}/auth/refresh`, {
              refreshToken: this._refreshToken,
            });
            const raw = res.data;
            const body = (raw?.data ? raw.data : raw) as { accessToken: string; refreshToken: string };
            this.token = body.accessToken;
            this._refreshToken = body.refreshToken;
            originalRequest.headers.Authorization = `Bearer ${this.token}`;
            return this.http(originalRequest);
          } catch {
            this.token = undefined;
            this._refreshToken = undefined;
          }
        }
        return Promise.reject(error);
      },
    );
  }

  setToken(token: string | undefined): void {
    this.token = token;
  }

  setRefreshToken(token: string | undefined): void {
    this._refreshToken = token;
  }

  setTokens(token: string | undefined, refreshToken?: string): void {
    this.token = token;
    if (refreshToken !== undefined) {
      this._refreshToken = refreshToken;
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.http.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.http.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.http.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.http.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.http.delete<T>(url, config);
    return response.data;
  }

  async paginated<T>(url: string, page = 1, limit = 20): Promise<PaginatedResult<T>> {
    return this.get<PaginatedResult<T>>(url, { params: { page, limit } });
  }
}

export function createApiClient(baseURL: string, token?: string): ApiClient {
  return new ApiClient(baseURL, token);
}
