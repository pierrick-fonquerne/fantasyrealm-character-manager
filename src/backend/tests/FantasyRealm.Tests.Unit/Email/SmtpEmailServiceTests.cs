using FantasyRealm.Infrastructure.Email;
using MailKit;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using Moq;

namespace FantasyRealm.Tests.Unit.Email
{
    public class SmtpEmailServiceTests
    {
        private readonly Mock<ISmtpClient> _mockSmtpClient;
        private readonly Mock<ISmtpClientFactory> _mockSmtpClientFactory;
        private readonly Mock<ILogger<SmtpEmailService>> _mockLogger;
        private readonly EmailSettings _emailSettings;
        private readonly SmtpEmailService _emailService;

        public SmtpEmailServiceTests()
        {
            _mockSmtpClient = new Mock<ISmtpClient>();
            _mockSmtpClientFactory = new Mock<ISmtpClientFactory>();
            _mockLogger = new Mock<ILogger<SmtpEmailService>>();

            _emailSettings = new EmailSettings
            {
                Host = "smtp.test.com",
                Port = 587,
                UseSsl = true,
                Username = "test@test.com",
                Password = "password",
                FromAddress = "noreply@test.com",
                FromName = "Test App"
            };

            _mockSmtpClientFactory
                .Setup(f => f.Create())
                .Returns(_mockSmtpClient.Object);

            var options = Options.Create(_emailSettings);
            _emailService = new SmtpEmailService(options, _mockSmtpClientFactory.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task SendWelcomeEmailAsync_ConnectsWithCorrectSettings()
        {
            await _emailService.SendWelcomeEmailAsync("user@test.com", "TestUser");

            _mockSmtpClient.Verify(c => c.ConnectAsync(
                _emailSettings.Host,
                _emailSettings.Port,
                SecureSocketOptions.StartTls,
                It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task SendWelcomeEmailAsync_AuthenticatesWithCredentials()
        {
            await _emailService.SendWelcomeEmailAsync("user@test.com", "TestUser");

            _mockSmtpClient.Verify(c => c.AuthenticateAsync(
                _emailSettings.Username,
                _emailSettings.Password,
                It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task SendWelcomeEmailAsync_SendsEmail()
        {
            await _emailService.SendWelcomeEmailAsync("user@test.com", "TestUser");

            _mockSmtpClient.Verify(c => c.SendAsync(
                It.Is<MimeMessage>(m =>
                    m.To.Mailboxes.Any(mb => mb.Address == "user@test.com") &&
                    m.Subject == "Welcome to FantasyRealm!"),
                It.IsAny<CancellationToken>(),
                It.IsAny<ITransferProgress>()), Times.Once);
        }

        [Fact]
        public async Task SendWelcomeEmailAsync_DisconnectsAfterSending()
        {
            await _emailService.SendWelcomeEmailAsync("user@test.com", "TestUser");

            _mockSmtpClient.Verify(c => c.DisconnectAsync(
                true,
                It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task SendPasswordResetEmailAsync_SendsWithCorrectSubject()
        {
            await _emailService.SendPasswordResetEmailAsync("user@test.com", "TestUser", "reset-token");

            _mockSmtpClient.Verify(c => c.SendAsync(
                It.Is<MimeMessage>(m => m.Subject == "Reset your FantasyRealm password"),
                It.IsAny<CancellationToken>(),
                It.IsAny<ITransferProgress>()), Times.Once);
        }

        [Fact]
        public async Task SendCharacterApprovedEmailAsync_SendsWithCharacterNameInSubject()
        {
            var characterName = "Thorin";

            await _emailService.SendCharacterApprovedEmailAsync("user@test.com", "TestUser", characterName);

            _mockSmtpClient.Verify(c => c.SendAsync(
                It.Is<MimeMessage>(m => m.Subject.Contains(characterName)),
                It.IsAny<CancellationToken>(),
                It.IsAny<ITransferProgress>()), Times.Once);
        }

        [Fact]
        public async Task SendCharacterRejectedEmailAsync_SendsWithCharacterNameInSubject()
        {
            var characterName = "Thorin";

            await _emailService.SendCharacterRejectedEmailAsync("user@test.com", "TestUser", characterName, "Reason");

            _mockSmtpClient.Verify(c => c.SendAsync(
                It.Is<MimeMessage>(m => m.Subject.Contains(characterName)),
                It.IsAny<CancellationToken>(),
                It.IsAny<ITransferProgress>()), Times.Once);
        }

        [Fact]
        public async Task SendCommentApprovedEmailAsync_SendsEmail()
        {
            await _emailService.SendCommentApprovedEmailAsync("user@test.com", "TestUser", "Thorin");

            _mockSmtpClient.Verify(c => c.SendAsync(
                It.Is<MimeMessage>(m => m.Subject == "Your comment has been approved!"),
                It.IsAny<CancellationToken>(),
                It.IsAny<ITransferProgress>()), Times.Once);
        }

        [Fact]
        public async Task SendCommentRejectedEmailAsync_SendsEmail()
        {
            await _emailService.SendCommentRejectedEmailAsync("user@test.com", "TestUser", "Thorin", "Reason");

            _mockSmtpClient.Verify(c => c.SendAsync(
                It.Is<MimeMessage>(m => m.Subject == "Your comment was not approved"),
                It.IsAny<CancellationToken>(),
                It.IsAny<ITransferProgress>()), Times.Once);
        }

        [Fact]
        public async Task SendAccountSuspendedEmailAsync_SendsEmail()
        {
            await _emailService.SendAccountSuspendedEmailAsync("user@test.com", "TestUser", "Violation");

            _mockSmtpClient.Verify(c => c.SendAsync(
                It.Is<MimeMessage>(m => m.Subject == "Your FantasyRealm account has been suspended"),
                It.IsAny<CancellationToken>(),
                It.IsAny<ITransferProgress>()), Times.Once);
        }

        [Fact]
        public async Task SendEmailAsync_WhenSmtpFails_ThrowsException()
        {
            _mockSmtpClient
                .Setup(c => c.ConnectAsync(
                    It.IsAny<string>(),
                    It.IsAny<int>(),
                    It.IsAny<SecureSocketOptions>(),
                    It.IsAny<CancellationToken>()))
                .ThrowsAsync(new InvalidOperationException("Connection failed"));

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                _emailService.SendWelcomeEmailAsync("user@test.com", "TestUser"));
        }

        [Fact]
        public async Task SendEmailAsync_WithSslDisabled_UsesNoSecurity()
        {
            var settingsNoSsl = new EmailSettings
            {
                Host = "smtp.test.com",
                Port = 25,
                UseSsl = false,
                Username = "test@test.com",
                Password = "password",
                FromAddress = "noreply@test.com",
                FromName = "Test App"
            };

            var options = Options.Create(settingsNoSsl);
            var service = new SmtpEmailService(options, _mockSmtpClientFactory.Object, _mockLogger.Object);

            await service.SendWelcomeEmailAsync("user@test.com", "TestUser");

            _mockSmtpClient.Verify(c => c.ConnectAsync(
                It.IsAny<string>(),
                It.IsAny<int>(),
                SecureSocketOptions.None,
                It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task SendEmailAsync_SetsCorrectFromAddress()
        {
            await _emailService.SendWelcomeEmailAsync("user@test.com", "TestUser");

            _mockSmtpClient.Verify(c => c.SendAsync(
                It.Is<MimeMessage>(m =>
                    m.From.Mailboxes.Any(mb =>
                        mb.Address == _emailSettings.FromAddress &&
                        mb.Name == _emailSettings.FromName)),
                It.IsAny<CancellationToken>(),
                It.IsAny<ITransferProgress>()), Times.Once);
        }
    }
}
