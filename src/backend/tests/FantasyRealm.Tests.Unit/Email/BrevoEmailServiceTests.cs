using System.Net;
using System.Text.Json;
using FantasyRealm.Infrastructure.Email;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Moq.Protected;

namespace FantasyRealm.Tests.Unit.Email
{
    public class BrevoEmailServiceTests
    {
        private readonly Mock<ILogger<BrevoEmailService>> _loggerMock;
        private readonly BrevoSettings _settings;
        private readonly Mock<HttpMessageHandler> _httpMessageHandlerMock;
        private readonly HttpClient _httpClient;

        public BrevoEmailServiceTests()
        {
            _loggerMock = new Mock<ILogger<BrevoEmailService>>();
            _settings = new BrevoSettings
            {
                ApiKey = "test-api-key",
                FromAddress = "noreply@fantasy-realm.com",
                FromName = "FantasyRealm Online",
                BaseUrl = "https://test.fantasy-realm.com"
            };
            _httpMessageHandlerMock = new Mock<HttpMessageHandler>();
            _httpClient = new HttpClient(_httpMessageHandlerMock.Object);
        }

        private BrevoEmailService CreateService()
        {
            return new BrevoEmailService(
                Options.Create(_settings),
                _httpClient,
                _loggerMock.Object);
        }

