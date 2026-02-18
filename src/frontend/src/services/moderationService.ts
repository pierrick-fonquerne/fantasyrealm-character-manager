import { apiClient } from './api';
import type {
  CharacterResponse,
  CommentResponse,
  PendingCharacter,
  PendingComment,
  UserManagement,
  PagedResponse,
} from '../types';

export const getPendingCharacters = (
  page: number,
  token: string
): Promise<PagedResponse<PendingCharacter>> => {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', '12');
  return apiClient.getAuthenticated<PagedResponse<PendingCharacter>>(
    `/moderation/characters?${params.toString()}`,
    token
  );
};

export const approveCharacter = (
  id: number,
  token: string
): Promise<CharacterResponse> =>
  apiClient.patchAuthenticated<CharacterResponse>(
    `/moderation/characters/${id}/approve`,
    token
  );

export const rejectCharacter = (
  id: number,
  reason: string,
  token: string
): Promise<CharacterResponse> =>
  apiClient.patchAuthenticatedWithBody<{ reason: string }, CharacterResponse>(
    `/moderation/characters/${id}/reject`,
    { reason },
    token
  );

export const getPendingComments = (
  page: number,
  token: string
): Promise<PagedResponse<PendingComment>> => {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', '12');
  return apiClient.getAuthenticated<PagedResponse<PendingComment>>(
    `/moderation/comments?${params.toString()}`,
    token
  );
};

export const approveComment = (
  id: number,
  token: string
): Promise<CommentResponse> =>
  apiClient.patchAuthenticated<CommentResponse>(
    `/moderation/comments/${id}/approve`,
    token
  );

export const rejectComment = (
  id: number,
  reason: string,
  token: string
): Promise<CommentResponse> =>
  apiClient.patchAuthenticatedWithBody<{ reason: string }, CommentResponse>(
    `/moderation/comments/${id}/reject`,
    { reason },
    token
  );

// ── User moderation ────────────────────────────────────────────────

export const getUsers = (
  page: number,
  search: string,
  isSuspended: boolean | null,
  token: string
): Promise<PagedResponse<UserManagement>> => {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', '12');
  if (search) params.set('search', search);
  if (isSuspended !== null) params.set('isSuspended', String(isSuspended));
  return apiClient.getAuthenticated<PagedResponse<UserManagement>>(
    `/moderation/users?${params.toString()}`,
    token
  );
};

export const getUsersCount = (token: string): Promise<number> =>
  apiClient.getAuthenticated<number>('/moderation/users/count', token);

export const suspendUser = (
  id: number,
  reason: string,
  token: string
): Promise<UserManagement> =>
  apiClient.patchAuthenticatedWithBody<
    { isSuspended: boolean; reason: string },
    UserManagement
  >(`/moderation/users/${id}`, { isSuspended: true, reason }, token);

export const reactivateUser = (
  id: number,
  token: string
): Promise<UserManagement> =>
  apiClient.patchAuthenticatedWithBody<
    { isSuspended: boolean },
    UserManagement
  >(`/moderation/users/${id}`, { isSuspended: false }, token);

export const deleteUser = (id: number, token: string): Promise<void> =>
  apiClient.deleteAuthenticated(`/moderation/users/${id}`, token);
