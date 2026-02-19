import { memo } from 'react';
import type { ActivityLog } from '../../types/admin';

const ACTION_LABELS: Record<string, string> = {
  EmployeeCreated: 'Employé créé',
  EmployeeSuspended: 'Employé suspendu',
  EmployeeReactivated: 'Employé réactivé',
  EmployeeDeleted: 'Employé supprimé',
  UserSuspended: 'Utilisateur suspendu',
  UserReactivated: 'Utilisateur réactivé',
  UserDeleted: 'Utilisateur supprimé',
  CharacterApproved: 'Personnage approuvé',
  CharacterRejected: 'Personnage rejeté',
  CommentApproved: 'Commentaire approuvé',
  CommentRejected: 'Commentaire rejeté',
  ArticleCreated: 'Article créé',
  ArticleUpdated: 'Article modifié',
  ArticleDeleted: 'Article supprimé',
};

const ACTION_COLORS: Record<string, string> = {
  EmployeeCreated: 'bg-blue-500/20 text-blue-400',
  EmployeeSuspended: 'bg-orange-500/20 text-orange-400',
  EmployeeReactivated: 'bg-green-500/20 text-green-400',
  EmployeeDeleted: 'bg-red-500/20 text-red-400',
  UserSuspended: 'bg-orange-500/20 text-orange-400',
  UserReactivated: 'bg-green-500/20 text-green-400',
  UserDeleted: 'bg-red-500/20 text-red-400',
  CharacterApproved: 'bg-amber-500/20 text-amber-400',
  CharacterRejected: 'bg-red-500/20 text-red-400',
  CommentApproved: 'bg-amber-500/20 text-amber-400',
  CommentRejected: 'bg-red-500/20 text-red-400',
  ArticleCreated: 'bg-blue-500/20 text-blue-400',
  ArticleUpdated: 'bg-blue-500/20 text-blue-400',
  ArticleDeleted: 'bg-red-500/20 text-red-400',
};

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

interface ActivityLogTableProps {
  logs: ActivityLog[];
}

export const ActivityLogTable = memo(function ActivityLogTable({
  logs,
}: ActivityLogTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-dark-600 text-cream-500 text-xs uppercase tracking-wider">
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Action</th>
            <th className="px-4 py-3 font-medium">Acteur</th>
            <th className="px-4 py-3 font-medium">Cible</th>
            <th className="px-4 py-3 font-medium">Détails</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr
              key={log.id}
              className="border-b border-dark-700/50 hover:bg-dark-800/50 transition-colors"
            >
              <td className="px-4 py-3 text-cream-400 whitespace-nowrap">
                {formatDate(log.timestamp)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    ACTION_COLORS[log.action] ?? 'bg-dark-600 text-cream-400'
                  }`}
                >
                  {ACTION_LABELS[log.action] ?? log.action}
                </span>
              </td>
              <td className="px-4 py-3 text-cream-200 font-medium">
                {log.actorPseudo}
              </td>
              <td className="px-4 py-3 text-cream-400">
                {log.targetName
                  ? `${log.targetName} (${log.targetType} #${log.targetId})`
                  : `${log.targetType} #${log.targetId}`}
              </td>
              <td className="px-4 py-3 text-cream-500 max-w-xs truncate">
                {log.details ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
