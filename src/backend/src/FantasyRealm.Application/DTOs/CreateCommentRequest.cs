namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Request payload for creating a comment on a character.
    /// </summary>
    public sealed record CreateCommentRequest(
        int Rating,
        string Text);
}
