import { memo } from 'react';
import type { PendingComment } from '../../types';
import { Button } from '../ui';
import { StarRating } from '../ui/StarRating';
import { formatRelativeDate } from '../../utils/formatRelativeDate';

interface CommentModerationCardProps {
  comment: PendingComment;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  isApproving: boolean;
}

export const CommentModerationCard = memo(function CommentModerationCard({
  comment,
  onApprove,
  onReject,
  isApproving,
}: CommentModerationCardProps) {
  return (
    <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-cream-100 font-semibold truncate">
            {comment.authorPseudo}
          </p>
          <p className="text-xs text-cream-500 mt-0.5">
            sur <span className="text-cream-300">{comment.characterName}</span>
          </p>
        </div>
        <StarRating value={comment.rating} readonly size="sm" />
      </div>

      <p className="text-sm text-cream-300 line-clamp-3">
        {comment.text}
      </p>

      <time
        dateTime={comment.commentedAt}
        className="text-xs text-cream-600"
      >
        {formatRelativeDate(comment.commentedAt)}
      </time>

      <div className="flex gap-2 mt-auto">
        <Button
          variant="success"
          size="sm"
          onClick={() => onApprove(comment.id)}
          isLoading={isApproving}
          aria-label={`Approuver l'avis de ${comment.authorPseudo}`}
          className="flex-1"
        >
          Approuver
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => onReject(comment.id)}
          disabled={isApproving}
          aria-label={`Rejeter l'avis de ${comment.authorPseudo}`}
          className="flex-1"
        >
          Rejeter
        </Button>
      </div>
    </div>
  );
});
