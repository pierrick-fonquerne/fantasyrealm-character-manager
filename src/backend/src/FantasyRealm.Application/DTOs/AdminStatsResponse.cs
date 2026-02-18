namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Aggregated platform statistics returned to administrators.
    /// </summary>
    public sealed record AdminStatsResponse(
        int TotalUsers,
        int SuspendedUsers,
        int TotalEmployees,
        int TotalCharacters,
        int PendingCharacters,
        int TotalComments,
        int PendingComments);
}
