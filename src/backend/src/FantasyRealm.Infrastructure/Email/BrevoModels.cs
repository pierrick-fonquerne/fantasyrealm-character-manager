using System.Text.Json.Serialization;

namespace FantasyRealm.Infrastructure.Email
{
    /// <summary>
    /// Represents an email request payload for the Brevo API.
    /// </summary>
    internal sealed class BrevoEmailRequest
    {
        [JsonPropertyName("sender")]
        public required BrevoEmailAddress Sender { get; set; }

        [JsonPropertyName("to")]
        public required BrevoEmailAddress[] To { get; set; }

        [JsonPropertyName("subject")]
        public required string Subject { get; set; }

        [JsonPropertyName("htmlContent")]
        public required string HtmlContent { get; set; }
    }

    /// <summary>
    /// Represents an email address for the Brevo API.
    /// </summary>
    internal sealed class BrevoEmailAddress
    {
        [JsonPropertyName("email")]
        public required string Email { get; set; }

        [JsonPropertyName("name")]
        public string? Name { get; set; }
    }
}
