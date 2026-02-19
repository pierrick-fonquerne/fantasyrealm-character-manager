export interface ArticleResponse {
  id: number;
  name: string;
  typeId: number;
  typeName: string;
  slotId: number;
  slotName: string;
  imageBase64: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleSummaryResponse {
  id: number;
  name: string;
  typeName: string;
  slotName: string;
  isActive: boolean;
  imageBase64: string | null;
}

export interface CreateArticleRequest {
  name: string;
  typeId: number;
  slotId: number;
  imageBase64: string | null;
}

export interface UpdateArticleRequest {
  name: string;
  typeId: number;
  slotId: number;
  imageBase64: string | null;
}
