namespace FantasyRealm.Infrastructure.Email
{
    /// <summary>
    /// Configuration settings for the Brevo email service.
    /// </summary>
    public class BrevoSettings
    {
        /// <summary>
        /// The configuration section name in appsettings.json.
        /// </summary>
        public const string SectionName = "Brevo";

        /// <summary>
        /// Gets or sets the Brevo API key.
        /// </summary>
        public string ApiKey { get; set; } = string.Empty;

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

        /// <summary>
        /// Gets or sets the email address for receiving contact form messages.
        /// </summary>
        public string ContactAddress { get; set; } = string.Empty;
    }
}
