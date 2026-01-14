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
        private readonly Mock<IPasswordGenerator> _passwordGeneratorMock;
        private readonly Mock<IEmailService> _emailServiceMock;
        private readonly Mock<IJwtService> _jwtServiceMock;
        private readonly Mock<ILogger<AuthService>> _loggerMock;
        private readonly AuthService _authService;

        public AuthServiceTests()
        {
            _userRepositoryMock = new Mock<IUserRepository>();
            _passwordHasherMock = new Mock<IPasswordHasher>();
            _passwordGeneratorMock = new Mock<IPasswordGenerator>();
            _emailServiceMock = new Mock<IEmailService>();
            _jwtServiceMock = new Mock<IJwtService>();
            _loggerMock = new Mock<ILogger<AuthService>>();

            _authService = new AuthService(
                _userRepositoryMock.Object,
                _passwordHasherMock.Object,
                _passwordGeneratorMock.Object,
                _emailServiceMock.Object,
                _jwtServiceMock.Object,
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

        #region Login Tests

        [Fact]
        public async Task Given_ValidCredentials_When_Login_Should_ReturnTokenAndUserInfo()
        {
            // Arrange
            var request = new LoginRequest("test@example.com", "SecurePass@123!");
            var role = new Role { Id = 1, Label = "User" };
            var user = new User
            {
                Id = 1,
                Email = "test@example.com",
                Pseudo = "TestUser",
                PasswordHash = "hashed",
                RoleId = 1,
                Role = role,
                IsSuspended = false,
                MustChangePassword = false
            };

            _userRepositoryMock.Setup(r => r.GetByEmailWithRoleAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);
            _passwordHasherMock.Setup(h => h.Verify(It.IsAny<string>(), It.IsAny<string>()))
                .Returns(true);
            _jwtServiceMock.Setup(j => j.GenerateToken(It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns("jwt-token");
            _jwtServiceMock.Setup(j => j.GetExpirationDate())
                .Returns(DateTime.UtcNow.AddHours(24));

            // Act
            var result = await _authService.LoginAsync(request);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Value.Should().NotBeNull();
            result.Value!.Token.Should().Be("jwt-token");
            result.Value.User.Id.Should().Be(1);
            result.Value.User.Email.Should().Be("test@example.com");
            result.Value.User.Pseudo.Should().Be("TestUser");
            result.Value.User.Role.Should().Be("User");
            result.Value.MustChangePassword.Should().BeFalse();
        }

        [Fact]
        public async Task Given_NonExistentUser_When_Login_Should_ReturnUnauthorized()
        {
            // Arrange
            var request = new LoginRequest("notfound@example.com", "SecurePass@123!");

            _userRepositoryMock.Setup(r => r.GetByEmailWithRoleAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((User?)null);

            // Act
            var result = await _authService.LoginAsync(request);

            // Assert
            result.IsFailure.Should().BeTrue();
            result.Error.Should().Be("Identifiants incorrects.");
            result.ErrorCode.Should().Be(401);
        }

        [Fact]
        public async Task Given_WrongPassword_When_Login_Should_ReturnUnauthorized()
        {
            // Arrange
            var request = new LoginRequest("test@example.com", "WrongPassword!");
            var role = new Role { Id = 1, Label = "User" };
            var user = new User
            {
                Id = 1,
                Email = "test@example.com",
                Pseudo = "TestUser",
                PasswordHash = "hashed",
                RoleId = 1,
                Role = role
            };

            _userRepositoryMock.Setup(r => r.GetByEmailWithRoleAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);
            _passwordHasherMock.Setup(h => h.Verify(It.IsAny<string>(), It.IsAny<string>()))
                .Returns(false);

            // Act
            var result = await _authService.LoginAsync(request);

            // Assert
            result.IsFailure.Should().BeTrue();
            result.Error.Should().Be("Identifiants incorrects.");
            result.ErrorCode.Should().Be(401);
        }

        [Fact]
        public async Task Given_SuspendedAccount_When_Login_Should_ReturnForbidden()
        {
            // Arrange
            var request = new LoginRequest("suspended@example.com", "SecurePass@123!");
            var role = new Role { Id = 1, Label = "User" };
            var user = new User
            {
                Id = 1,
                Email = "suspended@example.com",
                Pseudo = "SuspendedUser",
                PasswordHash = "hashed",
                RoleId = 1,
                Role = role,
                IsSuspended = true
            };

            _userRepositoryMock.Setup(r => r.GetByEmailWithRoleAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);
            _passwordHasherMock.Setup(h => h.Verify(It.IsAny<string>(), It.IsAny<string>()))
                .Returns(true);

            // Act
            var result = await _authService.LoginAsync(request);

            // Assert
            result.IsFailure.Should().BeTrue();
            result.Error.Should().Be("Votre compte a été suspendu.");
            result.ErrorCode.Should().Be(403);
        }

        [Fact]
        public async Task Given_UserMustChangePassword_When_Login_Should_ReturnFlagTrue()
        {
            // Arrange
            var request = new LoginRequest("test@example.com", "SecurePass@123!");
            var role = new Role { Id = 1, Label = "User" };
            var user = new User
            {
                Id = 1,
                Email = "test@example.com",
                Pseudo = "TestUser",
                PasswordHash = "hashed",
                RoleId = 1,
                Role = role,
                IsSuspended = false,
                MustChangePassword = true
            };

            _userRepositoryMock.Setup(r => r.GetByEmailWithRoleAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);
            _passwordHasherMock.Setup(h => h.Verify(It.IsAny<string>(), It.IsAny<string>()))
                .Returns(true);
            _jwtServiceMock.Setup(j => j.GenerateToken(It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns("jwt-token");
            _jwtServiceMock.Setup(j => j.GetExpirationDate())
                .Returns(DateTime.UtcNow.AddHours(24));

            // Act
            var result = await _authService.LoginAsync(request);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Value!.MustChangePassword.Should().BeTrue();
        }

        [Fact]
        public async Task Given_EmailWithUppercaseAndSpaces_When_Login_Should_NormalizeEmail()
        {
            // Arrange
            var request = new LoginRequest("  TEST@EXAMPLE.COM  ", "SecurePass@123!");
            var role = new Role { Id = 1, Label = "User" };
            var user = new User
            {
                Id = 1,
                Email = "test@example.com",
                Pseudo = "TestUser",
                PasswordHash = "hashed",
                RoleId = 1,
                Role = role,
                IsSuspended = false,
                MustChangePassword = false
            };

            _userRepositoryMock.Setup(r => r.GetByEmailWithRoleAsync("test@example.com", It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);
            _passwordHasherMock.Setup(h => h.Verify(It.IsAny<string>(), It.IsAny<string>()))
                .Returns(true);
            _jwtServiceMock.Setup(j => j.GenerateToken(It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns("jwt-token");
            _jwtServiceMock.Setup(j => j.GetExpirationDate())
                .Returns(DateTime.UtcNow.AddHours(24));

            // Act
            var result = await _authService.LoginAsync(request);

            // Assert
            result.IsSuccess.Should().BeTrue();
            _userRepositoryMock.Verify(r => r.GetByEmailWithRoleAsync("test@example.com", It.IsAny<CancellationToken>()), Times.Once);
        }

        #endregion

        #region ForgotPassword Tests

        [Fact]
        public async Task Given_ValidEmailAndPseudo_When_ForgotPassword_Should_ReturnSuccess()
        {
            // Arrange
            var request = new ForgotPasswordRequest("test@example.com", "TestUser");
            var role = new Role { Id = 1, Label = "User" };
            var user = new User
            {
                Id = 1,
                Email = "test@example.com",
                Pseudo = "TestUser",
                PasswordHash = "oldHash",
                RoleId = 1,
                Role = role,
                IsSuspended = false,
                MustChangePassword = false
            };

            _userRepositoryMock.Setup(r => r.GetByEmailAndPseudoAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);
            _passwordGeneratorMock.Setup(g => g.GenerateSecurePassword(It.IsAny<int>()))
                .Returns("TempPass@123!");
            _passwordHasherMock.Setup(h => h.Hash(It.IsAny<string>()))
                .Returns("newHash");
            _userRepositoryMock.Setup(r => r.UpdateAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            // Act
            var result = await _authService.ForgotPasswordAsync(request);

            // Assert
            result.IsSuccess.Should().BeTrue();
            _userRepositoryMock.Verify(r => r.UpdateAsync(It.Is<User>(u => u.MustChangePassword == true), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task Given_NonExistentUser_When_ForgotPassword_Should_ReturnNotFound()
        {
            // Arrange
            var request = new ForgotPasswordRequest("notfound@example.com", "UnknownUser");

            _userRepositoryMock.Setup(r => r.GetByEmailAndPseudoAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((User?)null);

            // Act
            var result = await _authService.ForgotPasswordAsync(request);

            // Assert
            result.IsFailure.Should().BeTrue();
            result.Error.Should().Be("Aucun compte ne correspond à ces informations.");
            result.ErrorCode.Should().Be(404);
        }

        [Fact]
        public async Task Given_SuspendedAccount_When_ForgotPassword_Should_ReturnForbidden()
        {
            // Arrange
            var request = new ForgotPasswordRequest("suspended@example.com", "SuspendedUser");
            var role = new Role { Id = 1, Label = "User" };
            var user = new User
            {
                Id = 1,
                Email = "suspended@example.com",
                Pseudo = "SuspendedUser",
                PasswordHash = "hashed",
                RoleId = 1,
                Role = role,
                IsSuspended = true
            };

            _userRepositoryMock.Setup(r => r.GetByEmailAndPseudoAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            // Act
            var result = await _authService.ForgotPasswordAsync(request);

            // Assert
            result.IsFailure.Should().BeTrue();
            result.Error.Should().Be("Votre compte a été suspendu.");
            result.ErrorCode.Should().Be(403);
        }

        [Fact]
        public async Task Given_ValidRequest_When_ForgotPassword_Should_GenerateAndHashNewPassword()
        {
            // Arrange
            var request = new ForgotPasswordRequest("test@example.com", "TestUser");
            var role = new Role { Id = 1, Label = "User" };
            var user = new User
            {
                Id = 1,
                Email = "test@example.com",
                Pseudo = "TestUser",
                PasswordHash = "oldHash",
                RoleId = 1,
                Role = role,
                IsSuspended = false
            };

            _userRepositoryMock.Setup(r => r.GetByEmailAndPseudoAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);
            _passwordGeneratorMock.Setup(g => g.GenerateSecurePassword(It.IsAny<int>()))
                .Returns("TempPass@123!");
            _passwordHasherMock.Setup(h => h.Hash("TempPass@123!"))
                .Returns("newHash");
            _userRepositoryMock.Setup(r => r.UpdateAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            // Act
            await _authService.ForgotPasswordAsync(request);

            // Assert
            _passwordGeneratorMock.Verify(g => g.GenerateSecurePassword(It.IsAny<int>()), Times.Once);
            _passwordHasherMock.Verify(h => h.Hash("TempPass@123!"), Times.Once);
            _userRepositoryMock.Verify(r => r.UpdateAsync(It.Is<User>(u => u.PasswordHash == "newHash"), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task Given_ValidRequest_When_ForgotPassword_Should_SendTemporaryPasswordEmail()
        {
            // Arrange
            var request = new ForgotPasswordRequest("test@example.com", "TestUser");
            var role = new Role { Id = 1, Label = "User" };
            var user = new User
            {
                Id = 1,
                Email = "test@example.com",
                Pseudo = "TestUser",
                PasswordHash = "oldHash",
                RoleId = 1,
                Role = role,
                IsSuspended = false
            };

            var emailSentSignal = new TaskCompletionSource<bool>();

            _userRepositoryMock.Setup(r => r.GetByEmailAndPseudoAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);
            _passwordGeneratorMock.Setup(g => g.GenerateSecurePassword(It.IsAny<int>()))
                .Returns("TempPass@123!");
            _passwordHasherMock.Setup(h => h.Hash(It.IsAny<string>()))
                .Returns("newHash");
            _userRepositoryMock.Setup(r => r.UpdateAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);
            _emailServiceMock.Setup(e => e.SendTemporaryPasswordEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .Callback(() => emailSentSignal.SetResult(true))
                .Returns(Task.CompletedTask);

            // Act
            await _authService.ForgotPasswordAsync(request);

            // Assert
            var emailSent = await Task.WhenAny(emailSentSignal.Task, Task.Delay(1000)) == emailSentSignal.Task;
            emailSent.Should().BeTrue("the temporary password email should be sent after successful password reset");
            _emailServiceMock.Verify(
                e => e.SendTemporaryPasswordEmailAsync("test@example.com", "TestUser", "TempPass@123!", It.IsAny<CancellationToken>()),
                Times.Once);
        }

        [Fact]
        public async Task Given_EmailWithUppercaseAndSpaces_When_ForgotPassword_Should_NormalizeEmailAndPseudo()
        {
            // Arrange
            var request = new ForgotPasswordRequest("  TEST@EXAMPLE.COM  ", "  TestUser  ");
            var role = new Role { Id = 1, Label = "User" };
            var user = new User
            {
                Id = 1,
                Email = "test@example.com",
                Pseudo = "TestUser",
                PasswordHash = "oldHash",
                RoleId = 1,
                Role = role,
                IsSuspended = false
            };

            _userRepositoryMock.Setup(r => r.GetByEmailAndPseudoAsync("test@example.com", "TestUser", It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);
            _passwordGeneratorMock.Setup(g => g.GenerateSecurePassword(It.IsAny<int>()))
                .Returns("TempPass@123!");
            _passwordHasherMock.Setup(h => h.Hash(It.IsAny<string>()))
                .Returns("newHash");
            _userRepositoryMock.Setup(r => r.UpdateAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            // Act
            var result = await _authService.ForgotPasswordAsync(request);

            // Assert
            result.IsSuccess.Should().BeTrue();
            _userRepositoryMock.Verify(r => r.GetByEmailAndPseudoAsync("test@example.com", "TestUser", It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task Given_WrongEmailForPseudo_When_ForgotPassword_Should_ReturnNotFound()
        {
            // Arrange
            var request = new ForgotPasswordRequest("wrong@example.com", "TestUser");

            _userRepositoryMock.Setup(r => r.GetByEmailAndPseudoAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((User?)null);

            // Act
            var result = await _authService.ForgotPasswordAsync(request);

            // Assert
            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(404);
        }

        #endregion

        #region ChangePassword Tests

        [Fact]
        public async Task Given_ValidRequest_When_ChangePassword_Should_ReturnSuccessWithNewToken()
        {
            // Arrange
            var userId = 1;
            var request = new ChangePasswordRequest("OldPassword@123!", "NewPassword@456!", "NewPassword@456!");
            var role = new Role { Id = 1, Label = "User" };
            var user = new User
            {
                Id = userId,
                Email = "test@example.com",
                Pseudo = "TestUser",
                PasswordHash = "oldHash",
                RoleId = 1,
                Role = role,
                IsSuspended = false,
                MustChangePassword = true
            };

            _userRepositoryMock.Setup(r => r.GetByIdWithRoleAsync(userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);
            _passwordHasherMock.Setup(h => h.Verify("OldPassword@123!", "oldHash"))
                .Returns(true);
            _passwordHasherMock.Setup(h => h.Verify("NewPassword@456!", "oldHash"))
                .Returns(false);
            _passwordHasherMock.Setup(h => h.Hash("NewPassword@456!"))
                .Returns("newHash");
            _userRepositoryMock.Setup(r => r.UpdateAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);
            _jwtServiceMock.Setup(j => j.GenerateToken(userId, "test@example.com", "TestUser", "User"))
                .Returns("new-jwt-token");
            _jwtServiceMock.Setup(j => j.GetExpirationDate())
                .Returns(DateTime.UtcNow.AddHours(24));

            // Act
            var result = await _authService.ChangePasswordAsync(userId, request);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Value.Should().NotBeNull();
            result.Value!.Token.Should().Be("new-jwt-token");
            result.Value.User.Id.Should().Be(userId);
            _userRepositoryMock.Verify(r => r.UpdateAsync(It.Is<User>(u => u.MustChangePassword == false && u.PasswordHash == "newHash"), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task Given_NonExistentUser_When_ChangePassword_Should_ReturnUnauthorized()
        {
            // Arrange
            var userId = 999;
            var request = new ChangePasswordRequest("OldPassword@123!", "NewPassword@456!", "NewPassword@456!");

            _userRepositoryMock.Setup(r => r.GetByIdWithRoleAsync(userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync((User?)null);

            // Act
            var result = await _authService.ChangePasswordAsync(userId, request);

            // Assert
            result.IsFailure.Should().BeTrue();
            result.Error.Should().Be("Identifiants incorrects.");
            result.ErrorCode.Should().Be(401);
        }

        [Fact]
        public async Task Given_SuspendedAccount_When_ChangePassword_Should_ReturnForbidden()
        {
            // Arrange
            var userId = 1;
            var request = new ChangePasswordRequest("OldPassword@123!", "NewPassword@456!", "NewPassword@456!");
            var role = new Role { Id = 1, Label = "User" };
            var user = new User
            {
                Id = userId,
                Email = "test@example.com",
                Pseudo = "TestUser",
                PasswordHash = "oldHash",
                RoleId = 1,
                Role = role,
                IsSuspended = true
            };

            _userRepositoryMock.Setup(r => r.GetByIdWithRoleAsync(userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            // Act
            var result = await _authService.ChangePasswordAsync(userId, request);

            // Assert
            result.IsFailure.Should().BeTrue();
            result.Error.Should().Be("Votre compte a été suspendu.");
            result.ErrorCode.Should().Be(403);
        }

        [Fact]
        public async Task Given_WrongCurrentPassword_When_ChangePassword_Should_ReturnUnauthorized()
        {
            // Arrange
            var userId = 1;
            var request = new ChangePasswordRequest("WrongPassword!", "NewPassword@456!", "NewPassword@456!");
            var role = new Role { Id = 1, Label = "User" };
            var user = new User
            {
                Id = userId,
                Email = "test@example.com",
                Pseudo = "TestUser",
                PasswordHash = "oldHash",
                RoleId = 1,
                Role = role,
                IsSuspended = false
            };

            _userRepositoryMock.Setup(r => r.GetByIdWithRoleAsync(userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);
            _passwordHasherMock.Setup(h => h.Verify("WrongPassword!", "oldHash"))
                .Returns(false);

            // Act
            var result = await _authService.ChangePasswordAsync(userId, request);

            // Assert
            result.IsFailure.Should().BeTrue();
            result.Error.Should().Be("Le mot de passe actuel est incorrect.");
            result.ErrorCode.Should().Be(401);
        }

        [Fact]
        public async Task Given_MismatchedNewPasswords_When_ChangePassword_Should_ReturnBadRequest()
        {
            // Arrange
            var userId = 1;
            var request = new ChangePasswordRequest("OldPassword@123!", "NewPassword@456!", "DifferentPassword@789!");
            var role = new Role { Id = 1, Label = "User" };
            var user = new User
            {
                Id = userId,
                Email = "test@example.com",
                Pseudo = "TestUser",
                PasswordHash = "oldHash",
                RoleId = 1,
                Role = role,
                IsSuspended = false
            };

            _userRepositoryMock.Setup(r => r.GetByIdWithRoleAsync(userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);
            _passwordHasherMock.Setup(h => h.Verify("OldPassword@123!", "oldHash"))
                .Returns(true);

            // Act
            var result = await _authService.ChangePasswordAsync(userId, request);

            // Assert
            result.IsFailure.Should().BeTrue();
            result.Error.Should().Be("Les nouveaux mots de passe ne correspondent pas.");
            result.ErrorCode.Should().Be(400);
        }

        [Fact]
        public async Task Given_WeakNewPassword_When_ChangePassword_Should_ReturnBadRequest()
        {
            // Arrange
            var userId = 1;
            var request = new ChangePasswordRequest("OldPassword@123!", "weak", "weak");
            var role = new Role { Id = 1, Label = "User" };
            var user = new User
            {
                Id = userId,
                Email = "test@example.com",
                Pseudo = "TestUser",
                PasswordHash = "oldHash",
                RoleId = 1,
                Role = role,
                IsSuspended = false
            };

            _userRepositoryMock.Setup(r => r.GetByIdWithRoleAsync(userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);
            _passwordHasherMock.Setup(h => h.Verify("OldPassword@123!", "oldHash"))
                .Returns(true);

            // Act
            var result = await _authService.ChangePasswordAsync(userId, request);

            // Assert
            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(400);
        }

        [Fact]
        public async Task Given_SameAsOldPassword_When_ChangePassword_Should_ReturnBadRequest()
        {
            // Arrange
            var userId = 1;
            var request = new ChangePasswordRequest("OldPassword@123!", "OldPassword@123!", "OldPassword@123!");
            var role = new Role { Id = 1, Label = "User" };
            var user = new User
            {
                Id = userId,
                Email = "test@example.com",
                Pseudo = "TestUser",
                PasswordHash = "oldHash",
                RoleId = 1,
                Role = role,
                IsSuspended = false
            };

            _userRepositoryMock.Setup(r => r.GetByIdWithRoleAsync(userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);
            _passwordHasherMock.Setup(h => h.Verify("OldPassword@123!", "oldHash"))
                .Returns(true);

            // Act
            var result = await _authService.ChangePasswordAsync(userId, request);

            // Assert
            result.IsFailure.Should().BeTrue();
            result.Error.Should().Be("Le nouveau mot de passe doit être différent de l'ancien.");
            result.ErrorCode.Should().Be(400);
        }

        [Fact]
        public async Task Given_ValidRequest_When_ChangePassword_Should_SetMustChangePasswordToFalse()
        {
            // Arrange
            var userId = 1;
            var request = new ChangePasswordRequest("OldPassword@123!", "NewPassword@456!", "NewPassword@456!");
            var role = new Role { Id = 1, Label = "User" };
            var user = new User
            {
                Id = userId,
                Email = "test@example.com",
                Pseudo = "TestUser",
                PasswordHash = "oldHash",
                RoleId = 1,
                Role = role,
                IsSuspended = false,
                MustChangePassword = true
            };

            _userRepositoryMock.Setup(r => r.GetByIdWithRoleAsync(userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);
            _passwordHasherMock.Setup(h => h.Verify("OldPassword@123!", "oldHash"))
                .Returns(true);
            _passwordHasherMock.Setup(h => h.Verify("NewPassword@456!", "oldHash"))
                .Returns(false);
            _passwordHasherMock.Setup(h => h.Hash("NewPassword@456!"))
                .Returns("newHash");
            _userRepositoryMock.Setup(r => r.UpdateAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);
            _jwtServiceMock.Setup(j => j.GenerateToken(It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns("new-jwt-token");
            _jwtServiceMock.Setup(j => j.GetExpirationDate())
                .Returns(DateTime.UtcNow.AddHours(24));

            // Act
            await _authService.ChangePasswordAsync(userId, request);

            // Assert
            _userRepositoryMock.Verify(r => r.UpdateAsync(
                It.Is<User>(u => u.MustChangePassword == false),
                It.IsAny<CancellationToken>()), Times.Once);
        }

        #endregion
    }
}
