import { apiClient } from './api';
import type { ActivityLog, ActivityAction } from '../types/admin';
import type { PagedResponse } from '../types/common';

export const getLogs = (
  page: number,
  pageSize: number,
  action: ActivityAction | null,
  from: string | null,
  to: string | null,
  token: string
): Promise<PagedResponse<ActivityLog>> => {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  if (action) params.set('action', action);
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  return apiClient.getAuthenticated<PagedResponse<ActivityLog>>(
    `/admin/activity-logs?${params.toString()}`,
    token
  );
};
