using FantasyRealm.Application.Interfaces;
using FantasyRealm.Application.Services;
using FantasyRealm.Domain.Entities;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;

namespace FantasyRealm.Tests.Unit.Services
{
    /// <summary>
    /// Unit tests for <see cref="UserModerationService"/>.
    /// </summary>
    [Trait("Category", "Unit")]
    [Trait("Category", "UserModeration")]
    public class UserModerationServiceTests
    {
        private readonly Mock<IUserRepository> _userRepoMock = new();
        private readonly Mock<IEmailService> _emailServiceMock = new();
        private readonly Mock<ILogger<UserModerationService>> _loggerMock = new();
        private readonly UserModerationService _sut;

        private const int ReviewerId = 99;

        public UserModerationServiceTests()
        {
            _sut = new UserModerationService(
                _userRepoMock.Object,
                _emailServiceMock.Object,
                _loggerMock.Object);
        }

        private static Role UserRole => new() { Id = 1, Label = "User" };
        private static Role EmployeeRole => new() { Id = 2, Label = "Employee" };

        private static User ActiveUser(int id = 1) => new()
        {
            Id = id,
            Pseudo = "Frodon",
            Email = "frodon@example.com",
            IsSuspended = false,
            CreatedAt = DateTime.UtcNow.AddMonths(-3),
            RoleId = 1,
            Role = UserRole,
            Characters = new List<Character>()
        };

        private static User SuspendedUser(int id = 2) => new()
        {
            Id = id,
            Pseudo = "Sauron",
            Email = "sauron@example.com",
            IsSuspended = true,
            CreatedAt = DateTime.UtcNow.AddMonths(-6),
            RoleId = 1,
            Role = UserRole,
            Characters = new List<Character>()
        };

        private static User EmployeeUser(int id = 3) => new()
        {
            Id = id,
            Pseudo = "Gandalf",
            Email = "gandalf@example.com",
            IsSuspended = false,
            CreatedAt = DateTime.UtcNow.AddMonths(-12),
            RoleId = 2,
            Role = EmployeeRole,
            Characters = new List<Character>()
        };

        // ── GetUsersAsync ──────────────────────────────────────────────────

