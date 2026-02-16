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
    /// Unit tests for <see cref="CharacterService"/>.
    /// </summary>
    [Trait("Category", "Unit")]
    [Trait("Category", "Character")]
    public class CharacterServiceTests
    {
        private readonly Mock<ICharacterRepository> _characterRepoMock = new();
        private readonly Mock<IReferenceDataRepository> _referenceDataRepoMock = new();
        private readonly CharacterService _sut;

        public CharacterServiceTests()
        {
            _sut = new CharacterService(_characterRepoMock.Object, _referenceDataRepoMock.Object);
            SetupDefaultClasses();
        }

        private void SetupDefaultClasses()
        {
            _referenceDataRepoMock
                .Setup(r => r.GetAllClassesAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<CharacterClass>
                {
                    new() { Id = 1, Name = "Guerrier", Description = "Un combattant robuste.", IconUrl = null },
                    new() { Id = 2, Name = "Mage", Description = "Un lanceur de sorts.", IconUrl = null }
                });
        }

        private static CreateCharacterRequest ValidRequest() => new(
            "Arthas", 1, "Male", "#E8BEAC", "#4A90D9", "#2C1810",
            "court", "amande", "droit", "fine", "ovale");

        private static Character CharacterWithClass(int id = 1, int userId = 10) => new()
        {
            Id = id,
            Name = "Arthas",
            ClassId = 1,
            Gender = Gender.Male,
            Status = CharacterStatus.Draft,
            SkinColor = "#E8BEAC",
            EyeColor = "#4A90D9",
            HairColor = "#2C1810",
            HairStyle = "court",
            EyeShape = "amande",
            NoseShape = "droit",
            MouthShape = "fine",
            FaceShape = "ovale",
            UserId = userId,
            Class = new CharacterClass { Id = 1, Name = "Guerrier", Description = "Un combattant robuste." }
        };

        // ── CreateAsync ──────────────────────────────────────────────────

        [Fact]
        public async Task CreateAsync_WithValidData_ReturnsSuccess()
        {
            _characterRepoMock
                .Setup(r => r.ExistsByNameAndUserAsync("Arthas", 10, null, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);
            _characterRepoMock
                .Setup(r => r.CreateAsync(It.IsAny<Character>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((Character c, CancellationToken _) =>
                {
                    c.Id = 1;
                    c.Class = new CharacterClass { Id = 1, Name = "Guerrier", Description = "Un combattant robuste." };
                    return c;
                });

            var result = await _sut.CreateAsync(10, ValidRequest(), CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.Name.Should().Be("Arthas");
            result.Value.ClassName.Should().Be("Guerrier");
            result.Value.Status.Should().Be("Draft");
        }

        [Fact]
        public async Task CreateAsync_WithInvalidGender_ReturnsFailure()
        {
            var request = ValidRequest() with { Gender = "Invalid" };

            var result = await _sut.CreateAsync(10, request, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.Error.Should().Contain("Genre invalide");
        }

        [Fact]
        public async Task CreateAsync_WithInvalidClassId_ReturnsFailure()
        {
            var request = ValidRequest() with { ClassId = 999 };

            var result = await _sut.CreateAsync(10, request, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.Error.Should().Contain("Classe de personnage invalide");
        }

        [Fact]
        public async Task CreateAsync_WithDuplicateName_Returns409()
        {
            _characterRepoMock
                .Setup(r => r.ExistsByNameAndUserAsync("Arthas", 10, null, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            var result = await _sut.CreateAsync(10, ValidRequest(), CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(409);
        }

        // ── GetByIdAsync ─────────────────────────────────────────────────

        [Fact]
        public async Task GetByIdAsync_WhenOwner_ReturnsSuccessWithIsOwnerTrue()
        {
            _characterRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(CharacterWithClass());

            var result = await _sut.GetByIdAsync(1, 10, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.Id.Should().Be(1);
            result.Value.IsOwner.Should().BeTrue();
        }

        [Fact]
        public async Task GetByIdAsync_WhenOwnerAndApprovedNotShared_ReturnsSuccess()
        {
            var character = CharacterWithClass();
            character.Status = CharacterStatus.Approved;
            character.IsShared = false;
            _characterRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(character);

            var result = await _sut.GetByIdAsync(1, 10, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.IsOwner.Should().BeTrue();
        }

        [Fact]
        public async Task GetByIdAsync_WhenAnonymousAndApprovedShared_ReturnsSuccessWithIsOwnerFalse()
        {
            var character = CharacterWithClass();
            character.Status = CharacterStatus.Approved;
            character.IsShared = true;
            _characterRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(character);

            var result = await _sut.GetByIdAsync(1, null, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.IsOwner.Should().BeFalse();
        }

        [Fact]
        public async Task GetByIdAsync_WhenAnonymousAndDraft_Returns404()
        {
            _characterRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(CharacterWithClass());

            var result = await _sut.GetByIdAsync(1, null, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(404);
        }

        [Fact]
        public async Task GetByIdAsync_WhenAnonymousAndApprovedNotShared_Returns404()
        {
            var character = CharacterWithClass();
            character.Status = CharacterStatus.Approved;
            character.IsShared = false;
            _characterRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(character);

            var result = await _sut.GetByIdAsync(1, null, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(404);
        }

        [Fact]
        public async Task GetByIdAsync_WhenNotOwnerAndPrivate_Returns404()
        {
            _characterRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(CharacterWithClass(userId: 99));

            var result = await _sut.GetByIdAsync(1, 10, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(404);
        }

        [Fact]
        public async Task GetByIdAsync_WhenNotOwnerAndApprovedShared_ReturnsSuccessWithIsOwnerFalse()
        {
            var character = CharacterWithClass(userId: 99);
            character.Status = CharacterStatus.Approved;
            character.IsShared = true;
            _characterRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(character);

            var result = await _sut.GetByIdAsync(1, 10, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.IsOwner.Should().BeFalse();
        }

        [Fact]
        public async Task GetByIdAsync_WhenNotFound_Returns404()
        {
            _characterRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Character?)null);

            var result = await _sut.GetByIdAsync(1, 10, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(404);
        }

        // ── UpdateAsync ──────────────────────────────────────────────────

        [Fact]
        public async Task UpdateAsync_WhenDraftAndOwner_ReturnsSuccess()
        {
            var character = CharacterWithClass();
            _characterRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(character);
            _characterRepoMock
                .Setup(r => r.ExistsByNameAndUserAsync("Arthas", 10, 1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            var request = new UpdateCharacterRequest(
                "Arthas", 1, "Female", "#E8BEAC", "#4A90D9", "#2C1810",
                "long", "rond", "fin", "charnue", "rond");

            var result = await _sut.UpdateAsync(1, 10, request, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.Gender.Should().Be("Female");
        }

        [Fact]
        public async Task UpdateAsync_WhenPending_ReturnsFailure()
        {
            var character = CharacterWithClass();
            character.Status = CharacterStatus.Pending;
            _characterRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(character);

            var result = await _sut.UpdateAsync(1, 10, new UpdateCharacterRequest(
                "Arthas", 1, "Male", "#E8BEAC", "#4A90D9", "#2C1810",
                "court", "amande", "droit", "fine", "ovale"), CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.Error.Should().Contain("brouillon");
        }

        [Fact]
        public async Task UpdateAsync_WhenRejected_ReturnsSuccess()
        {
            var character = CharacterWithClass();
            character.Status = CharacterStatus.Rejected;
            _characterRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(character);
            _characterRepoMock
                .Setup(r => r.ExistsByNameAndUserAsync("Arthas", 10, 1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            var result = await _sut.UpdateAsync(1, 10, new UpdateCharacterRequest(
                "Arthas", 1, "Male", "#E8BEAC", "#4A90D9", "#2C1810",
                "court", "amande", "droit", "fine", "ovale"), CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
        }

        [Fact]
        public async Task UpdateAsync_WhenApprovedAndNameChanged_SetsStatusToPending()
        {
            var character = CharacterWithClass();
            character.Status = CharacterStatus.Approved;
            _characterRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(character);
            _characterRepoMock
                .Setup(r => r.ExistsByNameAndUserAsync("NewName", 10, 1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            var request = new UpdateCharacterRequest(
                "NewName", 1, "Male", "#E8BEAC", "#4A90D9", "#2C1810",
                "court", "amande", "droit", "fine", "ovale");

            var result = await _sut.UpdateAsync(1, 10, request, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.Status.Should().Be("Pending");
            character.Status.Should().Be(CharacterStatus.Pending);
        }

        [Fact]
        public async Task UpdateAsync_WhenApprovedAndNameUnchanged_KeepsApprovedStatus()
        {
            var character = CharacterWithClass();
            character.Status = CharacterStatus.Approved;
            _characterRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(character);
            _characterRepoMock
                .Setup(r => r.ExistsByNameAndUserAsync("Arthas", 10, 1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            var request = new UpdateCharacterRequest(
                "Arthas", 1, "Female", "#FFFFFF", "#000000", "#111111",
                "long", "rond", "fin", "charnue", "rond");

            var result = await _sut.UpdateAsync(1, 10, request, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.Status.Should().Be("Approved");
            character.Status.Should().Be(CharacterStatus.Approved);
        }

        [Fact]
        public async Task UpdateAsync_WhenApprovedAndNameChanged_ResetsIsShared()
        {
            var character = CharacterWithClass();
            character.Status = CharacterStatus.Approved;
            character.IsShared = true;
            _characterRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(character);
            _characterRepoMock
                .Setup(r => r.ExistsByNameAndUserAsync("RenamedHero", 10, 1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            var request = new UpdateCharacterRequest(
                "RenamedHero", 1, "Male", "#E8BEAC", "#4A90D9", "#2C1810",
                "court", "amande", "droit", "fine", "ovale");

            var result = await _sut.UpdateAsync(1, 10, request, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            character.IsShared.Should().BeFalse();
            character.Status.Should().Be(CharacterStatus.Pending);
        }

        // ── DeleteAsync ──────────────────────────────────────────────────

        [Fact]
        public async Task DeleteAsync_WhenOwner_ReturnsSuccess()
        {
            _characterRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(CharacterWithClass());

            var result = await _sut.DeleteAsync(1, 10, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            _characterRepoMock.Verify(r => r.DeleteAsync(It.IsAny<Character>(), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task DeleteAsync_WhenNotOwner_Returns403()
        {
            _characterRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(CharacterWithClass(userId: 99));

            var result = await _sut.DeleteAsync(1, 10, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(403);
        }

        // ── SubmitForReviewAsync ─────────────────────────────────────────

        [Fact]
        public async Task SubmitForReviewAsync_WhenDraft_ChangesToPending()
        {
            var character = CharacterWithClass();
            _characterRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(character);

            var result = await _sut.SubmitForReviewAsync(1, 10, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.Status.Should().Be("Pending");
            character.Status.Should().Be(CharacterStatus.Pending);
        }

        [Fact]
        public async Task SubmitForReviewAsync_WhenApproved_ReturnsFailure()
        {
            var character = CharacterWithClass();
            character.Status = CharacterStatus.Approved;
            _characterRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(character);

            var result = await _sut.SubmitForReviewAsync(1, 10, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.Error.Should().Contain("brouillon ou rejetés");
        }

        [Fact]
        public async Task SubmitForReviewAsync_WhenRejected_ChangesToPending()
        {
            var character = CharacterWithClass();
            character.Status = CharacterStatus.Rejected;
            _characterRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(character);

            var result = await _sut.SubmitForReviewAsync(1, 10, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.Status.Should().Be("Pending");
        }

        // ── IsNameAvailableAsync ──────────────────────────────────────────

        [Fact]
        public async Task IsNameAvailableAsync_WhenNameAvailable_ReturnsTrue()
        {
            _characterRepoMock
                .Setup(r => r.ExistsByNameAndUserAsync("NewName", 10, null, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            var result = await _sut.IsNameAvailableAsync("NewName", 10, null, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value.Should().BeTrue();
        }

        [Fact]
        public async Task IsNameAvailableAsync_WhenNameTaken_ReturnsFalse()
        {
            _characterRepoMock
                .Setup(r => r.ExistsByNameAndUserAsync("TakenName", 10, null, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            var result = await _sut.IsNameAvailableAsync("TakenName", 10, null, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value.Should().BeFalse();
        }

        [Fact]
        public async Task IsNameAvailableAsync_WhenNameEmpty_ReturnsFailure()
        {
            var result = await _sut.IsNameAvailableAsync("", 10, null, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(400);
        }

        [Fact]
        public async Task IsNameAvailableAsync_WithExcludeId_ExcludesCharacter()
        {
            _characterRepoMock
                .Setup(r => r.ExistsByNameAndUserAsync("MyName", 10, 5, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            var result = await _sut.IsNameAvailableAsync("MyName", 10, 5, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value.Should().BeTrue();
            _characterRepoMock.Verify(r => r.ExistsByNameAndUserAsync("MyName", 10, 5, It.IsAny<CancellationToken>()), Times.Once);
        }

        // ── DuplicateAsync ────────────────────────────────────────────────

        [Fact]
        public async Task DuplicateAsync_WhenApproved_CreatesNewDraftCharacter()
        {
            var character = CharacterWithClass();
            character.Status = CharacterStatus.Approved;
            _characterRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(character);
            _characterRepoMock
                .Setup(r => r.ExistsByNameAndUserAsync("NewHero", 10, null, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);
            _characterRepoMock
                .Setup(r => r.CreateAsync(It.IsAny<Character>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((Character c, CancellationToken _) =>
                {
                    c.Id = 2;
                    return c;
                });

            var result = await _sut.DuplicateAsync(1, 10, "NewHero", CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.Name.Should().Be("NewHero");
            result.Value.Status.Should().Be("Draft");
            result.Value.Id.Should().Be(2);
        }

        [Fact]
        public async Task DuplicateAsync_WhenNameEmpty_ReturnsFailure()
        {
            var result = await _sut.DuplicateAsync(1, 10, "", CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(400);
            result.Error.Should().Contain("nom");
        }

        [Fact]
        public async Task DuplicateAsync_WhenNameAlreadyExists_Returns409()
        {
            var character = CharacterWithClass();
            character.Status = CharacterStatus.Approved;
            _characterRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(character);
            _characterRepoMock
                .Setup(r => r.ExistsByNameAndUserAsync("TakenName", 10, null, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            var result = await _sut.DuplicateAsync(1, 10, "TakenName", CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(409);
        }

        [Fact]
        public async Task DuplicateAsync_WhenNotApproved_ReturnsFailure()
        {
            var character = CharacterWithClass();
            character.Status = CharacterStatus.Draft;
            _characterRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(character);

            var result = await _sut.DuplicateAsync(1, 10, "NewHero", CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(400);
            result.Error.Should().Contain("approuvés");
        }

        [Fact]
        public async Task DuplicateAsync_WhenNotOwner_Returns403()
        {
            var character = CharacterWithClass(userId: 99);
            character.Status = CharacterStatus.Approved;
            _characterRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(character);

            var result = await _sut.DuplicateAsync(1, 10, "NewHero", CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(403);
        }

        [Fact]
        public async Task DuplicateAsync_WhenNotFound_Returns404()
        {
            _characterRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Character?)null);

            var result = await _sut.DuplicateAsync(1, 10, "NewHero", CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(404);
        }

        [Fact]
        public async Task DuplicateAsync_CopiesAllAppearanceProperties()
        {
            var character = CharacterWithClass();
            character.Status = CharacterStatus.Approved;
            character.SkinColor = "#AABBCC";
            character.HairColor = "#112233";
            character.EyeColor = "#445566";
            character.HairStyle = "long";
            character.EyeShape = "rond";
            character.NoseShape = "fin";
            character.MouthShape = "charnue";
            character.FaceShape = "carré";

            _characterRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(character);
            _characterRepoMock
                .Setup(r => r.ExistsByNameAndUserAsync("CopiedHero", 10, null, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            Character? createdCharacter = null;
            _characterRepoMock
                .Setup(r => r.CreateAsync(It.IsAny<Character>(), It.IsAny<CancellationToken>()))
                .Callback<Character, CancellationToken>((c, _) => createdCharacter = c)
                .ReturnsAsync((Character c, CancellationToken _) =>
                {
                    c.Id = 2;
                    return c;
                });

            await _sut.DuplicateAsync(1, 10, "CopiedHero", CancellationToken.None);

            createdCharacter.Should().NotBeNull();
            createdCharacter!.SkinColor.Should().Be("#AABBCC");
            createdCharacter.HairColor.Should().Be("#112233");
            createdCharacter.EyeColor.Should().Be("#445566");
            createdCharacter.HairStyle.Should().Be("long");
            createdCharacter.EyeShape.Should().Be("rond");
            createdCharacter.NoseShape.Should().Be("fin");
            createdCharacter.MouthShape.Should().Be("charnue");
            createdCharacter.FaceShape.Should().Be("carré");
            createdCharacter.IsShared.Should().BeFalse();
        }

        // ── ToggleShareAsync ──────────────────────────────────────────────

        [Fact]
        public async Task ToggleShareAsync_WhenApprovedAndNotShared_SetsSharedTrue()
        {
            var character = CharacterWithClass();
            character.Status = CharacterStatus.Approved;
            character.IsShared = false;
            _characterRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(character);

            var result = await _sut.ToggleShareAsync(1, 10, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.IsShared.Should().BeTrue();
            character.IsShared.Should().BeTrue();
            _characterRepoMock.Verify(r => r.UpdateAsync(character, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task ToggleShareAsync_WhenApprovedAndShared_SetsSharedFalse()
        {
            var character = CharacterWithClass();
            character.Status = CharacterStatus.Approved;
            character.IsShared = true;
            _characterRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(character);

            var result = await _sut.ToggleShareAsync(1, 10, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.IsShared.Should().BeFalse();
            character.IsShared.Should().BeFalse();
        }

        [Fact]
        public async Task ToggleShareAsync_WhenNotApproved_ReturnsFailure()
        {
            var character = CharacterWithClass();
            character.Status = CharacterStatus.Draft;
            _characterRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(character);

            var result = await _sut.ToggleShareAsync(1, 10, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(400);
            result.Error.Should().Contain("approuvés");
        }

        [Fact]
        public async Task ToggleShareAsync_WhenNotOwner_Returns403()
        {
            var character = CharacterWithClass(userId: 99);
            character.Status = CharacterStatus.Approved;
            _characterRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(character);

            var result = await _sut.ToggleShareAsync(1, 10, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(403);
        }

        [Fact]
        public async Task ToggleShareAsync_WhenNotFound_Returns404()
        {
            _characterRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Character?)null);

            var result = await _sut.ToggleShareAsync(1, 10, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(404);
        }
    }
}
