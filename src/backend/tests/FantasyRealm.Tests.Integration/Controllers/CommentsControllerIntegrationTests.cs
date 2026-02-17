using System.Net;
using System.Net.Http.Json;
using FantasyRealm.Application.DTOs;
using FantasyRealm.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace FantasyRealm.Tests.Integration.Controllers
{
    /// <summary>
    /// Integration tests for the comments endpoints.
    /// </summary>
    [Trait("Category", "Integration")]
    [Trait("Category", "Comment")]
    public class CommentsControllerIntegrationTests(FantasyRealmWebApplicationFactory factory) : IClassFixture<FantasyRealmWebApplicationFactory>
    {
        private readonly HttpClient _client = factory.CreateClient();

        private async Task<(string Token, int UserId)> RegisterAndGetTokenAsync()
        {
            var email = $"cmt_{Guid.NewGuid():N}@example.com";
            var pseudo = $"Cm{Guid.NewGuid():N}"[..20];

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

            using var scope = factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<FantasyRealmDbContext>();
            var user = await db.Users.FirstAsync(u => u.Email == email);

            return (loginResult!.Token, user.Id);
        }

        private async Task<string> RegisterEmployeeAndGetTokenAsync()
        {
            var (_, userId) = await RegisterAndGetTokenAsync();

            using var scope = factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<FantasyRealmDbContext>();
            var user = await db.Users.FirstAsync(u => u.Id == userId);
            user.RoleId = 2;
            await db.SaveChangesAsync();

            var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", new
            {
                Email = user.Email,
                Password = "MySecure@Pass123"
            });

            var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
            return loginResult!.Token;
        }

        private async Task<int> CreateApprovedCharacterAsync(string ownerToken)
        {
            var createResponse = await PostAuthenticatedAsync("/api/characters", new
            {
                Name = $"Hero_{Guid.NewGuid():N}"[..20],
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
            }, ownerToken);

            var created = await createResponse.Content.ReadFromJsonAsync<CharacterResponse>();

            await PatchAuthenticatedAsync($"/api/characters/{created!.Id}/submit", ownerToken);

            var employeeToken = await RegisterEmployeeAndGetTokenAsync();
            await PatchAuthenticatedAsync($"/api/moderation/characters/{created.Id}/approve", employeeToken);

            return created.Id;
        }

        private async Task<HttpResponseMessage> PostAuthenticatedAsync(string url, object payload, string token)
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Headers.Add("Authorization", $"Bearer {token}");
            request.Content = JsonContent.Create(payload);
            return await _client.SendAsync(request);
        }

        private async Task<HttpResponseMessage> GetAsync(string url)
        {
            return await _client.GetAsync(url);
        }

        private async Task<HttpResponseMessage> DeleteAuthenticatedAsync(string url, string token)
        {
            using var request = new HttpRequestMessage(HttpMethod.Delete, url);
            request.Headers.Add("Authorization", $"Bearer {token}");
            return await _client.SendAsync(request);
        }

        private async Task<HttpResponseMessage> PatchAuthenticatedAsync(string url, string token, object? body = null)
        {
            using var request = new HttpRequestMessage(HttpMethod.Patch, url);
            request.Headers.Add("Authorization", $"Bearer {token}");
            if (body is not null)
                request.Content = JsonContent.Create(body);
            return await _client.SendAsync(request);
        }

        // ── Create ────────────────────────────────────────────────────────

        [Fact]
        public async Task Create_WithValidData_Returns201()
        {
            var (ownerToken, _) = await RegisterAndGetTokenAsync();
            var characterId = await CreateApprovedCharacterAsync(ownerToken);

            var (reviewerToken, _) = await RegisterAndGetTokenAsync();

            var response = await PostAuthenticatedAsync(
                $"/api/characters/{characterId}/comments",
                new { Rating = 4, Text = "Un personnage vraiment impressionnant !" },
                reviewerToken);

            response.StatusCode.Should().Be(HttpStatusCode.Created);
            var result = await response.Content.ReadFromJsonAsync<CommentResponse>();
            result!.Rating.Should().Be(4);
            result.Status.Should().Be("Pending");
        }

        [Fact]
        public async Task Create_AsOwner_Returns400()
        {
            var (ownerToken, _) = await RegisterAndGetTokenAsync();
            var characterId = await CreateApprovedCharacterAsync(ownerToken);

            var response = await PostAuthenticatedAsync(
                $"/api/characters/{characterId}/comments",
                new { Rating = 5, Text = "Mon propre personnage est super !" },
                ownerToken);

            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task Create_Duplicate_Returns409()
        {
            var (ownerToken, _) = await RegisterAndGetTokenAsync();
            var characterId = await CreateApprovedCharacterAsync(ownerToken);

            var (reviewerToken, _) = await RegisterAndGetTokenAsync();

            await PostAuthenticatedAsync(
                $"/api/characters/{characterId}/comments",
                new { Rating = 4, Text = "Premier avis sur ce personnage." },
                reviewerToken);

            var response = await PostAuthenticatedAsync(
                $"/api/characters/{characterId}/comments",
                new { Rating = 5, Text = "Deuxième avis sur le même personnage." },
                reviewerToken);

            response.StatusCode.Should().Be(HttpStatusCode.Conflict);
        }

        [Fact]
        public async Task Create_CharacterNotFound_Returns404()
        {
            var (reviewerToken, _) = await RegisterAndGetTokenAsync();

            var response = await PostAuthenticatedAsync(
                "/api/characters/99999/comments",
                new { Rating = 4, Text = "Un avis sur un personnage inexistant." },
                reviewerToken);

            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task Create_InvalidRating_Returns400()
        {
            var (ownerToken, _) = await RegisterAndGetTokenAsync();
            var characterId = await CreateApprovedCharacterAsync(ownerToken);

            var (reviewerToken, _) = await RegisterAndGetTokenAsync();

            var response = await PostAuthenticatedAsync(
                $"/api/characters/{characterId}/comments",
                new { Rating = 0, Text = "Un avis avec une note invalide." },
                reviewerToken);

            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task Create_TextTooShort_Returns400()
        {
            var (ownerToken, _) = await RegisterAndGetTokenAsync();
            var characterId = await CreateApprovedCharacterAsync(ownerToken);

            var (reviewerToken, _) = await RegisterAndGetTokenAsync();

            var response = await PostAuthenticatedAsync(
                $"/api/characters/{characterId}/comments",
                new { Rating = 4, Text = "Court" },
                reviewerToken);

            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task Create_Anonymous_Returns401()
        {
            var response = await _client.PostAsJsonAsync(
                "/api/characters/1/comments",
                new { Rating = 4, Text = "Un avis sans être connecté." });

            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        // ── Get ───────────────────────────────────────────────────────────

        [Fact]
        public async Task Get_ReturnsEmptyListWhenNoComments()
        {
            var (ownerToken, _) = await RegisterAndGetTokenAsync();
            var characterId = await CreateApprovedCharacterAsync(ownerToken);

            var response = await GetAsync($"/api/characters/{characterId}/comments");

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<CommentResponse[]>();
            result.Should().BeEmpty();
        }

        [Fact]
        public async Task Get_DoesNotReturnPendingComments()
        {
            var (ownerToken, _) = await RegisterAndGetTokenAsync();
            var characterId = await CreateApprovedCharacterAsync(ownerToken);

            var (reviewerToken, _) = await RegisterAndGetTokenAsync();
            await PostAuthenticatedAsync(
                $"/api/characters/{characterId}/comments",
                new { Rating = 4, Text = "Un avis en attente de modération." },
                reviewerToken);

            var response = await GetAsync($"/api/characters/{characterId}/comments");

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<CommentResponse[]>();
            result.Should().BeEmpty();
        }

        [Fact]
        public async Task Get_CharacterNotFound_Returns404()
        {
            var response = await GetAsync("/api/characters/99999/comments");

            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        // ── Delete ────────────────────────────────────────────────────────

        [Fact]
        public async Task Delete_AsAuthor_Returns204()
        {
            var (ownerToken, _) = await RegisterAndGetTokenAsync();
            var characterId = await CreateApprovedCharacterAsync(ownerToken);

            var (reviewerToken, _) = await RegisterAndGetTokenAsync();
            var createResponse = await PostAuthenticatedAsync(
                $"/api/characters/{characterId}/comments",
                new { Rating = 4, Text = "Un avis que je vais supprimer." },
                reviewerToken);

            var created = await createResponse.Content.ReadFromJsonAsync<CommentResponse>();

            var response = await DeleteAuthenticatedAsync($"/api/comments/{created!.Id}", reviewerToken);

            response.StatusCode.Should().Be(HttpStatusCode.NoContent);
        }

        [Fact]
        public async Task Delete_AsOtherUser_Returns403()
        {
            var (ownerToken, _) = await RegisterAndGetTokenAsync();
            var characterId = await CreateApprovedCharacterAsync(ownerToken);

            var (reviewerToken, _) = await RegisterAndGetTokenAsync();
            var createResponse = await PostAuthenticatedAsync(
                $"/api/characters/{characterId}/comments",
                new { Rating = 4, Text = "Un avis que quelqu'un d'autre veut supprimer." },
                reviewerToken);

            var created = await createResponse.Content.ReadFromJsonAsync<CommentResponse>();

            var (otherToken, _) = await RegisterAndGetTokenAsync();

            var response = await DeleteAuthenticatedAsync($"/api/comments/{created!.Id}", otherToken);

            response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        }

        [Fact]
        public async Task Delete_NotFound_Returns404()
        {
            var (reviewerToken, _) = await RegisterAndGetTokenAsync();

            var response = await DeleteAuthenticatedAsync("/api/comments/99999", reviewerToken);

            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task Delete_Anonymous_Returns401()
        {
            using var request = new HttpRequestMessage(HttpMethod.Delete, "/api/comments/1");
            var response = await _client.SendAsync(request);

            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        private sealed record LoginResponse(string Token);
    }
}
