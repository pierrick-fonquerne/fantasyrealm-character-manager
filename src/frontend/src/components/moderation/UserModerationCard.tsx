import { memo } from 'react';
import type { UserManagement } from '../../types';
import { Button } from '../ui';
import { formatRelativeDate } from '../../utils/formatRelativeDate';

interface UserModerationCardProps {
  user: UserManagement;
  onSuspend: (id: number) => void;
  onReactivate: (id: number) => void;
  onDelete: (id: number) => void;
  isProcessing: boolean;
}

export const UserModerationCard = memo(function UserModerationCard({
  user,
  onSuspend,
  onReactivate,
  onDelete,
  isProcessing,
}: UserModerationCardProps) {
  return (
    <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-cream-100 font-semibold truncate">{user.pseudo}</p>
          <p className="text-xs text-cream-500 mt-0.5 truncate">{user.email}</p>
        </div>
        <span
          className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
            user.isSuspended
              ? 'bg-error-500/20 text-error-400'
              : 'bg-success-500/20 text-success-400'
          }`}
        >
          {user.isSuspended ? 'Suspendu' : 'Actif'}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-cream-500">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Inscrit {formatRelativeDate(user.createdAt)}
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {user.characterCount} personnage{user.characterCount !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex gap-2 mt-auto">
        {user.isSuspended ? (
          <Button
            variant="success"
            size="sm"
            onClick={() => onReactivate(user.id)}
            isLoading={isProcessing}
            aria-label={`Réactiver le compte de ${user.pseudo}`}
            className="flex-1"
          >
            Réactiver
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onSuspend(user.id)}
            isLoading={isProcessing}
            aria-label={`Suspendre le compte de ${user.pseudo}`}
            className="flex-1"
          >
            Suspendre
          </Button>
        )}
        <Button
          variant="danger"
          size="sm"
          onClick={() => onDelete(user.id)}
          disabled={isProcessing}
          aria-label={`Supprimer le compte de ${user.pseudo}`}
          className="flex-1"
        >
          Supprimer
        </Button>
      </div>
    </div>
  );
});
