import { apiClient } from './api';
import type { EmployeeManagement } from '../types/admin';
import type { PagedResponse } from '../types/common';

export const getEmployees = (
  page: number,
  search: string,
  isSuspended: boolean | null,
  token: string
): Promise<PagedResponse<EmployeeManagement>> => {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', '12');
  if (search) params.set('search', search);
  if (isSuspended !== null) params.set('isSuspended', String(isSuspended));
  return apiClient.getAuthenticated<PagedResponse<EmployeeManagement>>(
    `/admin/employees?${params.toString()}`,
    token
  );
};

export const getEmployeesCount = (token: string): Promise<number> =>
  apiClient.getAuthenticated<number>('/admin/employees/count', token);

export const createEmployee = (
  email: string,
  password: string,
  token: string
): Promise<EmployeeManagement> =>
  apiClient.postAuthenticated<
    { email: string; password: string },
    EmployeeManagement
  >('/admin/employees', { email, password }, token);

export const suspendEmployee = (
  id: number,
  reason: string,
  token: string
): Promise<EmployeeManagement> =>
  apiClient.patchAuthenticatedWithBody<
    { isSuspended: boolean; reason: string },
    EmployeeManagement
  >(`/admin/employees/${id}`, { isSuspended: true, reason }, token);

export const reactivateEmployee = (
  id: number,
  token: string
): Promise<EmployeeManagement> =>
  apiClient.patchAuthenticatedWithBody<
    { isSuspended: boolean },
    EmployeeManagement
  >(`/admin/employees/${id}`, { isSuspended: false }, token);

export const resetEmployeePassword = (id: number, token: string): Promise<void> =>
  apiClient.postAuthenticatedNoContent(
    `/admin/employees/${id}/reset-password`,
    {},
    token
  );

export const deleteEmployee = (id: number, token: string): Promise<void> =>
  apiClient.deleteAuthenticated(`/admin/employees/${id}`, token);
