namespace FantasyRealm.Application.Interfaces
{
    /// <summary>
    /// Service interface for generating secure passwords.
    /// </summary>
    public interface IPasswordGenerator
    {
        /// <summary>
        /// Generates a cryptographically secure random password that meets CNIL requirements.
        /// </summary>
        /// <param name="length">The desired password length (minimum 12).</param>
        /// <returns>A secure password containing uppercase, lowercase, digits, and special characters.</returns>
        string GenerateSecurePassword(int length = 16);
    }
}
