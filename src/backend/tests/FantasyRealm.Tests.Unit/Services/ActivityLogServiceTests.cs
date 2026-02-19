using FantasyRealm.Application.Interfaces;
using FantasyRealm.Application.Services;
using FantasyRealm.Domain.Entities;
using FantasyRealm.Domain.Enums;
using FluentAssertions;
using MongoDB.Bson;
using Moq;

namespace FantasyRealm.Tests.Unit.Services
{
    /// <summary>
    /// Unit tests for <see cref="ActivityLogService"/>.
    /// </summary>
    [Trait("Category", "Unit")]
    [Trait("Category", "ActivityLog")]
    public class ActivityLogServiceTests
    {
        private readonly Mock<IActivityLogRepository> _repoMock = new();
        private readonly Mock<ICurrentUserService> _currentUserMock = new();
        private readonly ActivityLogService _sut;

        public ActivityLogServiceTests()
        {
            _currentUserMock.Setup(c => c.UserId).Returns(100);
            _currentUserMock.Setup(c => c.Pseudo).Returns("AdminOne");

            _sut = new ActivityLogService(
                _repoMock.Object,
                _currentUserMock.Object);
        }

        [Fact]
        public async Task LogAsync_WithValidData_InsertsLogWithCorrectActor()
        {
            ActivityLog? captured = null;
            _repoMock
                .Setup(r => r.LogAsync(It.IsAny<ActivityLog>(), It.IsAny<CancellationToken>()))
                .Callback<ActivityLog, CancellationToken>((log, _) => captured = log);

            await _sut.LogAsync(ActivityAction.EmployeeCreated, "User", 42, "employe1", null, CancellationToken.None);

            captured.Should().NotBeNull();
            captured!.UserId.Should().Be(100);
            captured.UserPseudo.Should().Be("AdminOne");
            captured.Action.Should().Be(ActivityAction.EmployeeCreated);
            captured.TargetType.Should().Be("User");
            captured.TargetId.Should().Be(42);
            captured.TargetName.Should().Be("employe1");
            captured.Details.Should().BeNull();
        }

        [Fact]
        public async Task LogAsync_WithDetails_StoresDetailsInBsonDocument()
        {
            ActivityLog? captured = null;
            _repoMock
                .Setup(r => r.LogAsync(It.IsAny<ActivityLog>(), It.IsAny<CancellationToken>()))
                .Callback<ActivityLog, CancellationToken>((log, _) => captured = log);

            await _sut.LogAsync(ActivityAction.EmployeeSuspended, "User", 10, "employe2", "Comportement inapproprié", CancellationToken.None);

            captured.Should().NotBeNull();
            captured!.Details.Should().NotBeNull();
            captured.Details!["message"].AsString.Should().Be("Comportement inapproprié");
        }

        [Fact]
        public async Task GetLogsAsync_WithValidPage_ReturnsPaginatedResponse()
        {
            var logs = new List<ActivityLog>
            {
                new()
                {
                    Id = ObjectId.GenerateNewId(),
                    Action = ActivityAction.EmployeeCreated,
                    UserId = 100,
                    UserPseudo = "AdminOne",
                    TargetType = "User",
                    TargetId = 42,
                    Timestamp = DateTime.UtcNow
                }
            };

            _repoMock
                .Setup(r => r.GetLogsAsync(1, 20, null, null, null, It.IsAny<CancellationToken>()))
                .ReturnsAsync((logs, 1L));

            var result = await _sut.GetLogsAsync(1, 20, null, null, null, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.Items.Should().HaveCount(1);
            result.Value.TotalCount.Should().Be(1);
            result.Value.Items[0].Action.Should().Be("EmployeeCreated");
            result.Value.Items[0].ActorPseudo.Should().Be("AdminOne");
        }

        [Fact]
        public async Task GetLogsAsync_WithInvalidPage_ReturnsFailure()
        {
            var result = await _sut.GetLogsAsync(0, 20, null, null, null, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
        }

    }
}
