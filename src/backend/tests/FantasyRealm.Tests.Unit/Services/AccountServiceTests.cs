using FantasyRealm.Application.Interfaces;
using FantasyRealm.Application.Services;
using FantasyRealm.Domain.Entities;
using FantasyRealm.Domain.Enums;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;

namespace FantasyRealm.Tests.Unit.Services
{
    /// <summary>
    /// Unit tests for <see cref="AccountService"/>.
    /// </summary>
    [Trait("Category", "Unit")]
    [Trait("Category", "Account")]
    public class AccountServiceTests
    {
        private readonly Mock<IUserRepository> _userRepoMock = new();
        private readonly Mock<IPasswordHasher> _passwordHasherMock = new();
        private readonly Mock<IEmailService> _emailServiceMock = new();
        private readonly Mock<IActivityLogService> _activityLogServiceMock = new();
        private readonly Mock<ILogger<AccountService>> _loggerMock = new();
        private readonly AccountService _sut;

        private const string CorrectPassword = "MyP@ssw0rd!2025";
        private const string WrongPassword = "WrongPassword!1";
        private const string HashedPassword = "hashed_password_value";

        public AccountServiceTests()
        {
            _sut = new AccountService(
                _userRepoMock.Object,
                _passwordHasherMock.Object,
                _emailServiceMock.Object,
                _activityLogServiceMock.Object,
                _loggerMock.Object);
        }

        private static Role UserRole => new() { Id = 1, Label = "User" };
        private static Role EmployeeRole => new() { Id = 2, Label = "Employee" };

        private static User TestUser(int id = 1) => new()
        {
            Id = id,
            Pseudo = "Frodon",
            Email = "frodon@fantasy-realm.com",
            PasswordHash = HashedPassword,
            IsSuspended = false,
            CreatedAt = DateTime.UtcNow.AddMonths(-3),
            RoleId = 1,
            Role = UserRole,
            Characters = new List<Character>()
        };

        private static User TestEmployee(int id = 2) => new()
        {
            Id = id,
            Pseudo = "Gandalf",
            Email = "gandalf@fantasy-realm.com",
            PasswordHash = HashedPassword,
            IsSuspended = false,
            CreatedAt = DateTime.UtcNow.AddMonths(-12),
            RoleId = 2,
            Role = EmployeeRole,
            Characters = new List<Character>()
        };

        [Fact]
        public async Task DeleteAccountAsync_WithCorrectPassword_DeletesUserAndReturnsSuccess()
        {
            var user = TestUser();
            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(user.Id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);
            _passwordHasherMock
                .Setup(h => h.Verify(CorrectPassword, HashedPassword))
                .Returns(true);

            var result = await _sut.DeleteAccountAsync(user.Id, CorrectPassword, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            _emailServiceMock.Verify(
                e => e.SendAccountDeletedEmailAsync(user.Email, user.Pseudo, It.IsAny<CancellationToken>()),
                Times.Once);
            _userRepoMock.Verify(
                r => r.DeleteAsync(user, It.IsAny<CancellationToken>()),
                Times.Once);
            _activityLogServiceMock.Verify(
                a => a.LogAsync(
                    ActivityAction.UserDeleted, "User", user.Id, user.Pseudo,
                    It.IsAny<string?>(), It.IsAny<CancellationToken>()),
                Times.Once);
        }

        [Fact]
        public async Task DeleteAccountAsync_WithIncorrectPassword_ReturnsFailure401()
        {
            var user = TestUser();
            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(user.Id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);
            _passwordHasherMock
                .Setup(h => h.Verify(WrongPassword, HashedPassword))
                .Returns(false);

            var result = await _sut.DeleteAccountAsync(user.Id, WrongPassword, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(401);
            result.Error.Should().Contain("Mot de passe incorrect");
            _userRepoMock.Verify(
                r => r.DeleteAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()),
                Times.Never);
        }

        [Fact]
        public async Task DeleteAccountAsync_UserNotFound_ReturnsFailure404()
        {
            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((User?)null);

            var result = await _sut.DeleteAccountAsync(999, CorrectPassword, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(404);
        }

        [Fact]
        public async Task DeleteAccountAsync_EmployeeRole_ReturnsFailure403()
        {
            var employee = TestEmployee();
            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(employee.Id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);

            var result = await _sut.DeleteAccountAsync(employee.Id, CorrectPassword, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(403);
            _userRepoMock.Verify(
                r => r.DeleteAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()),
                Times.Never);
        }

        [Fact]
        public async Task DeleteAccountAsync_EmailFailure_StillDeletesUser()
        {
            var user = TestUser();
            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(user.Id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);
            _passwordHasherMock
                .Setup(h => h.Verify(CorrectPassword, HashedPassword))
                .Returns(true);
            _emailServiceMock
                .Setup(e => e.SendAccountDeletedEmailAsync(
                    It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("SMTP failure"));

            var result = await _sut.DeleteAccountAsync(user.Id, CorrectPassword, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            _userRepoMock.Verify(
                r => r.DeleteAsync(user, It.IsAny<CancellationToken>()),
                Times.Once);
        }
    }
}
