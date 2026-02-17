namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Comment details returned by the API.
    /// </summary>
    public sealed record CommentResponse(
        int Id,
        int Rating,
        string Text,
        string Status,
        DateTime CommentedAt,
        int CharacterId,
        int AuthorId,
        string AuthorPseudo);
}
