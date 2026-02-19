namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Full article details returned by the API.
    /// </summary>
    public sealed record ArticleResponse(
        int Id,
        string Name,
        int TypeId,
        string TypeName,
        int SlotId,
        string SlotName,
        string? ImageBase64,
        bool IsActive,
        DateTime CreatedAt,
        DateTime UpdatedAt);
}
