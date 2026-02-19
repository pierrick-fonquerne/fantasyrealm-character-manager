namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Represents a user in the employee moderation user list.
    /// </summary>
    public sealed record UserManagementResponse(
        int Id,
        string Pseudo,
        string Email,
        bool IsSuspended,
        DateTime CreatedAt,
        int CharacterCount);
}
