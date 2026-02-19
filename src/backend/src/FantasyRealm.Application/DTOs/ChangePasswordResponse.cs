namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Response payload for successful password change.
    /// </summary>
    public sealed record ChangePasswordResponse(
        string Token,
        DateTime ExpiresAt,
        UserInfo User
    );
}
