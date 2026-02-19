using FantasyRealm.Application.Interfaces;
using FantasyRealm.Domain.Entities;
using FantasyRealm.Domain.Enums;
using FantasyRealm.Infrastructure.Persistence;
using MongoDB.Driver;

namespace FantasyRealm.Infrastructure.Repositories
{
    /// <summary>
    /// MongoDB repository implementation for activity log entries.
    /// </summary>
    public sealed class ActivityLogRepository(MongoDbContext context) : IActivityLogRepository
    {
        /// <inheritdoc />
        public async Task LogAsync(ActivityLog log, CancellationToken cancellationToken)
        {
            await context.ActivityLogs.InsertOneAsync(log, cancellationToken: cancellationToken);
        }

        /// <inheritdoc />
        public async Task<(IReadOnlyList<ActivityLog> Items, long TotalCount)> GetLogsAsync(
            int page, int pageSize, ActivityAction? action, DateTime? from, DateTime? to,
            CancellationToken cancellationToken)
        {
            var filter = BuildFilter(action, from, to);

            var totalCount = await context.ActivityLogs
                .CountDocumentsAsync(filter, cancellationToken: cancellationToken);

            var items = await context.ActivityLogs
                .Find(filter)
                .SortByDescending(l => l.Timestamp)
                .Skip((page - 1) * pageSize)
                .Limit(pageSize)
                .ToListAsync(cancellationToken);

            return (items, totalCount);
        }

        private static FilterDefinition<ActivityLog> BuildFilter(
            ActivityAction? action, DateTime? from, DateTime? to)
        {
            var builder = Builders<ActivityLog>.Filter;
            var filters = new List<FilterDefinition<ActivityLog>>();

            if (action.HasValue)
                filters.Add(builder.Eq(l => l.Action, action.Value));

            if (from.HasValue)
                filters.Add(builder.Gte(l => l.Timestamp, from.Value));

            if (to.HasValue)
                filters.Add(builder.Lte(l => l.Timestamp, to.Value.Date.AddDays(1)));

            return filters.Count > 0 ? builder.And(filters) : builder.Empty;
        }
    }
}
