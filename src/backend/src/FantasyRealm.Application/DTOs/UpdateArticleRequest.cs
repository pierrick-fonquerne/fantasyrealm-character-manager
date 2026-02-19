namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Request payload for updating an existing article.
    /// When <see cref="ImageBase64"/> is <c>null</c>, the image is unchanged.
    /// When <see cref="ImageBase64"/> is an empty string, the image is removed.
    /// </summary>
    public sealed record UpdateArticleRequest(
        string Name,
        int TypeId,
        int SlotId,
        string? ImageBase64);
}
