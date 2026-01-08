import { apiClient, type ApiError } from './api';

interface RegisterRequest {
  email: string;
  pseudo: string;
  password: string;
  confirmPassword: string;
}

interface RegisterResponse {
  id: number;
  email: string;
  pseudo: string;
  role: string;
  createdAt: string;
}

const authService = {
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    return apiClient.post<RegisterRequest, RegisterResponse>('/auth/register', data);
  },
};

export { authService };
export type { RegisterRequest, RegisterResponse, ApiError };