        [Fact]
        public async Task GetUsersAsync_ReturnsPagedResults()
        {
            var users = new List<User> { ActiveUser(), SuspendedUser() };
            _userRepoMock
                .Setup(r => r.GetUsersAsync(1, 12, null, null, It.IsAny<CancellationToken>()))
                .ReturnsAsync((users.AsReadOnly() as IReadOnlyList<User>, 2));

            var result = await _sut.GetUsersAsync(1, 12, null, null, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.Items.Should().HaveCount(2);
            result.Value.TotalCount.Should().Be(2);
            result.Value.Page.Should().Be(1);
        }

        [Fact]
        public async Task GetUsersAsync_WithNoResults_ReturnsEmpty()
        {
            _userRepoMock
                .Setup(r => r.GetUsersAsync(1, 12, null, null, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Array.Empty<User>() as IReadOnlyList<User>, 0));

            var result = await _sut.GetUsersAsync(1, 12, null, null, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.Items.Should().BeEmpty();
            result.Value.TotalCount.Should().Be(0);
        }

        [Fact]
        public async Task GetUsersAsync_WithInvalidPage_ReturnsFailure()
        {
            var result = await _sut.GetUsersAsync(0, 12, null, null, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
        }

        [Fact]
        public async Task GetUsersAsync_WithPageTooHigh_ReturnsFailure()
        {
            var result = await _sut.GetUsersAsync(1001, 12, null, null, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
        }

        // ── CountUsersAsync ────────────────────────────────────────────────

        [Fact]
        public async Task CountUsersAsync_ReturnsCount()
        {
            _userRepoMock
                .Setup(r => r.CountByRoleAsync("User", It.IsAny<CancellationToken>()))
                .ReturnsAsync(42);

            var result = await _sut.CountUsersAsync(CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value.Should().Be(42);
        }

        // ── SuspendAsync ───────────────────────────────────────────────────

        [Fact]
        public async Task SuspendAsync_WhenActive_SetsIsSuspendedTrue()
        {
            var user = ActiveUser();
            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);
            _userRepoMock
                .Setup(r => r.UpdateAsync(user, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            var result = await _sut.SuspendAsync(1, "Comportement inapproprié envers les autres joueurs", ReviewerId, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            user.IsSuspended.Should().BeTrue();
            result.Value!.IsSuspended.Should().BeTrue();
            _userRepoMock.Verify(r => r.UpdateAsync(user, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task SuspendAsync_WhenActive_SendsEmail()
        {
            var user = ActiveUser();
            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);
            _userRepoMock
                .Setup(r => r.UpdateAsync(user, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            await _sut.SuspendAsync(1, "Comportement inapproprié envers les autres joueurs", ReviewerId, CancellationToken.None);

            _emailServiceMock.Verify(
                e => e.SendAccountSuspendedEmailAsync(
                    "frodon@example.com", "Frodon",
                    "Comportement inapproprié envers les autres joueurs",
                    It.IsAny<CancellationToken>()),
                Times.Once);
        }

        [Fact]
        public async Task SuspendAsync_WhenNotFound_ReturnsFailure404()
        {
            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((User?)null);

            var result = await _sut.SuspendAsync(999, "Motif valide de suspension", ReviewerId, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(404);
        }

        [Fact]
        public async Task SuspendAsync_WhenNotUserRole_ReturnsFailure403()
        {
            var employee = EmployeeUser();
            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(3, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);

            var result = await _sut.SuspendAsync(3, "Motif valide de suspension", ReviewerId, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(403);
        }

        [Fact]
        public async Task SuspendAsync_WhenAlreadySuspended_ReturnsFailure400()
        {
            var user = SuspendedUser();
            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(2, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            var result = await _sut.SuspendAsync(2, "Motif valide de suspension", ReviewerId, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(400);
        }

        [Fact]
        public async Task SuspendAsync_WithEmptyReason_ReturnsFailure400()
        {
            var result = await _sut.SuspendAsync(1, "", ReviewerId, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(400);
        }

        [Fact]
        public async Task SuspendAsync_WithReasonTooShort_ReturnsFailure400()
        {
            var result = await _sut.SuspendAsync(1, "Court", ReviewerId, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(400);
        }

        [Fact]
        public async Task SuspendAsync_WithReasonTooLong_ReturnsFailure400()
        {
            var longReason = new string('x', 501);
            var result = await _sut.SuspendAsync(1, longReason, ReviewerId, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(400);
        }

        [Fact]
        public async Task SuspendAsync_WhenEmailFails_StillReturnsSuccess()
        {
            var user = ActiveUser();
            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);
            _userRepoMock
                .Setup(r => r.UpdateAsync(user, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);
            _emailServiceMock
                .Setup(e => e.SendAccountSuspendedEmailAsync(
                    It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new InvalidOperationException("Email service unavailable"));

            var result = await _sut.SuspendAsync(1, "Comportement inapproprié envers les autres joueurs", ReviewerId, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            user.IsSuspended.Should().BeTrue();
        }

        // ── ReactivateAsync ────────────────────────────────────────────────

        [Fact]
        public async Task ReactivateAsync_WhenSuspended_SetsIsSuspendedFalse()
        {
            var user = SuspendedUser();
            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(2, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);
            _userRepoMock
                .Setup(r => r.UpdateAsync(user, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            var result = await _sut.ReactivateAsync(2, ReviewerId, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            user.IsSuspended.Should().BeFalse();
            result.Value!.IsSuspended.Should().BeFalse();
            _userRepoMock.Verify(r => r.UpdateAsync(user, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task ReactivateAsync_WhenSuspended_SendsEmail()
        {
            var user = SuspendedUser();
            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(2, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);
            _userRepoMock
                .Setup(r => r.UpdateAsync(user, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            await _sut.ReactivateAsync(2, ReviewerId, CancellationToken.None);

            _emailServiceMock.Verify(
                e => e.SendAccountReactivatedEmailAsync(
                    "sauron@example.com", "Sauron", It.IsAny<CancellationToken>()),
                Times.Once);
        }

        [Fact]
        public async Task ReactivateAsync_WhenNotFound_ReturnsFailure404()
        {
            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((User?)null);

            var result = await _sut.ReactivateAsync(999, ReviewerId, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(404);
        }

        [Fact]
        public async Task ReactivateAsync_WhenNotSuspended_ReturnsFailure400()
        {
            var user = ActiveUser();
            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            var result = await _sut.ReactivateAsync(1, ReviewerId, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(400);
        }

        [Fact]
        public async Task ReactivateAsync_WhenNotUserRole_ReturnsFailure403()
        {
            var employee = EmployeeUser();
            employee.IsSuspended = true;
            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(3, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);

            var result = await _sut.ReactivateAsync(3, ReviewerId, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(403);
        }

        [Fact]
        public async Task ReactivateAsync_WhenEmailFails_StillReturnsSuccess()
        {
            var user = SuspendedUser();
            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(2, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);
            _userRepoMock
                .Setup(r => r.UpdateAsync(user, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);
            _emailServiceMock
                .Setup(e => e.SendAccountReactivatedEmailAsync(
                    It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new InvalidOperationException("Email service unavailable"));

            var result = await _sut.ReactivateAsync(2, ReviewerId, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            user.IsSuspended.Should().BeFalse();
        }

        // ── DeleteAsync ────────────────────────────────────────────────────

        [Fact]
        public async Task DeleteAsync_WhenFound_DeletesUser()
        {
            var user = ActiveUser();
            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            var result = await _sut.DeleteAsync(1, ReviewerId, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            _userRepoMock.Verify(r => r.DeleteAsync(user, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task DeleteAsync_WhenFound_SendsEmailBeforeDeletion()
        {
            var user = ActiveUser();
            var callOrder = new List<string>();

            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);
            _emailServiceMock
                .Setup(e => e.SendAccountDeletedEmailAsync(
                    It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .Callback(() => callOrder.Add("email"));
            _userRepoMock
                .Setup(r => r.DeleteAsync(user, It.IsAny<CancellationToken>()))
                .Callback(() => callOrder.Add("delete"));

            await _sut.DeleteAsync(1, ReviewerId, CancellationToken.None);

            callOrder.Should().ContainInOrder("email", "delete");
        }

        [Fact]
        public async Task DeleteAsync_WhenNotFound_ReturnsFailure404()
        {
            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((User?)null);

            var result = await _sut.DeleteAsync(999, ReviewerId, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(404);
        }

        [Fact]
        public async Task DeleteAsync_WhenNotUserRole_ReturnsFailure403()
        {
            var employee = EmployeeUser();
            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(3, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);

            var result = await _sut.DeleteAsync(3, ReviewerId, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(403);
        }

        [Fact]
        public async Task DeleteAsync_WhenEmailFails_StillDeletes()
        {
            var user = ActiveUser();
            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);
            _emailServiceMock
                .Setup(e => e.SendAccountDeletedEmailAsync(
                    It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new InvalidOperationException("Email service unavailable"));

            var result = await _sut.DeleteAsync(1, ReviewerId, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            _userRepoMock.Verify(r => r.DeleteAsync(user, It.IsAny<CancellationToken>()), Times.Once);
        }
    }
}
