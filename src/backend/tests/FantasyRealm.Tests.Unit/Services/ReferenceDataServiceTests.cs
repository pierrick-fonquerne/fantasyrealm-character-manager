using FantasyRealm.Application.Interfaces;
using FantasyRealm.Application.Services;
using FantasyRealm.Domain.Entities;
using FluentAssertions;
using Moq;

namespace FantasyRealm.Tests.Unit.Services
{
    /// <summary>
    /// Unit tests for <see cref="ReferenceDataService"/>.
    /// </summary>
    [Trait("Category", "Unit")]
    [Trait("Category", "ReferenceData")]
    public class ReferenceDataServiceTests
    {
        private readonly Mock<IReferenceDataRepository> _repositoryMock = new();
        private readonly ReferenceDataService _sut;

        public ReferenceDataServiceTests()
        {
            _sut = new ReferenceDataService(_repositoryMock.Object);
        }

        [Fact]
        public async Task GetCharacterClassesAsync_ReturnsMappedClasses()
        {
            var classes = new List<CharacterClass>
            {
                new() { Id = 1, Name = "Warrior", Description = "A melee fighter.", IconUrl = null },
                new() { Id = 2, Name = "Mage", Description = "A spellcaster.", IconUrl = "https://cdn.example.com/mage.png" }
            };
            _repositoryMock.Setup(r => r.GetAllClassesAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(classes);

            var result = await _sut.GetCharacterClassesAsync(CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value.Should().HaveCount(2);
            result.Value![0].Id.Should().Be(1);
            result.Value[0].Name.Should().Be("Warrior");
            result.Value[0].Description.Should().Be("A melee fighter.");
            result.Value[0].IconUrl.Should().BeNull();
            result.Value[1].IconUrl.Should().Be("https://cdn.example.com/mage.png");
        }

        [Fact]
        public async Task GetCharacterClassesAsync_WhenEmpty_ReturnsEmptyList()
        {
            _repositoryMock.Setup(r => r.GetAllClassesAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<CharacterClass>());

            var result = await _sut.GetCharacterClassesAsync(CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value.Should().BeEmpty();
        }

        [Fact]
        public async Task GetEquipmentSlotsAsync_ReturnsMappedSlots()
        {
            var slots = new List<EquipmentSlot>
            {
                new() { Id = 1, Name = "Head", DisplayOrder = 1 },
                new() { Id = 2, Name = "Shoulders", DisplayOrder = 2 },
                new() { Id = 3, Name = "Chest", DisplayOrder = 4 }
            };
            _repositoryMock.Setup(r => r.GetAllSlotsAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(slots);

            var result = await _sut.GetEquipmentSlotsAsync(CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value.Should().HaveCount(3);
            result.Value![0].Name.Should().Be("Head");
            result.Value![0].DisplayOrder.Should().Be(1);
            result.Value![2].Name.Should().Be("Chest");
        }

        [Fact]
        public async Task GetEquipmentSlotsAsync_WhenEmpty_ReturnsEmptyList()
        {
            _repositoryMock.Setup(r => r.GetAllSlotsAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<EquipmentSlot>());

            var result = await _sut.GetEquipmentSlotsAsync(CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value.Should().BeEmpty();
        }
    }
}
