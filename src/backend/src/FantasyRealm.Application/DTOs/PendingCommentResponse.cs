namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Represents a comment pending moderation review.
    /// </summary>
    public sealed record PendingCommentResponse(
        int Id,
        int Rating,
        string Text,
        DateTime CommentedAt,
        int CharacterId,
        string CharacterName,
        int AuthorId,
        string AuthorPseudo);
}
