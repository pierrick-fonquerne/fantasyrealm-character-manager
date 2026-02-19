interface ModerationStatsProps {
  pendingCharactersCount: number;
  pendingCommentsCount: number;
  usersCount: number;
  isLoading: boolean;
}

export function ModerationStats({ pendingCharactersCount, pendingCommentsCount, usersCount, isLoading }: ModerationStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          {isLoading ? (
            <div className="h-7 w-10 bg-dark-700 rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-cream-100">{pendingCharactersCount}</p>
          )}
          <p className="text-sm text-cream-400">Personnages en attente</p>
        </div>
      </div>

      <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </div>
        <div>
          {isLoading ? (
            <div className="h-7 w-10 bg-dark-700 rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-cream-100">{pendingCommentsCount}</p>
          )}
          <p className="text-sm text-cream-400">Commentaires en attente</p>
        </div>
      </div>

      <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
        </div>
        <div>
          {isLoading ? (
            <div className="h-7 w-10 bg-dark-700 rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-cream-100">{usersCount}</p>
          )}
          <p className="text-sm text-cream-400">Utilisateurs</p>
        </div>
      </div>
    </div>
  );
}
