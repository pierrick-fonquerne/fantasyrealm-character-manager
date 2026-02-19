namespace FantasyRealm.Application.Interfaces
{
    /// <summary>
    /// Provides access to the currently authenticated user's identity from JWT claims.
    /// </summary>
    public interface ICurrentUserService
    {
        /// <summary>
        /// Gets the authenticated user's identifier from the "sub" claim.
        /// </summary>
        int UserId { get; }

        /// <summary>
        /// Gets the authenticated user's display name from the "pseudo" claim.
        /// </summary>
        string Pseudo { get; }
    }
}
