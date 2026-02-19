import { memo } from 'react';
import type { ActivityAction } from '../../types/admin';

const ACTION_OPTIONS: { value: ActivityAction; label: string }[] = [
  { value: 'EmployeeCreated', label: 'Employé créé' },
  { value: 'EmployeeSuspended', label: 'Employé suspendu' },
  { value: 'EmployeeReactivated', label: 'Employé réactivé' },
  { value: 'EmployeeDeleted', label: 'Employé supprimé' },
  { value: 'UserSuspended', label: 'Utilisateur suspendu' },
  { value: 'UserReactivated', label: 'Utilisateur réactivé' },
  { value: 'UserDeleted', label: 'Utilisateur supprimé' },
  { value: 'CharacterApproved', label: 'Personnage approuvé' },
  { value: 'CharacterRejected', label: 'Personnage rejeté' },
  { value: 'CommentApproved', label: 'Commentaire approuvé' },
  { value: 'CommentRejected', label: 'Commentaire rejeté' },
];

interface ActivityLogFiltersProps {
  action: ActivityAction | null;
  from: string;
  to: string;
  isLoading: boolean;
  onActionChange: (action: ActivityAction | null) => void;
  onFromChange: (from: string) => void;
  onToChange: (to: string) => void;
  onRefresh: () => void;
}

export const ActivityLogFilters = memo(function ActivityLogFilters({
  action,
  from,
  to,
  isLoading,
  onActionChange,
  onFromChange,
  onToChange,
  onRefresh,
}: ActivityLogFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <select
        value={action ?? ''}
        onChange={(e) =>
          onActionChange(e.target.value ? (e.target.value as ActivityAction) : null)
        }
        className="px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-cream-200 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm cursor-pointer"
        aria-label="Filtrer par type d'action"
      >
        <option value="">Toutes les actions</option>
        {ACTION_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={from}
        onChange={(e) => onFromChange(e.target.value)}
        className="px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-cream-200 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm"
        aria-label="Date de début"
      />

      <input
        type="date"
        value={to}
        onChange={(e) => onToChange(e.target.value)}
        className="px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-cream-200 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm"
        aria-label="Date de fin"
      />

      <button
        type="button"
        onClick={onRefresh}
        disabled={isLoading}
        className="inline-flex items-center gap-2 px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-cream-300 hover:bg-dark-700 hover:text-cream-100 transition-colors text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Rafraîchir les logs"
      >
        <svg
          className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Rafraîchir
      </button>
    </div>
  );
});
