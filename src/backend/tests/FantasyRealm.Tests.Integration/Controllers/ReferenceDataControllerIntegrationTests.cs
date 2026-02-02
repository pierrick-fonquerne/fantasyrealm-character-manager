using System.Net;
using System.Net.Http.Json;
using FluentAssertions;

namespace FantasyRealm.Tests.Integration.Controllers
{
    /// <summary>
    /// Integration tests for the reference data endpoints (character classes and equipment slots).
    /// </summary>
    [Trait("Category", "Integration")]
    [Trait("Category", "ReferenceData")]
    public class ReferenceDataControllerIntegrationTests : IClassFixture<FantasyRealmWebApplicationFactory>
    {
        private readonly HttpClient _client;

        public ReferenceDataControllerIntegrationTests(FantasyRealmWebApplicationFactory factory)
        {
            _client = factory.CreateClient();
        }

        private sealed record CharacterClassDto(int Id, string Name, string Description, string? IconUrl);

        private sealed record EquipmentSlotDto(int Id, string Name, int DisplayOrder);

        [Fact]
        public async Task GetCharacterClasses_ReturnsOkWithFourClasses()
        {
            var response = await _client.GetAsync("/api/character-classes");

            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var classes = await response.Content.ReadFromJsonAsync<List<CharacterClassDto>>();
            classes.Should().NotBeNull();
            classes.Should().HaveCount(4);
            classes!.Select(c => c.Name).Should().BeEquivalentTo(["Archer", "Guerrier", "Mage", "Voleur"]);
        }

        [Fact]
        public async Task GetCharacterClasses_ReturnsClassesWithDescriptions()
        {
            var response = await _client.GetAsync("/api/character-classes");
            var classes = await response.Content.ReadFromJsonAsync<List<CharacterClassDto>>();

            classes.Should().AllSatisfy(c =>
            {
                c.Id.Should().BeGreaterThan(0);
                c.Name.Should().NotBeNullOrWhiteSpace();
                c.Description.Should().NotBeNullOrWhiteSpace();
            });
        }

        [Fact]
        public async Task GetEquipmentSlots_ReturnsOkWithFourteenSlots()
        {
            var response = await _client.GetAsync("/api/equipment-slots");

            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var slots = await response.Content.ReadFromJsonAsync<List<EquipmentSlotDto>>();
            slots.Should().NotBeNull();
            slots.Should().HaveCount(14);
        }

        [Fact]
        public async Task GetEquipmentSlots_ReturnsSlotsOrderedByDisplayOrder()
        {
            var response = await _client.GetAsync("/api/equipment-slots");
            var slots = await response.Content.ReadFromJsonAsync<List<EquipmentSlotDto>>();

            slots.Should().NotBeNull();
            slots!.Select(s => s.DisplayOrder).Should().BeInAscendingOrder();
            slots.First().Name.Should().Be("Tête");
            slots.Last().Name.Should().Be("Main gauche");
        }

        [Fact]
        public async Task GetEquipmentSlots_ReturnsExpectedSlotNames()
        {
            var response = await _client.GetAsync("/api/equipment-slots");
            var slots = await response.Content.ReadFromJsonAsync<List<EquipmentSlotDto>>();

            var expectedNames = new[]
            {
                "Tête", "Épaules", "Dos", "Torse", "Poignets", "Mains", "Taille",
                "Jambes", "Pieds", "Cou", "Anneau 1", "Anneau 2", "Main droite", "Main gauche"
            };

            slots!.Select(s => s.Name).Should().BeEquivalentTo(expectedNames);
        }
    }
}
