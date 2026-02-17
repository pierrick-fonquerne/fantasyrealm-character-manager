import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCharacterComments, getMyComment } from '../../services/commentService';
import type { CommentResponse } from '../../types';
import { StarRating } from '../ui';
import { CommentForm } from './CommentForm';
import { CommentCard } from './CommentCard';
import { CommentPendingCard } from './CommentPendingCard';

interface CommentSectionProps {
  characterId: number;
  isOwner: boolean;
}

export function CommentSection({ characterId, isOwner }: CommentSectionProps) {
  const { user, token, isAuthenticated } = useAuth();

  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [myComment, setMyComment] = useState<CommentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasAlreadyCommented = myComment !== null || comments.some((c) => c.authorId === user?.id);

  const averageRating = comments.length > 0
    ? Math.round((comments.reduce((sum, c) => sum + c.rating, 0) / comments.length) * 10) / 10
    : 0;

  const fetchComments = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const [commentsData, myCommentData] = await Promise.all([
        getCharacterComments(characterId),
        isAuthenticated && token ? getMyComment(characterId, token) : Promise.resolve(null),
      ]);
      setComments(commentsData);
      setMyComment(myCommentData);
    } catch {
      setError('Impossible de charger les avis.');
    } finally {
      setIsLoading(false);
    }
  }, [characterId, isAuthenticated, token]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const showPendingCard = myComment !== null && myComment.status !== 'Approved';

  return (
    <section aria-labelledby="comments-heading" className="mt-10">
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <h2 id="comments-heading" className="text-xl font-medium text-cream-100">
          Avis
        </h2>
        {!isLoading && comments.length > 0 && (
          <div className="flex items-center gap-2">
            <StarRating value={Math.round(averageRating)} readonly size="sm" />
            <span className="text-sm text-cream-400">
              {averageRating.toFixed(1)} ({comments.length} avis)
            </span>
          </div>
        )}
      </div>

      {!error && (
        <div className="space-y-6">
          {showPendingCard ? (
            <CommentPendingCard comment={myComment} />
          ) : (
            <CommentForm
              characterId={characterId}
              isOwner={isOwner}
              hasAlreadyCommented={hasAlreadyCommented}
              onSuccess={fetchComments}
            />
          )}

          {isLoading ? (
            <div className="flex justify-center py-8" role="status" aria-label="Chargement des avis">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-500" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-cream-500 text-center py-6">Aucun avis pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  onDeleted={fetchComments}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-5 text-center">
          <p className="text-cream-500 mb-3">{error}</p>
          <button
            type="button"
            onClick={fetchComments}
            className="text-gold-500 hover:text-gold-400 font-medium text-sm underline hover:no-underline"
          >
            Réessayer
          </button>
        </div>
      )}
    </section>
  );
}
