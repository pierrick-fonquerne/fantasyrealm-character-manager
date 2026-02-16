import { apiClient } from './api';
import type {
  CreateCharacterData,
  UpdateCharacterData,
  CharacterResponse,
  CharacterSummary,
  NameAvailabilityResponse,
  GalleryCharacter,
  GalleryFilters,
  PagedResponse,
} from '../types';

export const createCharacter = (
  data: CreateCharacterData,
  token: string
): Promise<CharacterResponse> =>
  apiClient.postAuthenticated<CreateCharacterData, CharacterResponse>(
    '/characters',
    data,
    token
  );

export const getMyCharacters = (
  token: string
): Promise<CharacterSummary[]> =>
  apiClient.getAuthenticated<CharacterSummary[]>('/characters/mine', token);

export const getCharacter = (
  id: number,
  token: string
): Promise<CharacterResponse> =>
  apiClient.getAuthenticated<CharacterResponse>(`/characters/${id}`, token);

export const getCharacterPublic = (
  id: number,
  token: string | null
): Promise<CharacterResponse> =>
  token
    ? apiClient.getAuthenticated<CharacterResponse>(`/characters/${id}`, token)
    : apiClient.get<CharacterResponse>(`/characters/${id}`);

export const updateCharacter = (
  id: number,
  data: UpdateCharacterData,
  token: string
): Promise<CharacterResponse> =>
  apiClient.putAuthenticated<UpdateCharacterData, CharacterResponse>(
    `/characters/${id}`,
    data,
    token
  );

export const deleteCharacter = (
  id: number,
  token: string
): Promise<void> =>
  apiClient.deleteAuthenticated(`/characters/${id}`, token);

export const submitCharacter = (
  id: number,
  token: string
): Promise<CharacterResponse> =>
  apiClient.patchAuthenticated<CharacterResponse>(
    `/characters/${id}/submit`,
    token
  );

export const checkNameAvailability = (
  name: string,
  token: string,
  excludeId?: number
): Promise<NameAvailabilityResponse> =>
  apiClient.getAuthenticated<NameAvailabilityResponse>(
    `/characters/check-name?name=${encodeURIComponent(name)}${excludeId ? `&excludeId=${excludeId}` : ''}`,
    token
  );

export const duplicateCharacter = (
  id: number,
  newName: string,
  token: string
): Promise<CharacterResponse> =>
  apiClient.postAuthenticated<{ name: string }, CharacterResponse>(
    `/characters/${id}/duplicate`,
    { name: newName },
    token
  );

export const toggleShareCharacter = (
  id: number,
  token: string
): Promise<CharacterResponse> =>
  apiClient.patchAuthenticated<CharacterResponse>(
    `/characters/${id}/share`,
    token
  );

export const getGallery = (
  filters: GalleryFilters = {}
): Promise<PagedResponse<GalleryCharacter>> => {
  const params = new URLSearchParams();
  if (filters.gender) params.set('gender', filters.gender);
  if (filters.author) params.set('author', filters.author);
  if (filters.sort) params.set('sort', filters.sort);
  params.set('page', String(filters.page ?? 1));
  params.set('pageSize', '12');
  return apiClient.get<PagedResponse<GalleryCharacter>>(
    `/characters?${params.toString()}`
  );
};
