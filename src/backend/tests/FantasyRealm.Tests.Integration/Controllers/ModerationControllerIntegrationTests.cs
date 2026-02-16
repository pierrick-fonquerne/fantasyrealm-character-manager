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
    /// Integration tests for the moderation endpoints.
    /// </summary>
    [Trait("Category", "Integration")]
    [Trait("Category", "Moderation")]
    public class ModerationControllerIntegrationTests(FantasyRealmWebApplicationFactory factory) : IClassFixture<FantasyRealmWebApplicationFactory>
    {
        private readonly HttpClient _client = factory.CreateClient();

        private async Task<(string Token, string Email)> RegisterAndGetTokenAsync()
        {
            var email = $"mod_{Guid.NewGuid():N}@example.com";
            var pseudo = $"Md{Guid.NewGuid():N}"[..20];

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
            return (loginResult!.Token, email);
        }

        private async Task<string> RegisterEmployeeAndGetTokenAsync()
        {
            var (_, email) = await RegisterAndGetTokenAsync();

            using var scope = factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<FantasyRealmDbContext>();
            var user = await db.Users.FirstAsync(u => u.Email == email);
            user.RoleId = 2;
            await db.SaveChangesAsync();

            var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", new
            {
                Email = email,
                Password = "MySecure@Pass123"
            });

            var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
            return loginResult!.Token;
        }

        private async Task<int> CreatePendingCharacterAsync()
        {
            var (userToken, _) = await RegisterAndGetTokenAsync();

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
            }, userToken);

            var created = await createResponse.Content.ReadFromJsonAsync<CharacterResponse>();

            await PatchAuthenticatedAsync($"/api/characters/{created!.Id}/submit", userToken);

            return created.Id;
        }

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

        private async Task<HttpResponseMessage> PatchAuthenticatedAsync(string url, string token, object? body = null)
        {
            using var request = new HttpRequestMessage(HttpMethod.Patch, url);
            request.Headers.Add("Authorization", $"Bearer {token}");
            if (body is not null)
                request.Content = JsonContent.Create(body);
            return await _client.SendAsync(request);
        }

        // ── GetPending ──────────────────────────────────────────────────

        [Fact]
        public async Task GetPending_AsEmployee_Returns200()
        {
            var employeeToken = await RegisterEmployeeAndGetTokenAsync();
            await CreatePendingCharacterAsync();

            var response = await GetAuthenticatedAsync("/api/moderation/characters", employeeToken);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<PendingResult>();
            result!.Items.Should().NotBeEmpty();
            result.TotalCount.Should().BeGreaterThan(0);
        }

        [Fact]
        public async Task GetPending_AsRegularUser_Returns403()
        {
            var (userToken, _) = await RegisterAndGetTokenAsync();

            var response = await GetAuthenticatedAsync("/api/moderation/characters", userToken);

            response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        }

        // ── Approve ─────────────────────────────────────────────────────

        [Fact]
        public async Task Approve_WhenPending_Returns200_StatusApproved()
        {
            var employeeToken = await RegisterEmployeeAndGetTokenAsync();
            var characterId = await CreatePendingCharacterAsync();

            var response = await PatchAuthenticatedAsync(
                $"/api/moderation/characters/{characterId}/approve", employeeToken);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<CharacterResponse>();
            result!.Status.Should().Be("Approved");
        }

        [Fact]
        public async Task Approve_WhenNotFound_Returns404()
        {
            var employeeToken = await RegisterEmployeeAndGetTokenAsync();

            var response = await PatchAuthenticatedAsync(
                "/api/moderation/characters/99999/approve", employeeToken);

            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task Approve_WhenAlreadyApproved_Returns400()
        {
            var employeeToken = await RegisterEmployeeAndGetTokenAsync();
            var characterId = await CreatePendingCharacterAsync();

            await PatchAuthenticatedAsync(
                $"/api/moderation/characters/{characterId}/approve", employeeToken);

            var response = await PatchAuthenticatedAsync(
                $"/api/moderation/characters/{characterId}/approve", employeeToken);

            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        // ── Reject ──────────────────────────────────────────────────────

        [Fact]
        public async Task Reject_WithReason_Returns200_StatusRejected()
        {
            var employeeToken = await RegisterEmployeeAndGetTokenAsync();
            var characterId = await CreatePendingCharacterAsync();

            var response = await PatchAuthenticatedAsync(
                $"/api/moderation/characters/{characterId}/reject",
                employeeToken,
                new { Reason = "Contenu inapproprié" });

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<CharacterResponse>();
            result!.Status.Should().Be("Rejected");
        }

        [Fact]
        public async Task Reject_WithoutReason_Returns400()
        {
            var employeeToken = await RegisterEmployeeAndGetTokenAsync();
            var characterId = await CreatePendingCharacterAsync();

            var response = await PatchAuthenticatedAsync(
                $"/api/moderation/characters/{characterId}/reject",
                employeeToken,
                new { Reason = "" });

            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task Reject_WhenNotPending_Returns400()
        {
            var employeeToken = await RegisterEmployeeAndGetTokenAsync();
            var characterId = await CreatePendingCharacterAsync();

            await PatchAuthenticatedAsync(
                $"/api/moderation/characters/{characterId}/approve", employeeToken);

            var response = await PatchAuthenticatedAsync(
                $"/api/moderation/characters/{characterId}/reject",
                employeeToken,
                new { Reason = "Trop tard" });

            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        private sealed record LoginResponse(string Token);

        private sealed record PendingItem(
            int Id,
            string Name,
            string ClassName,
            string Gender,
            string OwnerPseudo,
            DateTime SubmittedAt);

        private sealed record PendingResult(
            IReadOnlyList<PendingItem> Items,
            int Page,
            int PageSize,
            int TotalCount,
            int TotalPages);
    }
}
