using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;
using FantasyRealm.Domain.Enums;

namespace FantasyRealm.Application.Interfaces
{
    /// <summary>
    /// Service for logging and querying platform activity.
    /// </summary>
    public interface IActivityLogService
    {
        /// <summary>
        /// Logs an activity performed by the current user. Designed for fire-and-forget usage.
        /// </summary>
        /// <param name="action">The type of action performed.</param>
        /// <param name="targetType">The type of entity targeted (e.g. "User", "Character").</param>
        /// <param name="targetId">The identifier of the targeted entity.</param>
        /// <param name="targetName">The display name of the targeted entity (e.g. pseudo).</param>
        /// <param name="details">Optional additional details about the action.</param>
        /// <param name="cancellationToken">A cancellation token.</param>
        Task LogAsync(ActivityAction action, string targetType, int targetId, string? targetName,
            string? details, CancellationToken cancellationToken);

        /// <summary>
        /// Retrieves a paginated list of activity logs with optional filters.
        /// </summary>
        /// <param name="page">The page number (1-based).</param>
        /// <param name="pageSize">The number of items per page.</param>
        /// <param name="action">Optional action filter.</param>
        /// <param name="from">Optional start date filter.</param>
        /// <param name="to">Optional end date filter.</param>
        /// <param name="cancellationToken">A cancellation token.</param>
        /// <returns>A paginated response of activity log entries.</returns>
        Task<Result<PagedResponse<ActivityLogResponse>>> GetLogsAsync(
            int page, int pageSize, ActivityAction? action, DateTime? from, DateTime? to,
            CancellationToken cancellationToken);

    }
}
