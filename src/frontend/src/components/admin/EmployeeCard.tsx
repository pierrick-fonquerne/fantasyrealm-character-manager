import { memo } from 'react';
import type { EmployeeManagement } from '../../types/admin';
import { Button } from '../ui';
import { formatRelativeDate } from '../../utils/formatRelativeDate';

interface EmployeeCardProps {
  employee: EmployeeManagement;
  onSuspend: (id: number) => void;
  onReactivate: (id: number) => void;
  onResetPassword: (id: number) => void;
  onDelete: (id: number) => void;
  isProcessing: boolean;
}

export const EmployeeCard = memo(function EmployeeCard({
  employee,
  onSuspend,
  onReactivate,
  onResetPassword,
  onDelete,
  isProcessing,
}: EmployeeCardProps) {
  return (
    <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-cream-100 font-semibold truncate">{employee.pseudo}</p>
          <p className="text-xs text-cream-500 mt-0.5 truncate">{employee.email}</p>
        </div>
        <span
          className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
            employee.isSuspended
              ? 'bg-error-500/20 text-error-400'
              : 'bg-success-500/20 text-success-400'
          }`}
        >
          {employee.isSuspended ? 'Suspendu' : 'Actif'}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-cream-500">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Créé {formatRelativeDate(employee.createdAt)}
        </span>
      </div>

      <div className="flex gap-2 mt-auto">
        {employee.isSuspended ? (
          <Button
            variant="success"
            size="sm"
            onClick={() => onReactivate(employee.id)}
            isLoading={isProcessing}
            aria-label={`Réactiver le compte de ${employee.pseudo}`}
            className="flex-1"
          >
            <svg className="w-3.5 h-3.5 mr-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Réactiver
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onSuspend(employee.id)}
            isLoading={isProcessing}
            aria-label={`Suspendre le compte de ${employee.pseudo}`}
            className="flex-1"
          >
            <svg className="w-3.5 h-3.5 mr-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            Suspendre
          </Button>
        )}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onResetPassword(employee.id)}
          isLoading={isProcessing}
          aria-label={`Réinitialiser le mot de passe de ${employee.pseudo}`}
          className="flex-1"
        >
          <svg className="w-3.5 h-3.5 mr-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          Mot de passe
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => onDelete(employee.id)}
          disabled={isProcessing}
          aria-label={`Supprimer le compte de ${employee.pseudo}`}
          className="flex-1"
        >
          <svg className="w-3.5 h-3.5 mr-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Supprimer
        </Button>
      </div>
    </div>
  );
});
