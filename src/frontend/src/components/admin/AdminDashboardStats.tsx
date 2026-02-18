import type { AdminStats } from '../../types/admin';

interface AdminDashboardStatsProps {
  stats: AdminStats | null;
  isLoading: boolean;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  subValue?: { label: string; value: number; variant?: 'warning' | 'default' };
  isLoading: boolean;
}

function StatCard({ icon, label, value, subValue, isLoading }: StatCardProps) {
  return (
    <div className="bg-dark-800 border border-dark-700 rounded-xl p-5">
      <div className="flex items-center gap-4 mb-3">
        <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          {isLoading ? (
            <div className="h-8 w-12 bg-dark-700 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-cream-100">{value}</p>
          )}
          <p className="text-sm text-cream-400">{label}</p>
        </div>
      </div>
      {subValue && (
        <div className="pt-3 border-t border-dark-700">
          {isLoading ? (
            <div className="h-4 w-24 bg-dark-700 rounded animate-pulse" />
          ) : (
            <p className={`text-sm ${subValue.variant === 'warning' ? 'text-amber-400' : 'text-cream-500'}`}>
              {subValue.value} {subValue.label}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function AdminDashboardStats({ stats, isLoading }: AdminDashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={
          <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        }
        label="Utilisateurs"
        value={stats?.totalUsers ?? 0}
        subValue={{ label: 'suspendus', value: stats?.suspendedUsers ?? 0, variant: stats?.suspendedUsers ? 'warning' : 'default' }}
        isLoading={isLoading}
      />

      <StatCard
        icon={
          <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        }
        label="Employés"
        value={stats?.totalEmployees ?? 0}
        isLoading={isLoading}
      />

      <StatCard
        icon={
          <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
        label="Personnages"
        value={stats?.totalCharacters ?? 0}
        subValue={{ label: 'en attente', value: stats?.pendingCharacters ?? 0, variant: stats?.pendingCharacters ? 'warning' : 'default' }}
        isLoading={isLoading}
      />

      <StatCard
        icon={
          <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        }
        label="Commentaires"
        value={stats?.totalComments ?? 0}
        subValue={{ label: 'en attente', value: stats?.pendingComments ?? 0, variant: stats?.pendingComments ? 'warning' : 'default' }}
        isLoading={isLoading}
      />
    </div>
  );
}
