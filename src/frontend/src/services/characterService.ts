import { apiClient } from './api';

export interface CreateCharacterData {
  name: string;
  classId: number;
  gender: string;
  skinColor: string;
  eyeColor: string;
  hairColor: string;
  hairStyle: string;
  eyeShape: string;
  noseShape: string;
  mouthShape: string;
  faceShape: string;
}

export type UpdateCharacterData = CreateCharacterData;

export interface CharacterResponse {
  id: number;
  name: string;
  classId: number;
  className: string;
  gender: string;
  status: string;
  skinColor: string;
  eyeColor: string;
  hairColor: string;
  hairStyle: string;
  eyeShape: string;
  noseShape: string;
  mouthShape: string;
  faceShape: string;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterSummary {
  id: number;
  name: string;
  className: string;
  status: string;
  gender: string;
}

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
