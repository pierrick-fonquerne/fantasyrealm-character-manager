import { apiClient } from './api';
import type { CommentResponse, CreateCommentData } from '../types';

export const getCharacterComments = (
  characterId: number
): Promise<CommentResponse[]> =>
  apiClient.get<CommentResponse[]>(`/characters/${characterId}/comments`);

export const createComment = (
  characterId: number,
  data: CreateCommentData,
  token: string
): Promise<CommentResponse> =>
  apiClient.postAuthenticated<CreateCommentData, CommentResponse>(
    `/characters/${characterId}/comments`,
    data,
    token
  );

export const getMyComment = async (
  characterId: number,
  token: string
): Promise<CommentResponse | null> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/characters/${characterId}/comments/mine`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (response.status === 204) return null;
  if (!response.ok) return null;

  return response.json();
};

export const deleteComment = (
  commentId: number,
  token: string
): Promise<void> =>
  apiClient.deleteAuthenticated(`/comments/${commentId}`, token);
