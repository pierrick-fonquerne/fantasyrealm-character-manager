using FantasyRealm.Domain.Entities;
using FantasyRealm.Domain.Enums;

namespace FantasyRealm.Application.Interfaces
{
    /// <summary>
    /// Repository for managing activity log entries in MongoDB.
    /// </summary>
    public interface IActivityLogRepository
    {
        /// <summary>
        /// Inserts a new activity log entry.
        /// </summary>
        /// <param name="log">The activity log entry to insert.</param>
        /// <param name="cancellationToken">A cancellation token.</param>
        Task LogAsync(ActivityLog log, CancellationToken cancellationToken);

        /// <summary>
        /// Retrieves a paginated list of activity logs with optional filters.
        /// </summary>
        /// <param name="page">The page number (1-based).</param>
        /// <param name="pageSize">The number of items per page.</param>
        /// <param name="action">Optional action filter.</param>
        /// <param name="from">Optional start date filter (inclusive).</param>
        /// <param name="to">Optional end date filter (inclusive).</param>
        /// <param name="cancellationToken">A cancellation token.</param>
        /// <returns>A tuple containing the items and total count.</returns>
        Task<(IReadOnlyList<ActivityLog> Items, long TotalCount)> GetLogsAsync(
            int page, int pageSize, ActivityAction? action, DateTime? from, DateTime? to,
            CancellationToken cancellationToken);

    }
}
