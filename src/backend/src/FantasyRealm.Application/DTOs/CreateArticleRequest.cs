namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Request payload for creating a new article.
    /// </summary>
    public sealed record CreateArticleRequest(
        string Name,
        int TypeId,
        int SlotId,
        string? ImageBase64);
}
