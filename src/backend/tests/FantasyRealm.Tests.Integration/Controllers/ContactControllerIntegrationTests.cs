using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Moq;

namespace FantasyRealm.Tests.Integration.Controllers
{
    /// <summary>
    /// Integration tests for ContactController endpoints using Testcontainers.
    /// </summary>
    [Trait("Category", "Integration")]
    [Trait("Category", "Contact")]
    public class ContactControllerIntegrationTests(FantasyRealmWebApplicationFactory factory) : IClassFixture<FantasyRealmWebApplicationFactory>
    {
        private readonly HttpClient _client = factory.CreateClient();
        private readonly FantasyRealmWebApplicationFactory _factory = factory;

        private async Task<string> RegisterUserAsync()
        {
            var pseudo = $"Ctc{Guid.NewGuid():N}"[..20];
            await _client.PostAsJsonAsync("/api/auth/register", new
            {
                Email = $"contact_{Guid.NewGuid():N}@example.com",
                Pseudo = pseudo,
                Password = "MySecure@Pass123",
                ConfirmPassword = "MySecure@Pass123"
            });
            return pseudo;
        }

        [Fact]
        public async Task SendMessage_WithValidData_ReturnsOk()
        {
            // Arrange
            var pseudo = await RegisterUserAsync();
            var request = new
            {
                Email = "visitor@example.com",
                Pseudo = pseudo,
                Message = "Bonjour, je souhaite en savoir plus sur le jeu FantasyRealm Online."
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/contact", request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<MessageResponse>();
            result?.Message.Should().Contain("envoyé");
        }

        [Fact]
        public async Task SendMessage_WithUnknownPseudo_ReturnsBadRequest()
        {
            // Arrange
            var request = new
            {
                Email = "visitor@example.com",
                Pseudo = $"Unknown{Guid.NewGuid():N}"[..20],
                Message = "Bonjour, je souhaite en savoir plus sur le jeu FantasyRealm Online."
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/contact", request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            var error = await response.Content.ReadFromJsonAsync<ErrorResponse>();
            error?.Message.Should().Contain("pseudo");
        }

        [Fact]
        public async Task SendMessage_WithInvalidEmail_ReturnsBadRequest()
        {
            // Arrange
            var request = new
            {
                Email = "invalid-email",
                Pseudo = "Visitor",
                Message = "Bonjour, je souhaite en savoir plus sur le jeu FantasyRealm Online."
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/contact", request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task SendMessage_WithShortMessage_ReturnsBadRequest()
        {
            // Arrange
            var request = new
            {
                Email = "visitor@example.com",
                Pseudo = "Visitor",
                Message = "Trop court"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/contact", request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Theory]
        [InlineData("", "Visitor", "Bonjour, je souhaite en savoir plus sur le jeu.")]
        [InlineData("visitor@example.com", "", "Bonjour, je souhaite en savoir plus sur le jeu.")]
        [InlineData("visitor@example.com", "Visitor", "")]
        public async Task SendMessage_WithEmptyFields_ReturnsBadRequest(string email, string pseudo, string message)
        {
            // Arrange
            var request = new { Email = email, Pseudo = pseudo, Message = message };

            // Act
            var response = await _client.PostAsJsonAsync("/api/contact", request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task SendMessage_WithValidData_SendsNotificationEmail()
        {
            // Arrange
            var pseudo = await RegisterUserAsync();
            _factory.EmailServiceMock.Reset();
            _factory.EmailServiceMock.Setup(e => e.SendContactNotificationEmailAsync(
                    It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);

            var request = new
            {
                Email = "notify@example.com",
                Pseudo = pseudo,
                Message = "Ce message doit déclencher un email de notification au support."
            };

            // Act
            await _client.PostAsJsonAsync("/api/contact", request);

            // Assert
            _factory.EmailServiceMock.Verify(
                e => e.SendContactNotificationEmailAsync(
                    "notify@example.com",
                    pseudo,
                    "Ce message doit déclencher un email de notification au support.",
                    It.IsAny<CancellationToken>()),
                Times.Once);
        }

        private record MessageResponse(string Message);
        private record ErrorResponse(string Message);
    }
}
