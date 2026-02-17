export interface CommentResponse {
  id: number;
  rating: number;
  text: string;
  status: string;
  commentedAt: string;
  characterId: number;
  authorId: number;
  authorPseudo: string;
}

export interface CreateCommentData {
  rating: number;
  text: string;
}
