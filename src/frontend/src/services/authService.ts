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

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface ChangePasswordResponse {
  token: string;
  expiresAt: string;
  user: UserInfo;
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

  changePassword: async (data: ChangePasswordRequest, token: string): Promise<ChangePasswordResponse> => {
    return apiClient.postAuthenticated<ChangePasswordRequest, ChangePasswordResponse>('/auth/change-password', data, token);
  },
};

export { authService };
export type { RegisterRequest, RegisterResponse, LoginRequest, LoginResponse, ForgotPasswordRequest, ForgotPasswordResponse, ChangePasswordRequest, ChangePasswordResponse, UserInfo, ApiError };
