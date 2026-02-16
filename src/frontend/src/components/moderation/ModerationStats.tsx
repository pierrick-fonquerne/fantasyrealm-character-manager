interface ModerationStatsProps {
  pendingCount: number;
  isLoading: boolean;
}

export function ModerationStats({ pendingCount, isLoading }: ModerationStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          {isLoading ? (
            <div className="h-7 w-10 bg-dark-700 rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-cream-100">{pendingCount}</p>
          )}
          <p className="text-sm text-cream-400">En attente</p>
        </div>
      </div>
    </div>
  );
}
