namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Lightweight character summary for list views.
    /// </summary>
    public sealed record CharacterSummaryResponse(
        int Id,
        string Name,
        string ClassName,
        string Status,
        string Gender);
}
