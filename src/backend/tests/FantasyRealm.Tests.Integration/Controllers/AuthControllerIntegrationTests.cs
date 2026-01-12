using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Json;
using FantasyRealm.Application.DTOs;
using FantasyRealm.Domain.Entities;
using FantasyRealm.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
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

        #region Login Tests

        [Fact]
        public async Task Login_WithValidCredentials_ReturnsOkAndToken()
        {
            // Arrange - Register a user first
            var email = $"login_{Guid.NewGuid():N}@example.com";
            var password = "MySecure@Pass123";
            var pseudo = $"Login{Guid.NewGuid():N}"[..20];

            await _client.PostAsJsonAsync("/api/auth/register", new
            {
                Email = email,
                Pseudo = pseudo,
                Password = password,
                ConfirmPassword = password
            });

            var loginRequest = new { Email = email, Password = password };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var result = await response.Content.ReadFromJsonAsync<LoginResponse>();
            result.Should().NotBeNull();
            result!.Token.Should().NotBeNullOrEmpty();
            result.ExpiresAt.Should().BeAfter(DateTime.UtcNow);
            result.User.Email.Should().Be(email.ToLowerInvariant());
            result.User.Pseudo.Should().Be(pseudo);
            result.User.Role.Should().Be("User");
            result.MustChangePassword.Should().BeFalse();
        }

        [Fact]
        public async Task Login_WithValidCredentials_ReturnsValidJwtToken()
        {
            // Arrange
            var email = $"jwt_{Guid.NewGuid():N}@example.com";
            var password = "MySecure@Pass123";
            var pseudo = $"Jwt{Guid.NewGuid():N}"[..20];

            var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", new
            {
                Email = email,
                Pseudo = pseudo,
                Password = password,
                ConfirmPassword = password
            });
            var registeredUser = await registerResponse.Content.ReadFromJsonAsync<RegisterResponse>();

            var loginRequest = new { Email = email, Password = password };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);
            var result = await response.Content.ReadFromJsonAsync<LoginResponse>();

            // Assert - Decode and validate JWT claims
            var handler = new JwtSecurityTokenHandler();
            var token = handler.ReadJwtToken(result!.Token);

            token.Claims.Should().Contain(c => c.Type == "sub" && c.Value == registeredUser!.Id.ToString());
            token.Claims.Should().Contain(c => c.Type == "email" && c.Value == email.ToLowerInvariant());
            token.Claims.Should().Contain(c => c.Type == "pseudo" && c.Value == pseudo);
            token.Claims.Should().Contain(c => c.Type.Contains("role") && c.Value == "User");
        }

        [Fact]
        public async Task Login_WithNonExistentEmail_ReturnsUnauthorized()
        {
            // Arrange
            var loginRequest = new
            {
                Email = $"nonexistent_{Guid.NewGuid():N}@example.com",
                Password = "SomePassword@123"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
            var error = await response.Content.ReadFromJsonAsync<ErrorResponse>();
            error?.Message.Should().Be("Identifiants incorrects.");
        }

        [Fact]
        public async Task Login_WithWrongPassword_ReturnsUnauthorized()
        {
            // Arrange - Register a user first
            var email = $"wrongpwd_{Guid.NewGuid():N}@example.com";

            await _client.PostAsJsonAsync("/api/auth/register", new
            {
                Email = email,
                Pseudo = $"Wrong{Guid.NewGuid():N}"[..20],
                Password = "MySecure@Pass123",
                ConfirmPassword = "MySecure@Pass123"
            });

            var loginRequest = new { Email = email, Password = "WrongPassword@123" };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
            var error = await response.Content.ReadFromJsonAsync<ErrorResponse>();
            error?.Message.Should().Be("Identifiants incorrects.");
        }

        [Fact]
        public async Task Login_WithSuspendedAccount_ReturnsForbidden()
        {
            // Arrange - Register a user first, then suspend them
            var email = $"tosuspend_{Guid.NewGuid():N}@example.com";
            var password = "MySecure@Pass123";

            await _client.PostAsJsonAsync("/api/auth/register", new
            {
                Email = email,
                Pseudo = $"ToSusp{Guid.NewGuid():N}"[..20],
                Password = password,
                ConfirmPassword = password
            });

            // Suspend the user directly in DB
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<FantasyRealmDbContext>();
            var user = await context.Users.FirstAsync(u => u.Email == email.ToLowerInvariant());
            user.IsSuspended = true;
            await context.SaveChangesAsync();

            var loginRequest = new { Email = email, Password = password };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
            var error = await response.Content.ReadFromJsonAsync<ErrorResponse>();
            error?.Message.Should().Be("Votre compte a été suspendu.");
        }

        [Fact]
        public async Task Login_WithUppercaseEmail_NormalizesAndSucceeds()
        {
            // Arrange
            var email = $"normalize_{Guid.NewGuid():N}@example.com";
            var password = "MySecure@Pass123";

            await _client.PostAsJsonAsync("/api/auth/register", new
            {
                Email = email,
                Pseudo = $"Norm{Guid.NewGuid():N}"[..20],
                Password = password,
                ConfirmPassword = password
            });

            var loginRequest = new { Email = email.ToUpperInvariant(), Password = password };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Theory]
        [InlineData("", "password")]
        [InlineData("test@example.com", "")]
        public async Task Login_WithEmptyFields_ReturnsBadRequest(string email, string password)
        {
            // Arrange
            var loginRequest = new { Email = email, Password = password };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        #endregion

        private record ErrorResponse(string Message);
    }
}
