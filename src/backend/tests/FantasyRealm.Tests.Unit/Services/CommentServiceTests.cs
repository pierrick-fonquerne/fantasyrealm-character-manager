using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using FantasyRealm.Application.Services;
using FantasyRealm.Domain.Entities;
using FantasyRealm.Domain.Enums;
using FluentAssertions;
using Moq;

namespace FantasyRealm.Tests.Unit.Services
{
    /// <summary>
    /// Unit tests for <see cref="CommentService"/>.
    /// </summary>
    [Trait("Category", "Unit")]
    [Trait("Category", "Comment")]
    public class CommentServiceTests
    {
        private readonly Mock<ICommentRepository> _commentRepoMock = new();
        private readonly Mock<ICharacterRepository> _characterRepoMock = new();
        private readonly CommentService _sut;

        public CommentServiceTests()
        {
            _sut = new CommentService(_commentRepoMock.Object, _characterRepoMock.Object);
        }

        private static CreateCommentRequest ValidRequest() => new(4, "Un personnage vraiment impressionnant !");

        private static Character ApprovedCharacter(int id = 1, int ownerId = 10) => new()
        {
            Id = id,
            Name = "Arthas",
            ClassId = 1,
            Gender = Gender.Male,
            Status = CharacterStatus.Approved,
            SkinColor = "#E8BEAC",
            EyeColor = "#4A90D9",
            HairColor = "#2C1810",
            HairStyle = "court",
            EyeShape = "amande",
            NoseShape = "droit",
            MouthShape = "fine",
            FaceShape = "ovale",
            UserId = ownerId,
            Class = new CharacterClass { Id = 1, Name = "Guerrier", Description = "Un combattant robuste." }
        };

        private static Comment ApprovedComment(int id = 1, int characterId = 1, int authorId = 20) => new()
        {
            Id = id,
            Rating = 4,
            Text = "Un personnage vraiment impressionnant !",
            Status = CommentStatus.Approved,
            CommentedAt = DateTime.UtcNow,
            CharacterId = characterId,
            AuthorId = authorId,
            Author = new User { Id = authorId, Pseudo = "Reviewer" }
        };

        private static Comment PendingComment(int id = 2, int characterId = 1, int authorId = 30) => new()
        {
            Id = id,
            Rating = 3,
            Text = "Un personnage assez basique mais correct.",
            Status = CommentStatus.Pending,
            CommentedAt = DateTime.UtcNow,
            CharacterId = characterId,
            AuthorId = authorId,
            Author = new User { Id = authorId, Pseudo = "AnotherUser" }
        };

