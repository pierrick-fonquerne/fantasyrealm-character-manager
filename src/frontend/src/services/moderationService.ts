import { apiClient } from './api';
import type {
  CharacterResponse,
  CommentResponse,
  PendingCharacter,
  PendingComment,
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
