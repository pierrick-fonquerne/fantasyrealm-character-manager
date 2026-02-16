using FantasyRealm.Application.DTOs;
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
    /// Unit tests for <see cref="ModerationService"/>.
    /// </summary>
    [Trait("Category", "Unit")]
    [Trait("Category", "Moderation")]
    public class ModerationServiceTests
    {
        private readonly Mock<ICharacterRepository> _characterRepoMock = new();
        private readonly Mock<IEmailService> _emailServiceMock = new();
        private readonly Mock<ILogger<ModerationService>> _loggerMock = new();
        private readonly ModerationService _sut;

        public ModerationServiceTests()
        {
            _sut = new ModerationService(
                _characterRepoMock.Object,
                _emailServiceMock.Object,
                _loggerMock.Object);
        }

        private static Character PendingCharacter(int id = 1) => new()
        {
            Id = id,
            Name = "Arthas",
            ClassId = 1,
            Gender = Gender.Male,
            Status = CharacterStatus.Pending,
            SkinColor = "#E8BEAC",
            EyeColor = "#4A90D9",
            HairColor = "#2C1810",
            HairStyle = "court",
            EyeShape = "amande",
            NoseShape = "droit",
            MouthShape = "fine",
            FaceShape = "ovale",
            IsShared = false,
            CreatedAt = DateTime.UtcNow.AddDays(-2),
            UpdatedAt = DateTime.UtcNow.AddHours(-1),
            UserId = 10,
            User = new User { Id = 10, Pseudo = "TestUser", Email = "test@example.com" },
            Class = new CharacterClass { Id = 1, Name = "Guerrier", Description = "Un combattant." }
        };

        // ── GetPendingCharactersAsync ───────────────────────────────────

        [Fact]
        public async Task GetPendingCharactersAsync_ReturnsPagedResults()
        {
            var items = new List<PendingCharacterResponse>
            {
                new(1, "Arthas", "Guerrier", "Male", "#E8BEAC", "#4A90D9", "#2C1810",
                    "court", "amande", "droit", "fine", "ovale", "TestUser", DateTime.UtcNow)
            };

            _characterRepoMock
                .Setup(r => r.GetPendingForModerationAsync(1, 12, It.IsAny<CancellationToken>()))
                .ReturnsAsync((items.AsReadOnly() as IReadOnlyList<PendingCharacterResponse>, 1));

            var result = await _sut.GetPendingCharactersAsync(1, 12, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.Items.Should().HaveCount(1);
            result.Value.TotalCount.Should().Be(1);
            result.Value.Page.Should().Be(1);
        }

        [Fact]
        public async Task GetPendingCharactersAsync_WithInvalidPage_ReturnsFailure()
        {
            var result = await _sut.GetPendingCharactersAsync(0, 12, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
        }

        [Fact]
        public async Task GetPendingCharactersAsync_WithPageExceedingLimit_ReturnsFailure()
        {
            var result = await _sut.GetPendingCharactersAsync(1001, 12, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
        }

        [Fact]
        public async Task GetPendingCharactersAsync_WithNoResults_ReturnsEmpty()
        {
            _characterRepoMock
                .Setup(r => r.GetPendingForModerationAsync(1, 12, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Array.Empty<PendingCharacterResponse>() as IReadOnlyList<PendingCharacterResponse>, 0));

            var result = await _sut.GetPendingCharactersAsync(1, 12, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.Items.Should().BeEmpty();
            result.Value.TotalCount.Should().Be(0);
        }

        // ── ApproveAsync ────────────────────────────────────────────────

        [Fact]
        public async Task ApproveAsync_WhenPending_SetsStatusToApproved()
        {
            var character = PendingCharacter();
            _characterRepoMock
                .Setup(r => r.GetByIdWithUserAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(character);

            var result = await _sut.ApproveAsync(1, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.Status.Should().Be("Approved");
            character.Status.Should().Be(CharacterStatus.Approved);
            _characterRepoMock.Verify(r => r.UpdateAsync(character, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task ApproveAsync_WhenPending_SendsEmail()
        {
            var character = PendingCharacter();
            _characterRepoMock
                .Setup(r => r.GetByIdWithUserAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(character);

            await _sut.ApproveAsync(1, CancellationToken.None);

            _emailServiceMock.Verify(
                e => e.SendCharacterApprovedEmailAsync("test@example.com", "TestUser", "Arthas", It.IsAny<CancellationToken>()),
                Times.Once);
        }

        [Fact]
        public async Task ApproveAsync_WhenNotFound_ReturnsFailure404()
        {
            _characterRepoMock
                .Setup(r => r.GetByIdWithUserAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Character?)null);

            var result = await _sut.ApproveAsync(999, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(404);
        }

        [Fact]
        public async Task ApproveAsync_WhenNotPending_ReturnsFailure400()
        {
            var character = PendingCharacter();
            character.Status = CharacterStatus.Draft;
            _characterRepoMock
                .Setup(r => r.GetByIdWithUserAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(character);

            var result = await _sut.ApproveAsync(1, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(400);
        }

        [Fact]
        public async Task ApproveAsync_WhenEmailFails_StillReturnsSuccess()
        {
            var character = PendingCharacter();
            _characterRepoMock
                .Setup(r => r.GetByIdWithUserAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(character);
            _emailServiceMock
                .Setup(e => e.SendCharacterApprovedEmailAsync(
                    It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new InvalidOperationException("Email service unavailable"));

            var result = await _sut.ApproveAsync(1, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.Status.Should().Be("Approved");
        }

        // ── RejectAsync ─────────────────────────────────────────────────

        [Fact]
        public async Task RejectAsync_WhenPending_SetsStatusToRejected()
        {
            var character = PendingCharacter();
            _characterRepoMock
                .Setup(r => r.GetByIdWithUserAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(character);

            var result = await _sut.RejectAsync(1, "Contenu inapproprié", CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.Status.Should().Be("Rejected");
            character.Status.Should().Be(CharacterStatus.Rejected);
            _characterRepoMock.Verify(r => r.UpdateAsync(character, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task RejectAsync_WhenPending_SendsEmailWithReason()
        {
            var character = PendingCharacter();
            _characterRepoMock
                .Setup(r => r.GetByIdWithUserAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(character);

            await _sut.RejectAsync(1, "Nom inapproprié", CancellationToken.None);

            _emailServiceMock.Verify(
                e => e.SendCharacterRejectedEmailAsync(
                    "test@example.com", "TestUser", "Arthas", "Nom inapproprié", It.IsAny<CancellationToken>()),
                Times.Once);
        }

        [Fact]
        public async Task RejectAsync_WithEmptyReason_ReturnsFailure400()
        {
            var result = await _sut.RejectAsync(1, "", CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(400);
        }

        [Fact]
        public async Task RejectAsync_WhenNotPending_ReturnsFailure400()
        {
            var character = PendingCharacter();
            character.Status = CharacterStatus.Approved;
            _characterRepoMock
                .Setup(r => r.GetByIdWithUserAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(character);

            var result = await _sut.RejectAsync(1, "Motif de rejet", CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(400);
        }
    }
}
