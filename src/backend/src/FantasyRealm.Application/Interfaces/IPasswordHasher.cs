namespace FantasyRealm.Application.Interfaces
{
    /// <summary>
    /// Provides password hashing and verification functionality.
    /// </summary>
    public interface IPasswordHasher
    {
        /// <summary>
        /// Hashes a plain text password using a secure algorithm.
        /// </summary>
        /// <param name="password">The plain text password to hash.</param>
        /// <returns>The hashed password with embedded salt.</returns>
        string Hash(string password);

        /// <summary>
        /// Verifies a plain text password against a hashed password.
        /// </summary>
        /// <param name="password">The plain text password to verify.</param>
        /// <param name="hash">The hashed password to compare against.</param>
        /// <returns>True if the password matches the hash; otherwise, false.</returns>
        bool Verify(string password, string hash);
    }
}
