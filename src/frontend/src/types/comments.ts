export interface CommentResponse {
  id: number;
  rating: number;
  text: string;
  status: string;
  commentedAt: string;
  characterId: number;
  authorId: number;
  authorPseudo: string;
  rejectionReason?: string;
}

export interface CreateCommentData {
  rating: number;
  text: string;
}

export interface PendingComment {
  id: number;
  rating: number;
  text: string;
  commentedAt: string;
  characterId: number;
  characterName: string;
  authorId: number;
  authorPseudo: string;
}
