import { apiClient } from './api';
import type {
  CharacterResponse,
  PendingCharacter,
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
