using System.Net;
using System.Net.Http.Json;
using FantasyRealm.Application.DTOs;
using FluentAssertions;

namespace FantasyRealm.Tests.Integration.Controllers
{
    /// <summary>
    /// Integration tests for the characters CRUD endpoints.
    /// </summary>
    [Trait("Category", "Integration")]
    [Trait("Category", "Character")]
    public class CharactersControllerIntegrationTests : IClassFixture<FantasyRealmWebApplicationFactory>
    {
        private readonly HttpClient _client;

        public CharactersControllerIntegrationTests(FantasyRealmWebApplicationFactory factory)
        {
            _client = factory.CreateClient();
        }

        private async Task<string> RegisterAndGetTokenAsync()
        {
            var email = $"char_{Guid.NewGuid():N}@example.com";
            var pseudo = $"Ch{Guid.NewGuid():N}"[..20];

            await _client.PostAsJsonAsync("/api/auth/register", new
            {
                Email = email,
                Pseudo = pseudo,
                Password = "MySecure@Pass123",
                ConfirmPassword = "MySecure@Pass123"
            });

            var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", new
            {
                Email = email,
                Password = "MySecure@Pass123"
            });

            var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
            return loginResult!.Token;
        }

        private static object ValidCharacterPayload(string name = "Arthas") => new
        {
            Name = name,
            ClassId = 1,
            Gender = "Male",
            SkinColor = "#E8BEAC",
            EyeColor = "#4A90D9",
            HairColor = "#2C1810",
            HairStyle = "court",
            EyeShape = "amande",
            NoseShape = "droit",
            MouthShape = "fine",
            FaceShape = "ovale"
        };

