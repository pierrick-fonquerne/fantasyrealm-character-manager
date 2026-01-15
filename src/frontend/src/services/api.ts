const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiError {
  message: string;
  status: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async post<TRequest, TResponse>(
    endpoint: string,
    data: TRequest
  ): Promise<TResponse> {
    let response: Response;

    try {
      response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
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

    return response.json();
  }

  async postAuthenticated<TRequest, TResponse>(
    endpoint: string,
    data: TRequest,
    token: string
  ): Promise<TResponse> {
    let response: Response;

    try {
      response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
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

    return response.json();
  }

  async get<TResponse>(endpoint: string): Promise<TResponse> {
    let response: Response;

    try {
      response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
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

    return response.json();
  }
}

export const apiClient = new ApiClient(API_URL);
export type { ApiError };
