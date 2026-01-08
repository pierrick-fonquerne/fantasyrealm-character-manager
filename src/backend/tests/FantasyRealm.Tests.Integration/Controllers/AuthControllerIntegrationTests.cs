using System.Net;
using System.Net.Http.Json;
using FantasyRealm.Application.DTOs;
using FluentAssertions;
using Moq;

namespace FantasyRealm.Tests.Integration.Controllers
{
    /// <summary>
    /// Integration tests for AuthController endpoints using Testcontainers.
    /// </summary>
    [Trait("Category", "Integration")]
    [Trait("Category", "Auth")]
    public class AuthControllerIntegrationTests : IClassFixture<FantasyRealmWebApplicationFactory>
    {
        private readonly HttpClient _client;
        private readonly FantasyRealmWebApplicationFactory _factory;

        public AuthControllerIntegrationTests(FantasyRealmWebApplicationFactory factory)
        {
            _factory = factory;
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task Register_WithValidData_ReturnsCreatedAndUserResponse()
        {
            // Arrange
            var request = new
            {
                Email = $"test_{Guid.NewGuid():N}@example.com",
                Pseudo = $"User{Guid.NewGuid():N}"[..20],
                Password = "MySecure@Pass123",
                ConfirmPassword = "MySecure@Pass123"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/register", request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Created);

            var result = await response.Content.ReadFromJsonAsync<RegisterResponse>();
            result.Should().NotBeNull();
            result!.Email.Should().Be(request.Email.ToLowerInvariant());
            result.Pseudo.Should().Be(request.Pseudo);
            result.Role.Should().Be("User");
            result.Id.Should().BeGreaterThan(0);
        }

        [Fact]
        public async Task Register_WithValidData_SendsWelcomeEmail()
        {
            // Arrange
            _factory.EmailServiceMock.Reset();
            var request = new
            {
                Email = $"email_{Guid.NewGuid():N}@example.com",
                Pseudo = $"User{Guid.NewGuid():N}"[..20],
                Password = "MySecure@Pass123",
                ConfirmPassword = "MySecure@Pass123"
            };

            // Act
            await _client.PostAsJsonAsync("/api/auth/register", request);

            // Assert - Wait for fire-and-forget email task
            await Task.Delay(500);
            _factory.EmailServiceMock.Verify(
                e => e.SendWelcomeEmailAsync(
                    request.Email.ToLowerInvariant(),
                    request.Pseudo,
                    It.IsAny<CancellationToken>()),
                Times.Once);
        }

        [Fact]
        public async Task Register_WithExistingEmail_ReturnsConflict()
        {
            // Arrange
            var email = $"duplicate_{Guid.NewGuid():N}@example.com";
            var firstRequest = new
            {
                Email = email,
                Pseudo = $"First{Guid.NewGuid():N}"[..20],
                Password = "MySecure@Pass123",
                ConfirmPassword = "MySecure@Pass123"
            };
            await _client.PostAsJsonAsync("/api/auth/register", firstRequest);

            var secondRequest = new
            {
                Email = email,
                Pseudo = $"Second{Guid.NewGuid():N}"[..20],
                Password = "MySecure@Pass123",
                ConfirmPassword = "MySecure@Pass123"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/register", secondRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Conflict);
            var error = await response.Content.ReadFromJsonAsync<ErrorResponse>();
            error?.Message.Should().Contain("email");
        }

        [Fact]
        public async Task Register_WithExistingPseudo_ReturnsConflict()
        {
            // Arrange
            var pseudo = $"Dup{Guid.NewGuid():N}"[..20];
            var firstRequest = new
            {
                Email = $"first_{Guid.NewGuid():N}@example.com",
                Pseudo = pseudo,
                Password = "MySecure@Pass123",
                ConfirmPassword = "MySecure@Pass123"
            };
            await _client.PostAsJsonAsync("/api/auth/register", firstRequest);

            var secondRequest = new
            {
                Email = $"second_{Guid.NewGuid():N}@example.com",
                Pseudo = pseudo,
                Password = "MySecure@Pass123",
                ConfirmPassword = "MySecure@Pass123"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/register", secondRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Conflict);
            var error = await response.Content.ReadFromJsonAsync<ErrorResponse>();
            error?.Message.Should().Contain("pseudo");
        }

        [Fact]
        public async Task Register_WithMismatchedPasswords_ReturnsBadRequest()
        {
            // Arrange
            var request = new
            {
                Email = $"mismatch_{Guid.NewGuid():N}@example.com",
                Pseudo = $"User{Guid.NewGuid():N}"[..20],
                Password = "MySecure@Pass123",
                ConfirmPassword = "DifferentPass@123"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/register", request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            var error = await response.Content.ReadFromJsonAsync<ErrorResponse>();
            error?.Message.Should().Contain("correspondent");
        }

        [Fact]
        public async Task Register_WithWeakPassword_ReturnsBadRequest()
        {
            // Arrange
            var request = new
            {
                Email = $"weak_{Guid.NewGuid():N}@example.com",
                Pseudo = $"User{Guid.NewGuid():N}"[..20],
                Password = "weak",
                ConfirmPassword = "weak"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/register", request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Theory]
        [InlineData("", "TestUser", "MySecure@Pass123", "MySecure@Pass123")]
        [InlineData("invalid-email", "TestUser", "MySecure@Pass123", "MySecure@Pass123")]
        [InlineData("test@example.com", "", "MySecure@Pass123", "MySecure@Pass123")]
        [InlineData("test@example.com", "ab", "MySecure@Pass123", "MySecure@Pass123")]
        public async Task Register_WithInvalidData_ReturnsBadRequest(
            string email, string pseudo, string password, string confirmPassword)
        {
            // Arrange
            var request = new { Email = email, Pseudo = pseudo, Password = password, ConfirmPassword = confirmPassword };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/register", request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task Register_NormalizesEmailToLowercase()
        {
            // Arrange
            var email = $"UPPER_{Guid.NewGuid():N}@EXAMPLE.COM";
            var request = new
            {
                Email = email,
                Pseudo = $"User{Guid.NewGuid():N}"[..20],
                Password = "MySecure@Pass123",
                ConfirmPassword = "MySecure@Pass123"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/register", request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Created);
            var result = await response.Content.ReadFromJsonAsync<RegisterResponse>();
            result!.Email.Should().Be(email.ToLowerInvariant());
        }

        private record ErrorResponse(string Message);
    }
}
