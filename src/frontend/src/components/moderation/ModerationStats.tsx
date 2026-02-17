interface ModerationStatsProps {
  pendingCharactersCount: number;
  pendingCommentsCount: number;
  isLoading: boolean;
}

export function ModerationStats({ pendingCharactersCount, pendingCommentsCount, isLoading }: ModerationStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
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
    </div>
  );
}
