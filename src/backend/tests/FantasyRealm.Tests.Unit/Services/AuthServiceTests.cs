using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using FantasyRealm.Application.Services;
using FantasyRealm.Domain.Entities;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;

namespace FantasyRealm.Tests.Unit.Services
{
    public class AuthServiceTests
    {
        private readonly Mock<IUserRepository> _userRepositoryMock;
        private readonly Mock<IPasswordHasher> _passwordHasherMock;
        private readonly Mock<IEmailService> _emailServiceMock;
        private readonly Mock<ILogger<AuthService>> _loggerMock;
        private readonly AuthService _authService;

        public AuthServiceTests()
        {
            _userRepositoryMock = new Mock<IUserRepository>();
            _passwordHasherMock = new Mock<IPasswordHasher>();
            _emailServiceMock = new Mock<IEmailService>();
            _loggerMock = new Mock<ILogger<AuthService>>();

            _authService = new AuthService(
                _userRepositoryMock.Object,
                _passwordHasherMock.Object,
                _emailServiceMock.Object,
                _loggerMock.Object);
        }

        [Fact]
        public async Task Given_ValidRequest_When_Register_Should_ReturnSuccess()
        {
            // Arrange
            var request = new RegisterRequest(
                "test@example.com",
                "TestUser",
                "SecurePass@123!",
                "SecurePass@123!");

            var role = new Role { Id = 1, Label = "User" };
            var createdUser = new User
            {
                Id = 1,
                Email = "test@example.com",
                Pseudo = "TestUser",
                PasswordHash = "hashed",
                RoleId = 1,
                CreatedAt = DateTime.UtcNow
            };

            _userRepositoryMock.Setup(r => r.ExistsByEmailAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);
            _userRepositoryMock.Setup(r => r.ExistsByPseudoAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);
            _userRepositoryMock.Setup(r => r.GetRoleByLabelAsync("User", It.IsAny<CancellationToken>()))
                .ReturnsAsync(role);
            _userRepositoryMock.Setup(r => r.CreateAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(createdUser);
            _passwordHasherMock.Setup(h => h.Hash(It.IsAny<string>()))
                .Returns("hashed");

            // Act
            var result = await _authService.RegisterAsync(request);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Value.Should().NotBeNull();
            result.Value!.Email.Should().Be("test@example.com");
            result.Value.Pseudo.Should().Be("TestUser");
            result.Value.Role.Should().Be("User");
        }

        [Fact]
        public async Task Given_MismatchedPasswords_When_Register_Should_ReturnFailure()
        {
            // Arrange
            var request = new RegisterRequest(
                "test@example.com",
                "TestUser",
                "SecurePass@123!",
                "DifferentPass@123!");

            // Act
            var result = await _authService.RegisterAsync(request);

            // Assert
            result.IsFailure.Should().BeTrue();
            result.Error.Should().Be("Les mots de passe ne correspondent pas.");
            result.ErrorCode.Should().Be(400);
        }

        [Fact]
        public async Task Given_WeakPassword_When_Register_Should_ReturnFailure()
        {
            // Arrange
            var request = new RegisterRequest(
                "test@example.com",
                "TestUser",
                "weak",
                "weak");

            // Act
            var result = await _authService.RegisterAsync(request);

            // Assert
            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(400);
        }

        [Fact]
        public async Task Given_ExistingEmail_When_Register_Should_ReturnConflict()
        {
            // Arrange
            var request = new RegisterRequest(
                "existing@example.com",
                "TestUser",
                "SecurePass@123!",
                "SecurePass@123!");

            _userRepositoryMock.Setup(r => r.ExistsByEmailAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Act
            var result = await _authService.RegisterAsync(request);

            // Assert
            result.IsFailure.Should().BeTrue();
            result.Error.Should().Be("Cette adresse email est déjà utilisée.");
            result.ErrorCode.Should().Be(409);
        }

        [Fact]
        public async Task Given_ExistingPseudo_When_Register_Should_ReturnConflict()
        {
            // Arrange
            var request = new RegisterRequest(
                "test@example.com",
                "ExistingUser",
                "SecurePass@123!",
                "SecurePass@123!");

            _userRepositoryMock.Setup(r => r.ExistsByEmailAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);
            _userRepositoryMock.Setup(r => r.ExistsByPseudoAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Act
            var result = await _authService.RegisterAsync(request);

            // Assert
            result.IsFailure.Should().BeTrue();
            result.Error.Should().Be("Ce pseudo est déjà utilisé.");
            result.ErrorCode.Should().Be(409);
        }

        [Fact]
        public async Task Given_MissingDefaultRole_When_Register_Should_ReturnServerError()
        {
            // Arrange
            var request = new RegisterRequest(
                "test@example.com",
                "TestUser",
                "SecurePass@123!",
                "SecurePass@123!");

            _userRepositoryMock.Setup(r => r.ExistsByEmailAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);
            _userRepositoryMock.Setup(r => r.ExistsByPseudoAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);
            _userRepositoryMock.Setup(r => r.GetRoleByLabelAsync("User", It.IsAny<CancellationToken>()))
                .ReturnsAsync((Role?)null);

            // Act
            var result = await _authService.RegisterAsync(request);

            // Assert
            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(500);
        }

        [Fact]
        public async Task Given_SuccessfulRegistration_When_Register_Should_SendWelcomeEmail()
        {
            // Arrange
            var request = new RegisterRequest(
                "test@example.com",
                "TestUser",
                "SecurePass@123!",
                "SecurePass@123!");

            var role = new Role { Id = 1, Label = "User" };
            var createdUser = new User
            {
                Id = 1,
                Email = "test@example.com",
                Pseudo = "TestUser",
                PasswordHash = "hashed",
                RoleId = 1,
                CreatedAt = DateTime.UtcNow
            };

            var emailSentSignal = new TaskCompletionSource<bool>();

            _userRepositoryMock.Setup(r => r.ExistsByEmailAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);
            _userRepositoryMock.Setup(r => r.ExistsByPseudoAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);
            _userRepositoryMock.Setup(r => r.GetRoleByLabelAsync("User", It.IsAny<CancellationToken>()))
                .ReturnsAsync(role);
            _userRepositoryMock.Setup(r => r.CreateAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(createdUser);
            _passwordHasherMock.Setup(h => h.Hash(It.IsAny<string>()))
                .Returns("hashed");
            _emailServiceMock.Setup(e => e.SendWelcomeEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .Callback(() => emailSentSignal.SetResult(true))
                .Returns(Task.CompletedTask);

            // Act
            await _authService.RegisterAsync(request);

            // Assert
            var emailSent = await Task.WhenAny(emailSentSignal.Task, Task.Delay(1000)) == emailSentSignal.Task;
            emailSent.Should().BeTrue("the welcome email should be sent after successful registration");
            _emailServiceMock.Verify(
                e => e.SendWelcomeEmailAsync("test@example.com", "TestUser", It.IsAny<CancellationToken>()),
                Times.Once);
        }

        [Fact]
        public async Task Given_EmailWithSpacesAndUppercase_When_Register_Should_NormalizeEmail()
        {
            // Arrange
            var request = new RegisterRequest(
                "  Test@EXAMPLE.COM  ",
                "TestUser",
                "SecurePass@123!",
                "SecurePass@123!");

            var role = new Role { Id = 1, Label = "User" };

            _userRepositoryMock.Setup(r => r.ExistsByEmailAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);
            _userRepositoryMock.Setup(r => r.ExistsByPseudoAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);
            _userRepositoryMock.Setup(r => r.GetRoleByLabelAsync("User", It.IsAny<CancellationToken>()))
                .ReturnsAsync(role);
            _userRepositoryMock.Setup(r => r.CreateAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((User u, CancellationToken _) =>
                {
                    u.Id = 1;
                    u.CreatedAt = DateTime.UtcNow;
                    return u;
                });
            _passwordHasherMock.Setup(h => h.Hash(It.IsAny<string>()))
                .Returns("hashed");

            // Act
            var result = await _authService.RegisterAsync(request);

            // Assert
            _userRepositoryMock.Verify(r => r.CreateAsync(
                It.Is<User>(u => u.Email == "test@example.com"),
                It.IsAny<CancellationToken>()));
        }
    }
}
