using FantasyRealm.Infrastructure.Email;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Xunit.Abstractions;

namespace FantasyRealm.Tests.Integration.Email
{
    /// <summary>
    /// Integration tests for SmtpEmailService that send real emails.
    /// These tests are skipped in CI and should be run manually.
    /// </summary>
    [Trait("Category", "Integration")]
    [Trait("Category", "Email")]
    public class SmtpEmailServiceIntegrationTests
    {
        private const string TestRecipient = "contact@fantasy-realm.com";

        private readonly IConfiguration _configuration;
        private readonly EmailSettings _emailSettings;
        private readonly bool _isConfigured;
        private readonly ITestOutputHelper _output;

        public SmtpEmailServiceIntegrationTests(ITestOutputHelper output)
        {
            _output = output;

            _configuration = new ConfigurationBuilder()
                .AddJsonFile("appsettings.json", optional: true)
                .AddUserSecrets<SmtpEmailServiceIntegrationTests>()
                .AddEnvironmentVariables()
                .Build();

            _emailSettings = new EmailSettings();
            _configuration.GetSection("Email").Bind(_emailSettings);

            _isConfigured = !string.IsNullOrEmpty(_emailSettings.Host) &&
                            !string.IsNullOrEmpty(_emailSettings.Password) &&
                            !string.IsNullOrEmpty(_emailSettings.FromAddress);

            _output.WriteLine($"Email configured: {_isConfigured}");
            _output.WriteLine($"Host: {_emailSettings.Host}");
            _output.WriteLine($"From: {_emailSettings.FromAddress}");
        }

        [SkippableFact]
        public async Task SendWelcomeEmailAsync_SendsRealEmail()
        {
            Skip.If(!_isConfigured, "Email settings not configured. Set Email:Password in user-secrets.");

            var service = CreateEmailService();

            await service.SendWelcomeEmailAsync(TestRecipient, "IntegrationTestUser");

            // If no exception is thrown, the email was sent successfully.
            // Check contact@fantasy-realm.com mailbox to verify.
            Assert.True(true);
        }

        [SkippableFact]
        public async Task SendPasswordResetEmailAsync_SendsRealEmail()
        {
            Skip.If(!_isConfigured, "Email settings not configured. Set Email:Password in user-secrets.");

            var service = CreateEmailService();

            await service.SendPasswordResetEmailAsync(
                TestRecipient,
                "IntegrationTestUser",
                "test-reset-token-12345");

            Assert.True(true);
        }

        [SkippableFact]
        public async Task SendCharacterApprovedEmailAsync_SendsRealEmail()
        {
            Skip.If(!_isConfigured, "Email settings not configured. Set Email:Password in user-secrets.");

            var service = CreateEmailService();

            await service.SendCharacterApprovedEmailAsync(
                TestRecipient,
                "IntegrationTestUser",
                "Thorin the Brave");

            Assert.True(true);
        }

        [SkippableFact]
        public async Task SendCharacterRejectedEmailAsync_SendsRealEmail()
        {
            Skip.If(!_isConfigured, "Email settings not configured. Set Email:Password in user-secrets.");

            var service = CreateEmailService();

            await service.SendCharacterRejectedEmailAsync(
                TestRecipient,
                "IntegrationTestUser",
                "TestCharacter",
                "This is an integration test - character name contains test data.");

            Assert.True(true);
        }

        [SkippableFact]
        public async Task SendCommentApprovedEmailAsync_SendsRealEmail()
        {
            Skip.If(!_isConfigured, "Email settings not configured. Set Email:Password in user-secrets.");

            var service = CreateEmailService();

            await service.SendCommentApprovedEmailAsync(
                TestRecipient,
                "IntegrationTestUser",
                "Elara the Wise");

            Assert.True(true);
        }

        [SkippableFact]
        public async Task SendCommentRejectedEmailAsync_SendsRealEmail()
        {
            Skip.If(!_isConfigured, "Email settings not configured. Set Email:Password in user-secrets.");

            var service = CreateEmailService();

            await service.SendCommentRejectedEmailAsync(
                TestRecipient,
                "IntegrationTestUser",
                "TestCharacter",
                "This is an integration test - comment was flagged for testing purposes.");

            Assert.True(true);
        }

        [SkippableFact]
        public async Task SendAccountSuspendedEmailAsync_SendsRealEmail()
        {
            Skip.If(!_isConfigured, "Email settings not configured. Set Email:Password in user-secrets.");

            var service = CreateEmailService();

            await service.SendAccountSuspendedEmailAsync(
                TestRecipient,
                "IntegrationTestUser",
                "This is an integration test - no actual suspension occurred.");

            Assert.True(true);
        }

        private SmtpEmailService CreateEmailService()
        {
            var options = Options.Create(_emailSettings);
            var factory = new SmtpClientFactory();
            var logger = LoggerFactory.Create(builder => builder.AddConsole()).CreateLogger<SmtpEmailService>();

            return new SmtpEmailService(options, factory, logger);
        }
    }
}
