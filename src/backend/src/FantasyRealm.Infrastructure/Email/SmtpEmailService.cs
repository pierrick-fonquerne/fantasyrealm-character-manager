using FantasyRealm.Application.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;

namespace FantasyRealm.Infrastructure.Email
{
    /// <summary>
    /// SMTP-based implementation of the email service using MailKit.
    /// </summary>
    public class SmtpEmailService : IEmailService
    {
        private readonly EmailSettings _settings;
        private readonly ILogger<SmtpEmailService> _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="SmtpEmailService"/> class.
        /// </summary>
        /// <param name="settings">The email configuration settings.</param>
        /// <param name="logger">The logger instance.</param>
        public SmtpEmailService(IOptions<EmailSettings> settings, ILogger<SmtpEmailService> logger)
        {
            _settings = settings.Value;
            _logger = logger;
        }

        /// <inheritdoc />
        public async Task SendWelcomeEmailAsync(string toEmail, string pseudo, CancellationToken cancellationToken = default)
        {
            var subject = "Welcome to FantasyRealm!";
            var body = EmailTemplates.GetWelcomeTemplate(pseudo);
            await SendEmailAsync(toEmail, subject, body, cancellationToken);
        }

        /// <inheritdoc />
        public async Task SendPasswordResetEmailAsync(string toEmail, string pseudo, string resetToken, CancellationToken cancellationToken = default)
        {
            var subject = "Reset your FantasyRealm password";
            var body = EmailTemplates.GetPasswordResetTemplate(pseudo, resetToken);
            await SendEmailAsync(toEmail, subject, body, cancellationToken);
        }

        /// <inheritdoc />
        public async Task SendCharacterApprovedEmailAsync(string toEmail, string pseudo, string characterName, CancellationToken cancellationToken = default)
        {
            var subject = $"Your character {characterName} has been approved!";
            var body = EmailTemplates.GetCharacterApprovedTemplate(pseudo, characterName);
            await SendEmailAsync(toEmail, subject, body, cancellationToken);
        }

        /// <inheritdoc />
        public async Task SendCharacterRejectedEmailAsync(string toEmail, string pseudo, string characterName, string reason, CancellationToken cancellationToken = default)
        {
            var subject = $"Your character {characterName} was not approved";
            var body = EmailTemplates.GetCharacterRejectedTemplate(pseudo, characterName, reason);
            await SendEmailAsync(toEmail, subject, body, cancellationToken);
        }

        /// <inheritdoc />
        public async Task SendCommentApprovedEmailAsync(string toEmail, string pseudo, string characterName, CancellationToken cancellationToken = default)
        {
            var subject = "Your comment has been approved!";
            var body = EmailTemplates.GetCommentApprovedTemplate(pseudo, characterName);
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

        private async Task SendEmailAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_settings.FromName, _settings.FromAddress));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = htmlBody
            };
            message.Body = bodyBuilder.ToMessageBody();

            try
            {
                using var client = new SmtpClient();

                var secureSocketOptions = _settings.UseSsl
                    ? SecureSocketOptions.StartTls
                    : SecureSocketOptions.None;

                await client.ConnectAsync(_settings.Host, _settings.Port, secureSocketOptions, cancellationToken);
                await client.AuthenticateAsync(_settings.Username, _settings.Password, cancellationToken);
                await client.SendAsync(message, cancellationToken);
                await client.DisconnectAsync(true, cancellationToken);

                _logger.LogInformation("Email sent successfully to {Email} with subject '{Subject}'", toEmail, subject);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email} with subject '{Subject}'", toEmail, subject);
                throw;
            }
        }
    }
}
