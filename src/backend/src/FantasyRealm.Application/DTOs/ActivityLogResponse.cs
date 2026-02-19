namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Represents an activity log entry returned to the client.
    /// </summary>
    public sealed record ActivityLogResponse(
        string Id,
        string Action,
        int ActorId,
        string ActorPseudo,
        string TargetType,
        int TargetId,
        string? TargetName,
        string? Details,
        DateTime Timestamp);
}
