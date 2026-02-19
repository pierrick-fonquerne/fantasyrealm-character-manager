import { apiClient } from './api';
import type {
  ArticleResponse,
  ArticleSummaryResponse,
  CreateArticleRequest,
  UpdateArticleRequest,
  PagedResponse,
} from '../types';

// ── Public endpoints ─────────────────────────────────────────────

export const getArticles = (
  page: number,
  search?: string,
  slotId?: number,
  typeId?: number,
  sortBy?: string
): Promise<PagedResponse<ArticleSummaryResponse>> => {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', '20');
  if (search) params.set('search', search);
  if (slotId) params.set('slotId', String(slotId));
  if (typeId) params.set('typeId', String(typeId));
  if (sortBy) params.set('sortBy', sortBy);
  return apiClient.get<PagedResponse<ArticleSummaryResponse>>(
    `/articles?${params.toString()}`
  );
};

export const getArticleById = (id: number): Promise<ArticleResponse> =>
  apiClient.get<ArticleResponse>(`/articles/${id}`);

// ── Employee management endpoints ────────────────────────────────

export const getArticlesManage = (
  page: number,
  token: string,
  search?: string,
  slotId?: number,
  typeId?: number,
  isActive?: boolean | null,
  sortBy?: string
): Promise<PagedResponse<ArticleSummaryResponse>> => {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', '20');
  if (search) params.set('search', search);
  if (slotId) params.set('slotId', String(slotId));
  if (typeId) params.set('typeId', String(typeId));
  if (isActive !== null && isActive !== undefined)
    params.set('isActive', String(isActive));
  if (sortBy) params.set('sortBy', sortBy);
  return apiClient.getAuthenticated<PagedResponse<ArticleSummaryResponse>>(
    `/articles/manage?${params.toString()}`,
    token
  );
};

export const getArticleManageById = (
  id: number,
  token: string
): Promise<ArticleResponse> =>
  apiClient.getAuthenticated<ArticleResponse>(
    `/articles/manage/${id}`,
    token
  );

export const createArticle = (
  data: CreateArticleRequest,
  token: string
): Promise<ArticleResponse> =>
  apiClient.postAuthenticated<CreateArticleRequest, ArticleResponse>(
    '/articles',
    data,
    token
  );

export const updateArticle = (
  id: number,
  data: UpdateArticleRequest,
  token: string
): Promise<ArticleResponse> =>
  apiClient.putAuthenticated<UpdateArticleRequest, ArticleResponse>(
    `/articles/${id}`,
    data,
    token
  );

export const toggleArticleActive = (
  id: number,
  token: string
): Promise<ArticleResponse> =>
  apiClient.patchAuthenticated<ArticleResponse>(
    `/articles/${id}/toggle-active`,
    token
  );

export const deleteArticle = (
  id: number,
  token: string
): Promise<void> =>
  apiClient.deleteAuthenticated(`/articles/${id}`, token);

export const checkArticleName = (
  name: string,
  token: string,
  excludeId?: number
): Promise<{ available: boolean }> => {
  const params = new URLSearchParams();
  params.set('name', name);
  if (excludeId) params.set('excludeId', String(excludeId));
  return apiClient.getAuthenticated<{ available: boolean }>(
    `/articles/check-name?${params.toString()}`,
    token
  );
};
