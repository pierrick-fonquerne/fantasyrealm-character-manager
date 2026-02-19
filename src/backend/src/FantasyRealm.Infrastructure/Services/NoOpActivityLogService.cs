using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using FantasyRealm.Domain.Enums;

namespace FantasyRealm.Infrastructure.Services
{
    /// <summary>
    /// No-op implementation of <see cref="IActivityLogService"/> used when MongoDB is not configured.
    /// All write operations are silently ignored; read operations return empty results.
    /// </summary>
    public sealed class NoOpActivityLogService : IActivityLogService
    {
        /// <inheritdoc />
        public Task LogAsync(ActivityAction action, string targetType, int targetId, string? targetName,
            string? details, CancellationToken cancellationToken) => Task.CompletedTask;

        /// <inheritdoc />
        public Task<Result<PagedResponse<ActivityLogResponse>>> GetLogsAsync(
            int page, int pageSize, ActivityAction? action, DateTime? from, DateTime? to,
            CancellationToken cancellationToken)
        {
            return Task.FromResult(Result<PagedResponse<ActivityLogResponse>>.Success(
                new PagedResponse<ActivityLogResponse>([], page, pageSize, 0, 0)));
        }
    }
}
