using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using FantasyRealm.Application.Services;
using FantasyRealm.Domain.Entities;
using FluentAssertions;
using Moq;

namespace FantasyRealm.Tests.Unit.Services
{
    [Trait("Category", "Unit")]
    [Trait("Category", "Article")]
    public class ArticleServiceTests
    {
        private readonly Mock<IArticleRepository> _articleRepoMock = new();
        private readonly Mock<IReferenceDataRepository> _refDataRepoMock = new();
        private readonly ArticleService _sut;

        public ArticleServiceTests()
        {
            _sut = new ArticleService(_articleRepoMock.Object, _refDataRepoMock.Object);
            SetupDefaultReferenceData();
        }

        private void SetupDefaultReferenceData()
        {
            _refDataRepoMock
                .Setup(r => r.GetAllArticleTypesAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<ArticleType>
                {
                    new() { Id = 1, Name = "Clothing" },
                    new() { Id = 2, Name = "Armor" },
                    new() { Id = 3, Name = "Weapon" },
                    new() { Id = 4, Name = "Accessory" }
                });

            _refDataRepoMock
                .Setup(r => r.GetAllSlotsAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<EquipmentSlot>
                {
                    new() { Id = 1, Name = "Head", DisplayOrder = 1 },
                    new() { Id = 2, Name = "Chest", DisplayOrder = 2 },
                    new() { Id = 5, Name = "MainHand", DisplayOrder = 5 }
                });
        }

        private static Article CreateArticleEntity(int id = 1, string name = "Steel Sword", bool isActive = true) => new()
        {
            Id = id,
            Name = name,
            TypeId = 3,
            SlotId = 5,
            IsActive = isActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Type = new ArticleType { Id = 3, Name = "Weapon" },
            Slot = new EquipmentSlot { Id = 5, Name = "MainHand", DisplayOrder = 5 }
        };

        // ── CreateAsync ──────────────────────────────────────────────────