        private async Task<HttpResponseMessage> PostAuthenticatedAsync(string url, object payload, string token)
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Headers.Add("Authorization", $"Bearer {token}");
            request.Content = JsonContent.Create(payload);
            return await _client.SendAsync(request);
        }

        private async Task<HttpResponseMessage> GetAuthenticatedAsync(string url, string token)
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Add("Authorization", $"Bearer {token}");
            return await _client.SendAsync(request);
        }

        private async Task<HttpResponseMessage> PatchAuthenticatedAsync(string url, string token)
        {
            using var request = new HttpRequestMessage(HttpMethod.Patch, url);
            request.Headers.Add("Authorization", $"Bearer {token}");
            return await _client.SendAsync(request);
        }

        private async Task<HttpResponseMessage> DeleteAuthenticatedAsync(string url, string token)
        {
            using var request = new HttpRequestMessage(HttpMethod.Delete, url);
            request.Headers.Add("Authorization", $"Bearer {token}");
            return await _client.SendAsync(request);
        }

        // ── Create ──────────────────────────────────────────────────────

        [Fact]
        public async Task Create_WithValidData_Returns201()
        {
            var token = await RegisterAndGetTokenAsync();

            var response = await PostAuthenticatedAsync("/api/characters", ValidCharacterPayload(), token);

            response.StatusCode.Should().Be(HttpStatusCode.Created);
            var character = await response.Content.ReadFromJsonAsync<CharacterResponse>();
            character.Should().NotBeNull();
            character!.Name.Should().Be("Arthas");
            character.ClassName.Should().Be("Guerrier");
            character.Status.Should().Be("Draft");
        }

        [Fact]
        public async Task Create_WithoutToken_Returns401()
        {
            var response = await _client.PostAsJsonAsync("/api/characters", ValidCharacterPayload());

            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task Create_WithDuplicateName_Returns409()
        {
            var token = await RegisterAndGetTokenAsync();

            await PostAuthenticatedAsync("/api/characters", ValidCharacterPayload("DuplicateHero"), token);
            var response = await PostAuthenticatedAsync("/api/characters", ValidCharacterPayload("DuplicateHero"), token);

            response.StatusCode.Should().Be(HttpStatusCode.Conflict);
        }

        // ── GetMine ─────────────────────────────────────────────────────

        [Fact]
        public async Task GetMine_ReturnsOwnCharacters()
        {
            var token = await RegisterAndGetTokenAsync();

            await PostAuthenticatedAsync("/api/characters", ValidCharacterPayload("Hero1"), token);
            await PostAuthenticatedAsync("/api/characters", ValidCharacterPayload("Hero2"), token);

            var response = await GetAuthenticatedAsync("/api/characters/mine", token);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var characters = await response.Content.ReadFromJsonAsync<List<CharacterSummaryResponse>>();
            characters.Should().HaveCount(2);
        }

        [Fact]
        public async Task GetMine_WithNoCharacters_ReturnsEmptyList()
        {
            var token = await RegisterAndGetTokenAsync();

            var response = await GetAuthenticatedAsync("/api/characters/mine", token);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var characters = await response.Content.ReadFromJsonAsync<List<CharacterSummaryResponse>>();
            characters.Should().BeEmpty();
        }

        // ── GetById ─────────────────────────────────────────────────────

        [Fact]
        public async Task GetById_WhenOwner_ReturnsCharacter()
        {
            var token = await RegisterAndGetTokenAsync();
            var createResponse = await PostAuthenticatedAsync("/api/characters", ValidCharacterPayload(), token);
            var created = await createResponse.Content.ReadFromJsonAsync<CharacterResponse>();

            var response = await GetAuthenticatedAsync($"/api/characters/{created!.Id}", token);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var character = await response.Content.ReadFromJsonAsync<CharacterResponse>();
            character!.Name.Should().Be("Arthas");
        }

        [Fact]
        public async Task GetById_WhenNotOwner_Returns403()
        {
            var token1 = await RegisterAndGetTokenAsync();
            var createResponse = await PostAuthenticatedAsync("/api/characters", ValidCharacterPayload(), token1);
            var created = await createResponse.Content.ReadFromJsonAsync<CharacterResponse>();

            var token2 = await RegisterAndGetTokenAsync();
            var response = await GetAuthenticatedAsync($"/api/characters/{created!.Id}", token2);

            response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        }

        // ── Submit ──────────────────────────────────────────────────────

        [Fact]
        public async Task Submit_WhenDraft_ChangesToPending()
        {
            var token = await RegisterAndGetTokenAsync();
            var createResponse = await PostAuthenticatedAsync("/api/characters", ValidCharacterPayload(), token);
            var created = await createResponse.Content.ReadFromJsonAsync<CharacterResponse>();

            var response = await PatchAuthenticatedAsync($"/api/characters/{created!.Id}/submit", token);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var character = await response.Content.ReadFromJsonAsync<CharacterResponse>();
            character!.Status.Should().Be("Pending");
        }

        [Fact]
        public async Task Submit_WhenAlreadyPending_Returns400()
        {
            var token = await RegisterAndGetTokenAsync();
            var createResponse = await PostAuthenticatedAsync("/api/characters", ValidCharacterPayload(), token);
            var created = await createResponse.Content.ReadFromJsonAsync<CharacterResponse>();

            await PatchAuthenticatedAsync($"/api/characters/{created!.Id}/submit", token);
            var response = await PatchAuthenticatedAsync($"/api/characters/{created.Id}/submit", token);

            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        // ── Delete ──────────────────────────────────────────────────────

        [Fact]
        public async Task Delete_WhenOwner_Returns204()
        {
            var token = await RegisterAndGetTokenAsync();
            var createResponse = await PostAuthenticatedAsync("/api/characters", ValidCharacterPayload(), token);
            var created = await createResponse.Content.ReadFromJsonAsync<CharacterResponse>();

            var response = await DeleteAuthenticatedAsync($"/api/characters/{created!.Id}", token);

            response.StatusCode.Should().Be(HttpStatusCode.NoContent);
        }

        [Fact]
        public async Task Delete_WhenNotOwner_Returns403()
        {
            var token1 = await RegisterAndGetTokenAsync();
            var createResponse = await PostAuthenticatedAsync("/api/characters", ValidCharacterPayload(), token1);
            var created = await createResponse.Content.ReadFromJsonAsync<CharacterResponse>();

            var token2 = await RegisterAndGetTokenAsync();
            var response = await DeleteAuthenticatedAsync($"/api/characters/{created!.Id}", token2);

            response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        }
    }
}
