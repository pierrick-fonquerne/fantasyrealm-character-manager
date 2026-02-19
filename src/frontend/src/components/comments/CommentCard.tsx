import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { deleteComment } from '../../services/commentService';
import { StarRating } from '../ui';
import { formatRelativeDate } from '../../utils/formatRelativeDate';
import type { CommentResponse } from '../../types';

interface CommentCardProps {
  comment: CommentResponse;
  onDeleted: () => void;
}

export function CommentCard({ comment, onDeleted }: CommentCardProps) {
  const { user, token } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isAuthor = user?.id === comment.authorId;

  const handleDelete = async () => {
    if (!token) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteComment(comment.id, token);
      onDeleted();
    } catch {
      setDeleteError('Erreur lors de la suppression.');
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-cream-200">{comment.authorPseudo}</span>
          <StarRating value={comment.rating} readonly size="sm" />
        </div>
        <span className="text-xs text-cream-600">{formatRelativeDate(comment.commentedAt)}</span>
      </div>

      <p className="text-cream-300 text-sm leading-relaxed">{comment.text}</p>

      {isAuthor && (
        <div className="mt-3 flex items-center gap-2">
          {!showConfirm ? (
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              className="text-xs text-cream-600 hover:text-error-500 transition-colors"
              aria-label="Supprimer mon avis"
            >
              Supprimer
            </button>
          ) : (
            <>
              <span className="text-xs text-cream-500">Confirmer ?</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-xs text-error-500 hover:text-error-400 font-medium transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Suppression...' : 'Oui'}
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="text-xs text-cream-500 hover:text-cream-300 transition-colors disabled:opacity-50"
              >
                Non
              </button>
            </>
          )}
        </div>
      )}

      {deleteError && (
        <p className="text-xs text-error-500 mt-2" role="alert">{deleteError}</p>
      )}
    </div>
  );
}
