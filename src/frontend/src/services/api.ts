const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiError {
  message: string;
  status: number;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request(
    endpoint: string,
    method: HttpMethod,
    token?: string,
    body?: unknown
  ): Promise<Response> {
    const headers: Record<string, string> = {};

    if (method !== 'DELETE') {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response: Response;

    try {
      response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch {
      throw {
        message: 'Impossible de contacter le serveur. Vérifiez votre connexion internet.',
        status: 0,
      } as ApiError;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: ApiError = {
        message: errorData.message || 'Une erreur est survenue',
        status: response.status,
      };
      throw error;
    }

    return response;
  }

  async get<TResponse>(endpoint: string): Promise<TResponse> {
    const response = await this.request(endpoint, 'GET');
    return response.json();
  }

  async getAuthenticated<TResponse>(
    endpoint: string,
    token: string
  ): Promise<TResponse> {
    const response = await this.request(endpoint, 'GET', token);
    return response.json();
  }

  async post<TRequest, TResponse>(
    endpoint: string,
    data: TRequest
  ): Promise<TResponse> {
    const response = await this.request(endpoint, 'POST', undefined, data);
    return response.json();
  }

  async postAuthenticated<TRequest, TResponse>(
    endpoint: string,
    data: TRequest,
    token: string
  ): Promise<TResponse> {
    const response = await this.request(endpoint, 'POST', token, data);
    return response.json();
  }

  async putAuthenticated<TRequest, TResponse>(
    endpoint: string,
    data: TRequest,
    token: string
  ): Promise<TResponse> {
    const response = await this.request(endpoint, 'PUT', token, data);
    return response.json();
  }

  async postAuthenticatedNoContent<TRequest>(
    endpoint: string,
    data: TRequest,
    token: string
  ): Promise<void> {
    await this.request(endpoint, 'POST', token, data);
  }

  async deleteAuthenticated(
    endpoint: string,
    token: string
  ): Promise<void> {
    await this.request(endpoint, 'DELETE', token);
  }

  async patchAuthenticated<TResponse>(
    endpoint: string,
    token: string
  ): Promise<TResponse> {
    const response = await this.request(endpoint, 'PATCH', token);
    return response.json();
  }

  async patchAuthenticatedWithBody<TRequest, TResponse>(
    endpoint: string,
    data: TRequest,
    token: string
  ): Promise<TResponse> {
    const response = await this.request(endpoint, 'PATCH', token, data);
    return response.json();
  }
}

export const apiClient = new ApiClient(API_URL);
export type { ApiError };