        private void SetupHttpResponse(HttpStatusCode statusCode, string content = "{}")
        {
            _httpMessageHandlerMock
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = statusCode,
                    Content = new StringContent(content)
                });
        }

        [Fact]
        public async Task SendWelcomeEmailAsync_SendsCorrectRequest()
        {
            SetupHttpResponse(HttpStatusCode.Created);
            var service = CreateService();
            HttpRequestMessage? capturedRequest = null;

            _httpMessageHandlerMock
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .Callback<HttpRequestMessage, CancellationToken>((req, _) => capturedRequest = req)
                .ReturnsAsync(new HttpResponseMessage { StatusCode = HttpStatusCode.Created });

            await service.SendWelcomeEmailAsync("test@example.com", "TestPlayer");

            Assert.NotNull(capturedRequest);
            Assert.Equal(HttpMethod.Post, capturedRequest.Method);
            Assert.Equal("https://api.brevo.com/v3/smtp/email", capturedRequest.RequestUri?.ToString());
            Assert.True(capturedRequest.Headers.Contains("api-key"));
        }

        [Fact]
        public async Task SendWelcomeEmailAsync_IncludesCorrectRecipient()
        {
            SetupHttpResponse(HttpStatusCode.Created);
            var service = CreateService();
            string? capturedBody = null;

            _httpMessageHandlerMock
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .Callback<HttpRequestMessage, CancellationToken>(async (req, _) =>
                {
                    capturedBody = await req.Content!.ReadAsStringAsync();
                })
                .ReturnsAsync(new HttpResponseMessage { StatusCode = HttpStatusCode.Created });

            await service.SendWelcomeEmailAsync("test@example.com", "TestPlayer");

            Assert.NotNull(capturedBody);
            Assert.Contains("test@example.com", capturedBody);
            Assert.Contains("Welcome to FantasyRealm", capturedBody);
        }

        [Fact]
        public async Task SendTemporaryPasswordEmailAsync_IncludesPassword()
        {
            SetupHttpResponse(HttpStatusCode.Created);
            var service = CreateService();
            string? capturedBody = null;

            _httpMessageHandlerMock
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .Callback<HttpRequestMessage, CancellationToken>(async (req, _) =>
                {
                    capturedBody = await req.Content!.ReadAsStringAsync();
                })
                .ReturnsAsync(new HttpResponseMessage { StatusCode = HttpStatusCode.Created });

            await service.SendTemporaryPasswordEmailAsync("test@example.com", "TestPlayer", "TempPass@123!");

            Assert.NotNull(capturedBody);
            Assert.Contains("TempPass@123!", capturedBody);
        }

        [Fact]
        public async Task SendPasswordResetEmailAsync_IncludesToken()
        {
            SetupHttpResponse(HttpStatusCode.Created);
            var service = CreateService();
            string? capturedBody = null;

            _httpMessageHandlerMock
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .Callback<HttpRequestMessage, CancellationToken>(async (req, _) =>
                {
                    capturedBody = await req.Content!.ReadAsStringAsync();
                })
                .ReturnsAsync(new HttpResponseMessage { StatusCode = HttpStatusCode.Created });

            await service.SendPasswordResetEmailAsync("test@example.com", "TestPlayer", "reset-token-123");

            Assert.NotNull(capturedBody);
            Assert.Contains("reset-token-123", capturedBody);
        }

        [Fact]
        public async Task SendCharacterApprovedEmailAsync_IncludesCharacterName()
        {
            SetupHttpResponse(HttpStatusCode.Created);
            var service = CreateService();
            string? capturedBody = null;

            _httpMessageHandlerMock
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .Callback<HttpRequestMessage, CancellationToken>(async (req, _) =>
                {
                    capturedBody = await req.Content!.ReadAsStringAsync();
                })
                .ReturnsAsync(new HttpResponseMessage { StatusCode = HttpStatusCode.Created });

            await service.SendCharacterApprovedEmailAsync("test@example.com", "TestPlayer", "Thorin");

            Assert.NotNull(capturedBody);
            Assert.Contains("Thorin", capturedBody);
        }

        [Fact]
        public async Task SendCharacterRejectedEmailAsync_IncludesReason()
        {
            SetupHttpResponse(HttpStatusCode.Created);
            var service = CreateService();
            string? capturedBody = null;

            _httpMessageHandlerMock
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .Callback<HttpRequestMessage, CancellationToken>(async (req, _) =>
                {
                    capturedBody = await req.Content!.ReadAsStringAsync();
                })
                .ReturnsAsync(new HttpResponseMessage { StatusCode = HttpStatusCode.Created });

            await service.SendCharacterRejectedEmailAsync("test@example.com", "TestPlayer", "Thorin", "Inappropriate content");

            Assert.NotNull(capturedBody);
            Assert.Contains("Thorin", capturedBody);
            Assert.Contains("Inappropriate content", capturedBody);
        }

        [Fact]
        public async Task SendEmailAsync_ThrowsOnApiError()
        {
            SetupHttpResponse(HttpStatusCode.BadRequest, "{\"message\":\"Invalid API key\"}");
            var service = CreateService();

            await Assert.ThrowsAsync<HttpRequestException>(() =>
                service.SendWelcomeEmailAsync("test@example.com", "TestPlayer"));
        }

        [Fact]
        public async Task SendEmailAsync_LogsSuccessOnSuccess()
        {
            SetupHttpResponse(HttpStatusCode.Created);
            var service = CreateService();

            await service.SendWelcomeEmailAsync("test@example.com", "TestPlayer");

            _loggerMock.Verify(
                x => x.Log(
                    LogLevel.Information,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Email sent successfully")),
                    It.IsAny<Exception>(),
                    It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
                Times.Once);
        }

        [Fact]
        public async Task SendEmailAsync_LogsErrorOnFailure()
        {
            SetupHttpResponse(HttpStatusCode.InternalServerError, "{\"message\":\"Server error\"}");
            var service = CreateService();

            await Assert.ThrowsAsync<HttpRequestException>(() =>
                service.SendWelcomeEmailAsync("test@example.com", "TestPlayer"));

            _loggerMock.Verify(
                x => x.Log(
                    LogLevel.Error,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Failed to send email")),
                    It.IsAny<Exception>(),
                    It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
                Times.Once);
        }

        [Fact]
        public async Task SendCommentApprovedEmailAsync_SendsCorrectly()
        {
            SetupHttpResponse(HttpStatusCode.Created);
            var service = CreateService();

            await service.SendCommentApprovedEmailAsync("test@example.com", "TestPlayer", "Thorin");

            _httpMessageHandlerMock
                .Protected()
                .Verify(
                    "SendAsync",
                    Times.Once(),
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>());
        }

        [Fact]
        public async Task SendCommentRejectedEmailAsync_IncludesReason()
        {
            SetupHttpResponse(HttpStatusCode.Created);
            var service = CreateService();
            string? capturedBody = null;

            _httpMessageHandlerMock
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .Callback<HttpRequestMessage, CancellationToken>(async (req, _) =>
                {
                    capturedBody = await req.Content!.ReadAsStringAsync();
                })
                .ReturnsAsync(new HttpResponseMessage { StatusCode = HttpStatusCode.Created });

            await service.SendCommentRejectedEmailAsync("test@example.com", "TestPlayer", "Thorin", "Offensive language");

            Assert.NotNull(capturedBody);
            Assert.Contains("Offensive language", capturedBody);
        }

        [Fact]
        public async Task SendAccountSuspendedEmailAsync_IncludesReason()
        {
            SetupHttpResponse(HttpStatusCode.Created);
            var service = CreateService();
            string? capturedBody = null;

            _httpMessageHandlerMock
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .Callback<HttpRequestMessage, CancellationToken>(async (req, _) =>
                {
                    capturedBody = await req.Content!.ReadAsStringAsync();
                })
                .ReturnsAsync(new HttpResponseMessage { StatusCode = HttpStatusCode.Created });

            await service.SendAccountSuspendedEmailAsync("test@example.com", "TestPlayer", "Multiple violations");

            Assert.NotNull(capturedBody);
            Assert.Contains("Multiple violations", capturedBody);
        }
    }
}
