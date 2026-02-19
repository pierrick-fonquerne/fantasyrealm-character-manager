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

      {comment.status === 'Rejected' && comment.rejectionReason && (
        <div className="mt-3 p-3 bg-error-500/10 border border-error-500/20 rounded-lg flex gap-2">
          <svg className="w-4 h-4 text-error-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-error-400">
            <span className="font-medium">Motif :</span> {comment.rejectionReason}
          </p>
        </div>
      )}
    </div>
  );
}
