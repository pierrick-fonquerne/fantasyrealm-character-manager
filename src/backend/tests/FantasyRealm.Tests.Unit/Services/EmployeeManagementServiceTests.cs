using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using FantasyRealm.Application.Services;
using FantasyRealm.Domain.Entities;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;

namespace FantasyRealm.Tests.Unit.Services
{
    /// <summary>
    /// Unit tests for <see cref="EmployeeManagementService"/>.
    /// </summary>
    [Trait("Category", "Unit")]
    [Trait("Category", "EmployeeManagement")]
    public class EmployeeManagementServiceTests
    {
        private readonly Mock<IUserRepository> _userRepoMock = new();
        private readonly Mock<IPasswordHasher> _passwordHasherMock = new();
        private readonly Mock<IEmailService> _emailServiceMock = new();
        private readonly Mock<ILogger<EmployeeManagementService>> _loggerMock = new();
        private readonly EmployeeManagementService _sut;

        private const int AdminId = 100;

        public EmployeeManagementServiceTests()
        {
            _sut = new EmployeeManagementService(
                _userRepoMock.Object,
                _passwordHasherMock.Object,
                _emailServiceMock.Object,
                _loggerMock.Object);
        }

        private static Role EmployeeRole => new() { Id = 2, Label = "Employee" };
        private static Role UserRole => new() { Id = 1, Label = "User" };

        private static User ActiveEmployee(int id = 10) => new()
        {
            Id = id,
            Pseudo = "Legolas",
            Email = "legolas@example.com",
            IsSuspended = false,
            MustChangePassword = false,
            CreatedAt = DateTime.UtcNow.AddMonths(-3),
            RoleId = 2,
            Role = EmployeeRole,
            Characters = new List<Character>()
        };

        private static User SuspendedEmployee(int id = 11) => new()
        {
            Id = id,
            Pseudo = "Boromir",
            Email = "boromir@example.com",
            IsSuspended = true,
            MustChangePassword = false,
            CreatedAt = DateTime.UtcNow.AddMonths(-6),
            RoleId = 2,
            Role = EmployeeRole,
            Characters = new List<Character>()
        };

        private static User RegularUser(int id = 20) => new()
        {
            Id = id,
            Pseudo = "Frodon",
            Email = "frodon@example.com",
            IsSuspended = false,
            CreatedAt = DateTime.UtcNow.AddMonths(-1),
            RoleId = 1,
            Role = UserRole,
            Characters = new List<Character>()
        };

        private static CreateEmployeeRequest ValidRequest => new("aragorn@example.com", "SecureP@ss123!");

