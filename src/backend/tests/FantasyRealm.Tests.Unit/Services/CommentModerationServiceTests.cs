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
    /// Unit tests for <see cref="CommentModerationService"/>.
    /// </summary>
    [Trait("Category", "Unit")]
    [Trait("Category", "CommentModeration")]
    public class CommentModerationServiceTests
    {
        private readonly Mock<ICommentRepository> _commentRepoMock = new();
        private readonly Mock<IEmailService> _emailServiceMock = new();
        private readonly Mock<IActivityLogService> _activityLogServiceMock = new();
        private readonly Mock<ILogger<CommentModerationService>> _loggerMock = new();
        private readonly CommentModerationService _sut;

        private const int ReviewerId = 99;

        public CommentModerationServiceTests()
        {
            _sut = new CommentModerationService(
                _commentRepoMock.Object,
                _emailServiceMock.Object,
                _activityLogServiceMock.Object,
                _loggerMock.Object);
        }

        private static Comment PendingComment(int id = 1) => new()
        {
            Id = id,
            Rating = 4,
            Text = "Un personnage vraiment bien réalisé !",
            Status = CommentStatus.Pending,
            CommentedAt = DateTime.UtcNow.AddHours(-3),
            CharacterId = 10,
            Character = new Character
            {
                Id = 10,
                Name = "Gandalf",
                ClassId = 1,
                Gender = Gender.Male,
                Status = CharacterStatus.Approved,
                SkinColor = "#E8BEAC",
                EyeColor = "#4A90D9",
                HairColor = "#CCCCCC",
                HairStyle = "long",
                EyeShape = "amande",
                NoseShape = "aquilin",
                MouthShape = "fine",
                FaceShape = "ovale",
                UserId = 20
            },
            AuthorId = 5,
            Author = new User { Id = 5, Pseudo = "Frodon", Email = "frodon@example.com" }
        };

        // ── GetPendingCommentsAsync ──────────────────────────────────────

        [Fact]
        public async Task GetPendingCommentsAsync_ReturnsPagedResults()
        {
            var comments = new List<Comment> { PendingComment() };
            _commentRepoMock
                .Setup(r => r.GetPendingAsync(1, 12, It.IsAny<CancellationToken>()))
                .ReturnsAsync((comments.AsReadOnly() as IReadOnlyList<Comment>, 1));

            var result = await _sut.GetPendingCommentsAsync(1, 12, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.Items.Should().HaveCount(1);
            result.Value.Items[0].CharacterName.Should().Be("Gandalf");
            result.Value.Items[0].AuthorPseudo.Should().Be("Frodon");
            result.Value.TotalCount.Should().Be(1);
            result.Value.Page.Should().Be(1);
        }

        [Fact]
        public async Task GetPendingCommentsAsync_WithNoResults_ReturnsEmpty()
        {
            _commentRepoMock
                .Setup(r => r.GetPendingAsync(1, 12, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Array.Empty<Comment>() as IReadOnlyList<Comment>, 0));

            var result = await _sut.GetPendingCommentsAsync(1, 12, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.Items.Should().BeEmpty();
            result.Value.TotalCount.Should().Be(0);
        }

        [Fact]
        public async Task GetPendingCommentsAsync_WithInvalidPage_ReturnsFailure()
        {
            var result = await _sut.GetPendingCommentsAsync(0, 12, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
        }

        // ── ApproveAsync ─────────────────────────────────────────────────

        [Fact]
        public async Task ApproveAsync_WhenPending_SetsStatusToApproved()
        {
            var comment = PendingComment();
            _commentRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(comment);

            var result = await _sut.ApproveAsync(1, ReviewerId, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.Status.Should().Be("Approved");
            comment.Status.Should().Be(CommentStatus.Approved);
            _commentRepoMock.Verify(r => r.UpdateAsync(comment, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task ApproveAsync_WhenPending_SetsReviewerInfo()
        {
            var comment = PendingComment();
            _commentRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(comment);

            await _sut.ApproveAsync(1, ReviewerId, CancellationToken.None);

            comment.ReviewedById.Should().Be(ReviewerId);
            comment.ReviewedAt.Should().NotBeNull();
            comment.ReviewedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        }

        [Fact]
        public async Task ApproveAsync_WhenPending_SendsEmail()
        {
            var comment = PendingComment();
            _commentRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(comment);

            await _sut.ApproveAsync(1, ReviewerId, CancellationToken.None);

            _emailServiceMock.Verify(
                e => e.SendCommentApprovedEmailAsync("frodon@example.com", "Frodon", "Gandalf", It.IsAny<CancellationToken>()),
                Times.Once);
        }

        [Fact]
        public async Task ApproveAsync_WhenNotFound_ReturnsFailure404()
        {
            _commentRepoMock
                .Setup(r => r.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Comment?)null);

            var result = await _sut.ApproveAsync(999, ReviewerId, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(404);
        }

        [Fact]
        public async Task ApproveAsync_WhenAlreadyApproved_ReturnsFailure400()
        {
            var comment = PendingComment();
            comment.Status = CommentStatus.Approved;
            _commentRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(comment);

            var result = await _sut.ApproveAsync(1, ReviewerId, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(400);
        }

        [Fact]
        public async Task ApproveAsync_WhenAlreadyRejected_ReturnsFailure400()
        {
            var comment = PendingComment();
            comment.Status = CommentStatus.Rejected;
            _commentRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(comment);

            var result = await _sut.ApproveAsync(1, ReviewerId, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(400);
        }

        [Fact]
        public async Task ApproveAsync_WhenEmailFails_StillReturnsSuccess()
        {
            var comment = PendingComment();
            _commentRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(comment);
            _emailServiceMock
                .Setup(e => e.SendCommentApprovedEmailAsync(
                    It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new InvalidOperationException("Email service unavailable"));

            var result = await _sut.ApproveAsync(1, ReviewerId, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.Status.Should().Be("Approved");
        }

        // ── RejectAsync ──────────────────────────────────────────────────

        [Fact]
        public async Task RejectAsync_WhenPending_SetsStatusToRejected()
        {
            var comment = PendingComment();
            _commentRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(comment);

            var result = await _sut.RejectAsync(1, "Contenu inapproprié", ReviewerId, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.Status.Should().Be("Rejected");
            result.Value.RejectionReason.Should().Be("Contenu inapproprié");
            comment.Status.Should().Be(CommentStatus.Rejected);
            comment.RejectionReason.Should().Be("Contenu inapproprié");
            _commentRepoMock.Verify(r => r.UpdateAsync(comment, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task RejectAsync_WhenPending_SetsReviewerInfo()
        {
            var comment = PendingComment();
            _commentRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(comment);

            await _sut.RejectAsync(1, "Contenu inapproprié", ReviewerId, CancellationToken.None);

            comment.ReviewedById.Should().Be(ReviewerId);
            comment.ReviewedAt.Should().NotBeNull();
        }

        [Fact]
        public async Task RejectAsync_WhenPending_SendsEmailWithReason()
        {
            var comment = PendingComment();
            _commentRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(comment);

            await _sut.RejectAsync(1, "Langage vulgaire", ReviewerId, CancellationToken.None);

            _emailServiceMock.Verify(
                e => e.SendCommentRejectedEmailAsync(
                    "frodon@example.com", "Frodon", "Gandalf", "Langage vulgaire", It.IsAny<CancellationToken>()),
                Times.Once);
        }

        [Fact]
        public async Task RejectAsync_WithEmptyReason_ReturnsFailure400()
        {
            var comment = PendingComment();
            _commentRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(comment);

            var result = await _sut.RejectAsync(1, "", ReviewerId, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(400);
        }

        [Fact]
        public async Task RejectAsync_WithReasonTooShort_ReturnsFailure400()
        {
            var comment = PendingComment();
            _commentRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(comment);

            var result = await _sut.RejectAsync(1, "Court", ReviewerId, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(400);
        }

        [Fact]
        public async Task RejectAsync_WithReasonTooLong_ReturnsFailure400()
        {
            var comment = PendingComment();
            _commentRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(comment);

            var longReason = new string('x', 501);
            var result = await _sut.RejectAsync(1, longReason, ReviewerId, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(400);
        }

        [Fact]
        public async Task RejectAsync_TrimsReasonBeforeStoring()
        {
            var comment = PendingComment();
            _commentRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(comment);

            await _sut.RejectAsync(1, "  Contenu inapproprié  ", ReviewerId, CancellationToken.None);

            comment.RejectionReason.Should().Be("Contenu inapproprié");
        }

        [Fact]
        public async Task RejectAsync_WhenNotFound_ReturnsFailure404()
        {
            _commentRepoMock
                .Setup(r => r.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Comment?)null);

            var result = await _sut.RejectAsync(999, "Motif de rejet", ReviewerId, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(404);
        }

        [Fact]
        public async Task RejectAsync_WhenNotPending_ReturnsFailure400()
        {
            var comment = PendingComment();
            comment.Status = CommentStatus.Approved;
            _commentRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(comment);

            var result = await _sut.RejectAsync(1, "Motif de rejet", ReviewerId, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(400);
        }
    }
}
