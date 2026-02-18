using FantasyRealm.Application.Interfaces;
using FantasyRealm.Application.Services;
using FluentAssertions;
using Moq;

namespace FantasyRealm.Tests.Unit.Services
{
    /// <summary>
    /// Unit tests for <see cref="AdminService"/>.
    /// </summary>
    [Trait("Category", "Unit")]
    [Trait("Category", "Admin")]
    public class AdminServiceTests
    {
        private readonly Mock<IUserRepository> _userRepoMock = new();
        private readonly Mock<ICharacterRepository> _characterRepoMock = new();
        private readonly Mock<ICommentRepository> _commentRepoMock = new();
        private readonly AdminService _sut;

        public AdminServiceTests()
        {
            _sut = new AdminService(
                _userRepoMock.Object,
                _characterRepoMock.Object,
                _commentRepoMock.Object);
        }

        private void SetupAllCounts(int users, int suspended, int employees, int characters, int pendingChars, int comments, int pendingComments)
        {
            _userRepoMock
                .Setup(r => r.CountByRoleAsync("User", It.IsAny<CancellationToken>()))
                .ReturnsAsync(users);
            _userRepoMock
                .Setup(r => r.CountSuspendedAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(suspended);
            _userRepoMock
                .Setup(r => r.CountByRoleAsync("Employee", It.IsAny<CancellationToken>()))
                .ReturnsAsync(employees);
            _characterRepoMock
                .Setup(r => r.CountAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(characters);
            _characterRepoMock
                .Setup(r => r.CountPendingAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(pendingChars);
            _commentRepoMock
                .Setup(r => r.CountAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(comments);
            _commentRepoMock
                .Setup(r => r.CountPendingAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(pendingComments);
        }

        [Fact]
        public async Task GetStatsAsync_ShouldReturnAggregatedStats()
        {
            SetupAllCounts(users: 42, suspended: 3, employees: 5, characters: 120, pendingChars: 8, comments: 200, pendingComments: 15);

            var result = await _sut.GetStatsAsync();

            result.IsSuccess.Should().BeTrue();
            result.Value.Should().NotBeNull();
            result.Value!.TotalUsers.Should().Be(42);
            result.Value.SuspendedUsers.Should().Be(3);
            result.Value.TotalEmployees.Should().Be(5);
            result.Value.TotalCharacters.Should().Be(120);
            result.Value.PendingCharacters.Should().Be(8);
            result.Value.TotalComments.Should().Be(200);
            result.Value.PendingComments.Should().Be(15);
        }

        [Fact]
        public async Task GetStatsAsync_ShouldCallAllRepositoriesWithCorrectLabels()
        {
            SetupAllCounts(users: 0, suspended: 0, employees: 0, characters: 0, pendingChars: 0, comments: 0, pendingComments: 0);

            await _sut.GetStatsAsync();

            _userRepoMock.Verify(r => r.CountByRoleAsync("User", It.IsAny<CancellationToken>()), Times.Once);
            _userRepoMock.Verify(r => r.CountByRoleAsync("Employee", It.IsAny<CancellationToken>()), Times.Once);
            _userRepoMock.Verify(r => r.CountSuspendedAsync(It.IsAny<CancellationToken>()), Times.Once);
            _characterRepoMock.Verify(r => r.CountAllAsync(It.IsAny<CancellationToken>()), Times.Once);
            _characterRepoMock.Verify(r => r.CountPendingAsync(It.IsAny<CancellationToken>()), Times.Once);
            _commentRepoMock.Verify(r => r.CountAllAsync(It.IsAny<CancellationToken>()), Times.Once);
            _commentRepoMock.Verify(r => r.CountPendingAsync(It.IsAny<CancellationToken>()), Times.Once);
        }
    }
}
