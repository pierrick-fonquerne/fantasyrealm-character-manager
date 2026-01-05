namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Response payload after successful user registration.
    /// </summary>
    public sealed record RegisterResponse(
        int Id,
        string Email,
        string Pseudo,
        string Role,
        DateTime CreatedAt
    );
}