        [Fact]
        public async Task CreateAsync_WithValidData_ReturnsSuccess()
        {
            _articleRepoMock
                .Setup(r => r.ExistsByNameAsync("Steel Sword", null, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);
            _articleRepoMock
                .Setup(r => r.CreateAsync(It.IsAny<Article>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((Article a, CancellationToken _) =>
                {
                    a.Id = 1;
                    return a;
                });

            var request = new CreateArticleRequest("Steel Sword", 3, 5, null);
            var result = await _sut.CreateAsync(request, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.Name.Should().Be("Steel Sword");
            result.Value.TypeName.Should().Be("Weapon");
            result.Value.SlotName.Should().Be("MainHand");
        }

        [Fact]
        public async Task CreateAsync_WithDuplicateName_ReturnsFailure409()
        {
            _articleRepoMock
                .Setup(r => r.ExistsByNameAsync("Steel Sword", null, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            var request = new CreateArticleRequest("Steel Sword", 3, 5, null);
            var result = await _sut.CreateAsync(request, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(409);
        }

        [Fact]
        public async Task CreateAsync_WithInvalidTypeId_ReturnsFailure400()
        {
            var request = new CreateArticleRequest("Sword", 999, 5, null);
            var result = await _sut.CreateAsync(request, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(400);
            result.Error.Should().Contain("Type");
        }

        [Fact]
        public async Task CreateAsync_WithInvalidSlotId_ReturnsFailure400()
        {
            var request = new CreateArticleRequest("Sword", 3, 999, null);
            var result = await _sut.CreateAsync(request, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(400);
            result.Error.Should().Contain("Emplacement");
        }

        // ── UpdateAsync ──────────────────────────────────────────────────

        [Fact]
        public async Task UpdateAsync_NotFound_ReturnsFailure404()
        {
            _articleRepoMock
                .Setup(r => r.GetByIdAsync(99, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Article?)null);

            var request = new UpdateArticleRequest("New Name", 3, 5, null);
            var result = await _sut.UpdateAsync(99, request, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(404);
        }

        [Fact]
        public async Task UpdateAsync_WithValidData_ReturnsSuccess()
        {
            var article = CreateArticleEntity();
            _articleRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(article);
            _articleRepoMock
                .Setup(r => r.ExistsByNameAsync("Iron Sword", 1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            var request = new UpdateArticleRequest("Iron Sword", 3, 5, null);
            var result = await _sut.UpdateAsync(1, request, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.Name.Should().Be("Iron Sword");
        }

        // ── ToggleActiveAsync ────────────────────────────────────────────

        [Fact]
        public async Task ToggleActiveAsync_NotFound_ReturnsFailure404()
        {
            _articleRepoMock
                .Setup(r => r.GetByIdAsync(99, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Article?)null);

            var result = await _sut.ToggleActiveAsync(99, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(404);
        }

        [Fact]
        public async Task ToggleActiveAsync_WhenActive_DeactivatesArticle()
        {
            var article = CreateArticleEntity(isActive: true);
            _articleRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(article);

            var result = await _sut.ToggleActiveAsync(1, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.IsActive.Should().BeFalse();
        }

        [Fact]
        public async Task ToggleActiveAsync_WhenInactive_ActivatesArticle()
        {
            var article = CreateArticleEntity(isActive: false);
            _articleRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(article);

            var result = await _sut.ToggleActiveAsync(1, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.IsActive.Should().BeTrue();
        }

        // ── DeleteAsync ──────────────────────────────────────────────────

        [Fact]
        public async Task DeleteAsync_WhenEquipped_ReturnsFailure409()
        {
            var article = CreateArticleEntity();
            _articleRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(article);
            _articleRepoMock
                .Setup(r => r.IsEquippedAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            var result = await _sut.DeleteAsync(1, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(409);
        }

        [Fact]
        public async Task DeleteAsync_WhenNotEquipped_ReturnsSuccess()
        {
            var article = CreateArticleEntity();
            _articleRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(article);
            _articleRepoMock
                .Setup(r => r.IsEquippedAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            var result = await _sut.DeleteAsync(1, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            _articleRepoMock.Verify(r => r.DeleteAsync(article, It.IsAny<CancellationToken>()), Times.Once);
        }

        // ── IsNameAvailableAsync ─────────────────────────────────────────

        [Fact]
        public async Task IsNameAvailableAsync_WhenAvailable_ReturnsTrue()
        {
            _articleRepoMock
                .Setup(r => r.ExistsByNameAsync("New Sword", null, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            var result = await _sut.IsNameAvailableAsync("New Sword", null, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value.Should().BeTrue();
        }

        [Fact]
        public async Task IsNameAvailableAsync_WhenTaken_ReturnsFalse()
        {
            _articleRepoMock
                .Setup(r => r.ExistsByNameAsync("Existing Sword", null, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            var result = await _sut.IsNameAvailableAsync("Existing Sword", null, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value.Should().BeFalse();
        }

        [Fact]
        public async Task IsNameAvailableAsync_WithEmptyName_ReturnsFailure()
        {
            var result = await _sut.IsNameAvailableAsync("", null, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(400);
        }

        // ── GetByIdPublicAsync ───────────────────────────────────────────

        [Fact]
        public async Task GetByIdPublicAsync_WhenInactive_ReturnsFailure404()
        {
            var article = CreateArticleEntity(isActive: false);
            _articleRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(article);

            var result = await _sut.GetByIdPublicAsync(1, CancellationToken.None);

            result.IsFailure.Should().BeTrue();
            result.ErrorCode.Should().Be(404);
        }

        [Fact]
        public async Task GetByIdPublicAsync_WhenActive_ReturnsSuccess()
        {
            var article = CreateArticleEntity(isActive: true);
            _articleRepoMock
                .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(article);

            var result = await _sut.GetByIdPublicAsync(1, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value!.Name.Should().Be("Steel Sword");
        }
    }
}
