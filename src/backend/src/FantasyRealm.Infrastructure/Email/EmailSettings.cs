namespace FantasyRealm.Infrastructure.Email
{
    /// <summary>
    /// Configuration settings for the SMTP email service.
    /// </summary>
    public class EmailSettings
    {
        /// <summary>
        /// The configuration section name in appsettings.json.
        /// </summary>
        public const string SectionName = "Email";

        /// <summary>
        /// Gets or sets the SMTP server hostname.
        /// </summary>
        public string Host { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the SMTP server port.
        /// </summary>
        public int Port { get; set; } = 587;

        /// <summary>
        /// Gets or sets whether to use SSL/TLS for the connection.
        /// </summary>
        public bool UseSsl { get; set; } = true;

        /// <summary>
        /// Gets or sets the SMTP authentication username.
        /// </summary>
        public string Username { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the SMTP authentication password.
        /// </summary>
        public string Password { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the sender email address.
        /// </summary>
        public string FromAddress { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the sender display name.
        /// </summary>
        public string FromName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the base URL for links in email templates.
        /// </summary>
        public string BaseUrl { get; set; } = string.Empty;
    }
}
