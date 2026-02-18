import { apiClient } from './api';
import type { AdminStats } from '../types/admin';

export const getAdminStats = (token: string): Promise<AdminStats> =>
  apiClient.getAuthenticated<AdminStats>('/admin/stats', token);
