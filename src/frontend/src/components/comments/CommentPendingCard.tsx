import { StarRating } from '../ui';
import { formatRelativeDate } from '../../utils/formatRelativeDate';
import type { CommentResponse } from '../../types';

interface CommentPendingCardProps {
  comment: CommentResponse;
}

const statusLabels: Record<string, { label: string; className: string }> = {
  Pending: { label: 'En attente de validation', className: 'text-gold-500 border-gold-500/30' },
  Rejected: { label: 'Rejeté par un modérateur', className: 'text-error-500 border-error-500/30' },
};

export function CommentPendingCard({ comment }: CommentPendingCardProps) {
  const status = statusLabels[comment.status] ?? statusLabels.Pending;

  return (
    <div className={`bg-dark-800 border ${status.className} rounded-xl p-5`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-cream-200">Votre avis</span>
        <span className={`text-xs font-medium ${status.className}`}>
          {status.label}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <StarRating value={comment.rating} readonly size="sm" />
        <span className="text-xs text-cream-600">{formatRelativeDate(comment.commentedAt)}</span>
      </div>

      <p className="text-cream-300 text-sm leading-relaxed">{comment.text}</p>
    </div>
  );
}
