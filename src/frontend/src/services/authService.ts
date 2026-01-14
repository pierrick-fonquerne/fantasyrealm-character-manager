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

interface LoginRequest {
  email: string;
  password: string;
}

interface UserInfo {
  id: number;
  email: string;
  pseudo: string;
  role: string;
}

interface LoginResponse {
  token: string;
  expiresAt: string;
  user: UserInfo;
  mustChangePassword: boolean;
}

interface ForgotPasswordRequest {
  email: string;
  pseudo: string;
}

interface ForgotPasswordResponse {
  message: string;
}

const authService = {
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    return apiClient.post<RegisterRequest, RegisterResponse>('/auth/register', data);
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    return apiClient.post<LoginRequest, LoginResponse>('/auth/login', data);
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    return apiClient.post<ForgotPasswordRequest, ForgotPasswordResponse>('/auth/forgot-password', data);
  },
};

export { authService };
export type { RegisterRequest, RegisterResponse, LoginRequest, LoginResponse, ForgotPasswordRequest, ForgotPasswordResponse, UserInfo, ApiError };