        private void SetupCharacterExists(Character character)
        {
            _characterRepoMock
                .Setup(r => r.GetByIdAsync(character.Id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(character);
        }

        private void SetupNoDuplicate(int characterId, int authorId)
        {
            _commentRepoMock
                .Setup(r => r.GetByCharacterAndAuthorAsync(characterId, authorId, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Comment?)null);
        }

        private void SetupAddReturnsComment()
        {
            _commentRepoMock
                .Setup(r => r.AddAsync(It.IsAny<Comment>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((Comment c, CancellationToken _) =>
                {
                    c.Id = 99;
                    c.Author = new User { Id = c.AuthorId, Pseudo = "Reviewer" };
                    return c;
                });
        }

        // ── CreateAsync ──────────────────────────────────────────────────

        [Fact]
        public async Task CreateAsync_WithValidData_ReturnsSuccess()
        {
            var character = ApprovedCharacter();
            SetupCharacterExists(character);
            SetupNoDuplicate(character.Id, 20);
            SetupAddReturnsComment();

            var result = await _sut.CreateAsync(character.Id, ValidRequest(), 20, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.Rating.Should().Be(4);
            result.Value.AuthorPseudo.Should().Be("Reviewer");
        }

        [Fact]
        public async Task CreateAsync_CharacterNotFound_ReturnsFailure()
        {
            _characterRepoMock
                .Setup(r => r.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Character?)null);

            var result = await _sut.CreateAsync(999, ValidRequest(), 20, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(404);
        }

        [Fact]
        public async Task CreateAsync_CharacterNotApproved_ReturnsFailure()
        {
            var character = ApprovedCharacter();
            character.Status = CharacterStatus.Draft;
            SetupCharacterExists(character);

            var result = await _sut.CreateAsync(character.Id, ValidRequest(), 20, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.Error.Should().Contain("approuvés");
        }

        [Fact]
        public async Task CreateAsync_AuthorIsOwner_ReturnsFailure()
        {
            var character = ApprovedCharacter(ownerId: 20);
            SetupCharacterExists(character);

            var result = await _sut.CreateAsync(character.Id, ValidRequest(), 20, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.Error.Should().Contain("propre personnage");
        }

        [Fact]
        public async Task CreateAsync_DuplicateComment_ReturnsConflict()
        {
            var character = ApprovedCharacter();
            SetupCharacterExists(character);
            _commentRepoMock
                .Setup(r => r.GetByCharacterAndAuthorAsync(character.Id, 20, It.IsAny<CancellationToken>()))
                .ReturnsAsync(ApprovedComment());

            var result = await _sut.CreateAsync(character.Id, ValidRequest(), 20, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(409);
        }

        [Fact]
        public async Task CreateAsync_SetsStatusToPending()
        {
            var character = ApprovedCharacter();
            SetupCharacterExists(character);
            SetupNoDuplicate(character.Id, 20);
            SetupAddReturnsComment();

            var result = await _sut.CreateAsync(character.Id, ValidRequest(), 20, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.Status.Should().Be("Pending");
        }

        [Fact]
        public async Task CreateAsync_MapsFieldsCorrectly()
        {
            var character = ApprovedCharacter();
            SetupCharacterExists(character);
            SetupNoDuplicate(character.Id, 20);
            SetupAddReturnsComment();

            var request = new CreateCommentRequest(5, "Excellent travail sur ce personnage !");
            var result = await _sut.CreateAsync(character.Id, request, 20, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.Rating.Should().Be(5);
            result.Value.Text.Should().Be("Excellent travail sur ce personnage !");
            result.Value.CharacterId.Should().Be(character.Id);
            result.Value.AuthorId.Should().Be(20);
        }

        [Theory]
        [InlineData(0)]
        [InlineData(6)]
        public async Task CreateAsync_InvalidRating_ReturnsFailure(int rating)
        {
            var result = await _sut.CreateAsync(1, new CreateCommentRequest(rating, "Un commentaire valide pour le test."), 20, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.Error.Should().Contain("note");
        }

        [Fact]
        public async Task CreateAsync_TextTooShort_ReturnsFailure()
        {
            var result = await _sut.CreateAsync(1, new CreateCommentRequest(4, "Court"), 20, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.Error.Should().Contain("10 caractères");
        }

        // ── GetByCharacterAsync ──────────────────────────────────────────

        [Fact]
        public async Task GetByCharacterAsync_ReturnsOnlyApproved()
        {
            var character = ApprovedCharacter();
            SetupCharacterExists(character);
            _commentRepoMock
                .Setup(r => r.GetApprovedByCharacterAsync(character.Id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<Comment> { ApprovedComment() });

            var result = await _sut.GetByCharacterAsync(character.Id, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value.Should().HaveCount(1);
            result.Value![0].Status.Should().Be("Approved");
        }

        [Fact]
        public async Task GetByCharacterAsync_NoComments_ReturnsEmptyList()
        {
            var character = ApprovedCharacter();
            SetupCharacterExists(character);
            _commentRepoMock
                .Setup(r => r.GetApprovedByCharacterAsync(character.Id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<Comment>());

            var result = await _sut.GetByCharacterAsync(character.Id, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value.Should().BeEmpty();
        }

        [Fact]
        public async Task GetByCharacterAsync_CharacterNotFound_ReturnsFailure()
        {
            _characterRepoMock
                .Setup(r => r.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Character?)null);

            var result = await _sut.GetByCharacterAsync(999, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(404);
        }

        [Fact]
        public async Task GetByCharacterAsync_IncludesAuthorPseudo()
        {
            var character = ApprovedCharacter();
            SetupCharacterExists(character);
            _commentRepoMock
                .Setup(r => r.GetApprovedByCharacterAsync(character.Id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<Comment> { ApprovedComment() });

            var result = await _sut.GetByCharacterAsync(character.Id, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value![0].AuthorPseudo.Should().Be("Reviewer");
        }

        // ── DeleteAsync ──────────────────────────────────────────────────

        [Fact]
        public async Task DeleteAsync_AsAuthor_ReturnsSuccess()
        {
            var comment = ApprovedComment(authorId: 20);
            _commentRepoMock
                .Setup(r => r.GetByIdAsync(comment.Id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(comment);

            var result = await _sut.DeleteAsync(comment.Id, 20, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            _commentRepoMock.Verify(r => r.DeleteAsync(comment, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task DeleteAsync_CommentNotFound_ReturnsFailure()
        {
            _commentRepoMock
                .Setup(r => r.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Comment?)null);

            var result = await _sut.DeleteAsync(999, 20, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(404);
        }

        [Fact]
        public async Task DeleteAsync_NotAuthor_ReturnsFailure()
        {
            var comment = ApprovedComment(authorId: 20);
            _commentRepoMock
                .Setup(r => r.GetByIdAsync(comment.Id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(comment);

            var result = await _sut.DeleteAsync(comment.Id, 99, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(403);
        }
    }
}