        private void SetupCreateDependencies()
        {
            _userRepoMock
                .Setup(r => r.ExistsByEmailAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);
            _userRepoMock
                .Setup(r => r.ExistsByPseudoAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);
            _userRepoMock
                .Setup(r => r.GetRoleByLabelAsync("Employee", It.IsAny<CancellationToken>()))
                .ReturnsAsync(EmployeeRole);
            _passwordHasherMock
                .Setup(h => h.Hash(It.IsAny<string>()))
                .Returns("hashed_password");
            _userRepoMock
                .Setup(r => r.CreateAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((User u, CancellationToken _) => { u.Id = 42; return u; });
        }

        // -- CreateAsync ---------------------------------------------------------

        [Fact]
        public async Task CreateAsync_WithValidData_ReturnsEmployeeWithDerivedPseudo()
        {
            SetupCreateDependencies();

            var result = await _sut.CreateAsync(ValidRequest, AdminId, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.Id.Should().Be(42);
            result.Value.Pseudo.Should().Be("aragorn");
            result.Value.Email.Should().Be("aragorn@example.com");
            result.Value.IsSuspended.Should().BeFalse();
        }

        [Fact]
        public async Task CreateAsync_WithValidData_HashesProvidedPassword()
        {
            SetupCreateDependencies();

            await _sut.CreateAsync(ValidRequest, AdminId, CancellationToken.None);

            _passwordHasherMock.Verify(h => h.Hash("SecureP@ss123!"), Times.Once);
        }

        [Fact]
        public async Task CreateAsync_WithValidData_SetsMustChangePasswordFalse()
        {
            SetupCreateDependencies();
            User? createdUser = null;
            _userRepoMock
                .Setup(r => r.CreateAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()))
                .Callback<User, CancellationToken>((u, _) => createdUser = u)
                .ReturnsAsync((User u, CancellationToken _) => { u.Id = 42; return u; });

            await _sut.CreateAsync(ValidRequest, AdminId, CancellationToken.None);

            createdUser.Should().NotBeNull();
            createdUser!.MustChangePassword.Should().BeFalse();
            createdUser.RoleId.Should().Be(EmployeeRole.Id);
        }

        [Fact]
        public async Task CreateAsync_WhenEmailAlreadyExists_ReturnsFailure409()
        {
            SetupCreateDependencies();
            _userRepoMock
                .Setup(r => r.ExistsByEmailAsync("aragorn@example.com", It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            var result = await _sut.CreateAsync(ValidRequest, AdminId, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(409);
        }

        [Fact]
        public async Task CreateAsync_WhenDerivedPseudoAlreadyExists_ReturnsFailure409()
        {
            SetupCreateDependencies();
            _userRepoMock
                .Setup(r => r.ExistsByPseudoAsync("aragorn", It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            var result = await _sut.CreateAsync(ValidRequest, AdminId, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(409);
        }

        // -- SuspendAsync --------------------------------------------------------

        [Fact]
        public async Task SuspendAsync_WhenActive_SetsIsSuspendedTrue()
        {
            var employee = ActiveEmployee();
            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(10, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);
            _userRepoMock
                .Setup(r => r.UpdateAsync(employee, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);

            var result = await _sut.SuspendAsync(10, "Comportement inapproprie envers les utilisateurs", AdminId, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            employee.IsSuspended.Should().BeTrue();
            result.Value!.IsSuspended.Should().BeTrue();
            _userRepoMock.Verify(r => r.UpdateAsync(employee, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task SuspendAsync_WhenActive_SendsSuspensionEmail()
        {
            var employee = ActiveEmployee();
            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(10, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);
            _userRepoMock
                .Setup(r => r.UpdateAsync(employee, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);

            await _sut.SuspendAsync(10, "Comportement inapproprie envers les utilisateurs", AdminId, CancellationToken.None);

            _emailServiceMock.Verify(
                e => e.SendAccountSuspendedEmailAsync(
                    "legolas@example.com", "Legolas",
                    "Comportement inapproprie envers les utilisateurs",
                    It.IsAny<CancellationToken>()),
                Times.Once);
        }

        [Fact]
        public async Task SuspendAsync_WhenAlreadySuspended_ReturnsFailure400()
        {
            var employee = SuspendedEmployee();
            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(11, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);

            var result = await _sut.SuspendAsync(11, "Motif valide de suspension", AdminId, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(400);
        }

        [Fact]
        public async Task SuspendAsync_WhenNotEmployeeRole_ReturnsFailure403()
        {
            var user = RegularUser();
            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(20, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            var result = await _sut.SuspendAsync(20, "Motif valide de suspension", AdminId, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(403);
        }

        [Fact]
        public async Task SuspendAsync_WhenNotFound_ReturnsFailure404()
        {
            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((User?)null);

            var result = await _sut.SuspendAsync(999, "Motif valide de suspension", AdminId, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(404);
        }

        // -- ReactivateAsync -----------------------------------------------------

        [Fact]
        public async Task ReactivateAsync_WhenSuspended_SetsIsSuspendedFalse()
        {
            var employee = SuspendedEmployee();
            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(11, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);
            _userRepoMock
                .Setup(r => r.UpdateAsync(employee, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);

            var result = await _sut.ReactivateAsync(11, AdminId, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            employee.IsSuspended.Should().BeFalse();
            result.Value!.IsSuspended.Should().BeFalse();
        }

        [Fact]
        public async Task ReactivateAsync_WhenSuspended_SendsReactivationEmail()
        {
            var employee = SuspendedEmployee();
            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(11, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);
            _userRepoMock
                .Setup(r => r.UpdateAsync(employee, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);

            await _sut.ReactivateAsync(11, AdminId, CancellationToken.None);

            _emailServiceMock.Verify(
                e => e.SendAccountReactivatedEmailAsync(
                    "boromir@example.com", "Boromir", It.IsAny<CancellationToken>()),
                Times.Once);
        }

        [Fact]
        public async Task ReactivateAsync_WhenNotSuspended_ReturnsFailure400()
        {
            var employee = ActiveEmployee();
            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(10, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);

            var result = await _sut.ReactivateAsync(10, AdminId, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(400);
        }

        [Fact]
        public async Task ReactivateAsync_WhenNotEmployeeRole_ReturnsFailure403()
        {
            var user = RegularUser();
            user.IsSuspended = true;
            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(20, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            var result = await _sut.ReactivateAsync(20, AdminId, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(403);
        }

        // -- DeleteAsync ---------------------------------------------------------

        [Fact]
        public async Task DeleteAsync_WhenFound_DeletesEmployee()
        {
            var employee = ActiveEmployee();
            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(10, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);

            var result = await _sut.DeleteAsync(10, AdminId, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            _userRepoMock.Verify(r => r.DeleteAsync(employee, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task DeleteAsync_WhenFound_SendsEmailBeforeDeletion()
        {
            var employee = ActiveEmployee();
            var callOrder = new List<string>();

            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(10, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);
            _emailServiceMock
                .Setup(e => e.SendAccountDeletedEmailAsync(
                    It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .Callback(() => callOrder.Add("email"));
            _userRepoMock
                .Setup(r => r.DeleteAsync(employee, It.IsAny<CancellationToken>()))
                .Callback(() => callOrder.Add("delete"));

            await _sut.DeleteAsync(10, AdminId, CancellationToken.None);

            callOrder.Should().ContainInOrder("email", "delete");
        }

        [Fact]
        public async Task DeleteAsync_WhenNotEmployeeRole_ReturnsFailure403()
        {
            var user = RegularUser();
            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(20, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            var result = await _sut.DeleteAsync(20, AdminId, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(403);
        }

        [Fact]
        public async Task DeleteAsync_WhenNotFound_ReturnsFailure404()
        {
            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((User?)null);

            var result = await _sut.DeleteAsync(999, AdminId, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(404);
        }

        [Fact]
        public async Task DeleteAsync_WhenEmailFails_StillDeletes()
        {
            var employee = ActiveEmployee();
            _userRepoMock
                .Setup(r => r.GetByIdWithRoleAsync(10, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);
            _emailServiceMock
                .Setup(e => e.SendAccountDeletedEmailAsync(
                    It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new InvalidOperationException("Email service unavailable"));

            var result = await _sut.DeleteAsync(10, AdminId, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            _userRepoMock.Verify(r => r.DeleteAsync(employee, It.IsAny<CancellationToken>()), Times.Once);
        }
    }
}
