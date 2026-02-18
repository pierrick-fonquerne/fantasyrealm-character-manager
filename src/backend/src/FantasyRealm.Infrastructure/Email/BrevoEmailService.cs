using System.Net.Http.Json;
using FantasyRealm.Application.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FantasyRealm.Infrastructure.Email
{
    /// <summary>
    /// Brevo API-based implementation of the email service.
    /// </summary>
    public class BrevoEmailService : IEmailService
    {
        private readonly BrevoSettings _settings;
        private readonly HttpClient _httpClient;
        private readonly ILogger<BrevoEmailService> _logger;
        private const string BrevoApiUrl = "https://api.brevo.com/v3/smtp/email";

        /// <summary>
        /// Initializes a new instance of the <see cref="BrevoEmailService"/> class.
        /// </summary>
        /// <param name="settings">The Brevo configuration settings.</param>
        /// <param name="httpClient">The HTTP client for API calls.</param>
        /// <param name="logger">The logger instance.</param>
        public BrevoEmailService(
            IOptions<BrevoSettings> settings,
            HttpClient httpClient,
            ILogger<BrevoEmailService> logger)
        {
            _settings = settings.Value;
            _httpClient = httpClient;
            _logger = logger;

            _httpClient.DefaultRequestHeaders.Add("api-key", _settings.ApiKey);
        }

        /// <inheritdoc />
        public async Task SendWelcomeEmailAsync(string toEmail, string pseudo, CancellationToken cancellationToken = default)
        {
            var subject = "Welcome to FantasyRealm!";
            var body = EmailTemplates.GetWelcomeTemplate(pseudo, _settings.BaseUrl);
            await SendEmailAsync(toEmail, subject, body, cancellationToken);
        }

        /// <inheritdoc />
        public async Task SendPasswordResetEmailAsync(string toEmail, string pseudo, string resetToken, CancellationToken cancellationToken = default)
        {
            var subject = "Reset your FantasyRealm password";
            var body = EmailTemplates.GetPasswordResetTemplate(pseudo, resetToken, _settings.BaseUrl);
            await SendEmailAsync(toEmail, subject, body, cancellationToken);
        }

        /// <inheritdoc />
        public async Task SendTemporaryPasswordEmailAsync(string toEmail, string pseudo, string temporaryPassword, CancellationToken cancellationToken = default)
        {
            var subject = "Votre nouveau mot de passe FantasyRealm";
            var body = EmailTemplates.GetTemporaryPasswordTemplate(pseudo, temporaryPassword, _settings.BaseUrl);
            await SendEmailAsync(toEmail, subject, body, cancellationToken);
        }

        /// <inheritdoc />
        public async Task SendCharacterApprovedEmailAsync(string toEmail, string pseudo, string characterName, CancellationToken cancellationToken = default)
        {
            var subject = $"Your character {characterName} has been approved!";
            var body = EmailTemplates.GetCharacterApprovedTemplate(pseudo, characterName, _settings.BaseUrl);
            await SendEmailAsync(toEmail, subject, body, cancellationToken);
        }

        /// <inheritdoc />
        public async Task SendCharacterRejectedEmailAsync(string toEmail, string pseudo, string characterName, string reason, CancellationToken cancellationToken = default)
        {
            var subject = $"Your character {characterName} was not approved";
            var body = EmailTemplates.GetCharacterRejectedTemplate(pseudo, characterName, reason, _settings.BaseUrl);
            await SendEmailAsync(toEmail, subject, body, cancellationToken);
        }

        /// <inheritdoc />
        public async Task SendCommentApprovedEmailAsync(string toEmail, string pseudo, string characterName, CancellationToken cancellationToken = default)
        {
            var subject = "Your comment has been approved!";
            var body = EmailTemplates.GetCommentApprovedTemplate(pseudo, characterName, _settings.BaseUrl);
            await SendEmailAsync(toEmail, subject, body, cancellationToken);
        }

        /// <inheritdoc />
        public async Task SendCommentRejectedEmailAsync(string toEmail, string pseudo, string characterName, string reason, CancellationToken cancellationToken = default)
        {
            var subject = "Your comment was not approved";
            var body = EmailTemplates.GetCommentRejectedTemplate(pseudo, characterName, reason);
            await SendEmailAsync(toEmail, subject, body, cancellationToken);
        }

        /// <inheritdoc />
        public async Task SendAccountSuspendedEmailAsync(string toEmail, string pseudo, string reason, CancellationToken cancellationToken = default)
        {
            var subject = "Your FantasyRealm account has been suspended";
            var body = EmailTemplates.GetAccountSuspendedTemplate(pseudo, reason);
            await SendEmailAsync(toEmail, subject, body, cancellationToken);
        }

        /// <inheritdoc />
        public async Task SendAccountReactivatedEmailAsync(string toEmail, string pseudo, CancellationToken cancellationToken = default)
        {
            var subject = "Your FantasyRealm account has been reactivated";
            var body = EmailTemplates.GetAccountReactivatedTemplate(pseudo);
            await SendEmailAsync(toEmail, subject, body, cancellationToken);
        }

        /// <inheritdoc />
        public async Task SendAccountDeletedEmailAsync(string toEmail, string pseudo, CancellationToken cancellationToken = default)
        {
            var subject = "Your FantasyRealm account has been deleted";
            var body = EmailTemplates.GetAccountDeletedTemplate(pseudo);
            await SendEmailAsync(toEmail, subject, body, cancellationToken);
        }

        /// <inheritdoc />
        public async Task SendContactNotificationEmailAsync(string fromEmail, string pseudo, string message, CancellationToken cancellationToken = default)
        {
            var subject = $"[Contact] Message de {pseudo}";
            var body = EmailTemplates.GetContactNotificationTemplate(fromEmail, pseudo, message);
            await SendEmailAsync(_settings.ContactAddress, subject, body, cancellationToken);
        }

        private async Task SendEmailAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken)
        {
            var request = new BrevoEmailRequest
            {
                Sender = new BrevoEmailAddress { Email = _settings.FromAddress, Name = _settings.FromName },
                To = [new BrevoEmailAddress { Email = toEmail }],
                Subject = subject,
                HtmlContent = htmlBody
            };

            try
            {
                var response = await _httpClient.PostAsJsonAsync(BrevoApiUrl, request, cancellationToken);

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Email sent successfully to {Email} with subject '{Subject}'", toEmail, subject);
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                    _logger.LogError("Failed to send email to {Email}. Status: {Status}, Error: {Error}",
                        toEmail, response.StatusCode, errorContent);
                    throw new HttpRequestException($"Brevo API error: {response.StatusCode} - {errorContent}");
                }
            }
            catch (Exception ex) when (ex is not HttpRequestException)
            {
                _logger.LogError(ex, "Failed to send email to {Email} with subject '{Subject}'", toEmail, subject);
                throw;
            }
        }
    }
}
