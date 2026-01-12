namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Response payload for successful login.
    /// </summary>
    public sealed record LoginResponse(
        string Token,
        DateTime ExpiresAt,
        UserInfo User,
        bool MustChangePassword
    );
}
