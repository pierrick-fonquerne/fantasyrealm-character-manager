namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Basic user information returned in authentication responses.
    /// </summary>
    public sealed record UserInfo(
        int Id,
        string Email,
        string Pseudo,
        string Role
    );
}
