using FantasyRealm.Application.DTOs;
using FantasyRealm.Domain.Entities;

namespace FantasyRealm.Application.Mapping
{
    /// <summary>
    /// Provides mapping between <see cref="ActivityLog"/> entities and DTOs.
    /// </summary>
    public static class ActivityLogMapper
    {
        /// <summary>
        /// Maps an <see cref="ActivityLog"/> entity to an <see cref="ActivityLogResponse"/> DTO.
        /// </summary>
        /// <param name="log">The activity log entity from MongoDB.</param>
        /// <returns>A fully populated <see cref="ActivityLogResponse"/>.</returns>
        public static ActivityLogResponse ToResponse(ActivityLog log)
        {
            var details = log.Details?["message"]?.AsString;

            return new ActivityLogResponse(
                log.Id.ToString(),
                log.Action.ToString(),
                log.UserId,
                log.UserPseudo,
                log.TargetType,
                log.TargetId,
                log.TargetName,
                details,
                log.Timestamp);
        }
    }
}
