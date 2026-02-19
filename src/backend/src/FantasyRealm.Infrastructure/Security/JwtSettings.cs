namespace FantasyRealm.Infrastructure.Security
{
    /// <summary>
    /// Configuration settings for JWT token generation and validation.
    /// </summary>
    public sealed class JwtSettings
    {
        /// <summary>
        /// The configuration section name in appsettings.json.
        /// </summary>
        public const string SectionName = "Jwt";

        /// <summary>
        /// The secret key used to sign JWT tokens. Must be at least 32 characters.
        /// </summary>
        public string Secret { get; init; } = string.Empty;

        /// <summary>
        /// The issuer claim for the JWT token.
        /// </summary>
        public string Issuer { get; init; } = string.Empty;

        /// <summary>
        /// The audience claim for the JWT token.
        /// </summary>
        public string Audience { get; init; } = string.Empty;

        /// <summary>
        /// The token expiration time in hours.
        /// </summary>
        public int ExpirationHours { get; init; } = 24;
    }
}
