namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Lightweight article summary for paginated listings.
    /// </summary>
    public sealed record ArticleSummaryResponse(
        int Id,
        string Name,
        string TypeName,
        string SlotName,
        bool IsActive,
        string? ImageBase64);
}
