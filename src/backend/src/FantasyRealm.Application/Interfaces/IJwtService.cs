namespace FantasyRealm.Application.Interfaces
{
    /// <summary>
    /// Service interface for JWT token operations.
    /// </summary>
    public interface IJwtService
    {
        /// <summary>
        /// Generates a JWT token for the specified user.
        /// </summary>
        /// <param name="userId">The user's unique identifier.</param>
        /// <param name="email">The user's email address.</param>
        /// <param name="pseudo">The user's display name.</param>
        /// <param name="role">The user's role.</param>
        /// <returns>A signed JWT token string.</returns>
        string GenerateToken(int userId, string email, string pseudo, string role);

        /// <summary>
        /// Gets the expiration date for a newly generated token.
        /// </summary>
        /// <returns>The UTC datetime when the token will expire.</returns>
        DateTime GetExpirationDate();
    }
}
