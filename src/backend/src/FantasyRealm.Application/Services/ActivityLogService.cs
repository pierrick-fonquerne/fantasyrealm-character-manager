using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using FantasyRealm.Application.Mapping;
using FantasyRealm.Domain.Entities;
using FantasyRealm.Domain.Enums;

namespace FantasyRealm.Application.Services
{
    /// <summary>
    /// Handles activity log recording and querying operations.
    /// </summary>
    public sealed class ActivityLogService(
        IActivityLogRepository activityLogRepository,
        ICurrentUserService currentUserService) : IActivityLogService
    {
        /// <inheritdoc />
        public async Task LogAsync(
            ActivityAction action,
            string targetType,
            int targetId,
            string? targetName,
            string? details,
            CancellationToken cancellationToken)
        {
            var log = new ActivityLog
            {
                Timestamp = DateTime.UtcNow,
                UserId = currentUserService.UserId,
                UserPseudo = currentUserService.Pseudo,
                Action = action,
                TargetType = targetType,
                TargetId = targetId,
                TargetName = targetName
            };

            if (!string.IsNullOrWhiteSpace(details))
                log.Details = new MongoDB.Bson.BsonDocument("message", details);

            await activityLogRepository.LogAsync(log, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<Result<PagedResponse<ActivityLogResponse>>> GetLogsAsync(
            int page, int pageSize, ActivityAction? action, DateTime? from, DateTime? to,
            CancellationToken cancellationToken)
        {
            if (page < 1)
                return Result<PagedResponse<ActivityLogResponse>>.Failure("Le numéro de page doit être supérieur à 0.");

            if (page > 1000)
                return Result<PagedResponse<ActivityLogResponse>>.Failure("Le numéro de page ne peut pas dépasser 1000.");

            pageSize = Math.Clamp(pageSize, 1, 50);

            var (items, totalCount) = await activityLogRepository.GetLogsAsync(
                page, pageSize, action, from, to, cancellationToken);

            var responses = items.Select(ActivityLogMapper.ToResponse).ToList();
            var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

            return Result<PagedResponse<ActivityLogResponse>>.Success(
                new PagedResponse<ActivityLogResponse>(responses, page, pageSize, (int)totalCount, totalPages));
        }
    }
}
