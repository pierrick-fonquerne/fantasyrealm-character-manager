using FantasyRealm.Domain.Entities;
using FantasyRealm.Domain.Enums;
using FantasyRealm.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace FantasyRealm.Tests.Integration.Persistence
{
    /// <summary>
    /// Integration tests for FantasyRealmDbContext using real PostgreSQL via Testcontainers.
    /// Validates that the EF Core model matches the SQL schema.
    /// </summary>
    [Trait("Category", "Integration")]
    [Trait("Category", "Persistence")]
    public class FantasyRealmDbContextIntegrationTests : IClassFixture<FantasyRealmWebApplicationFactory>
    {
        private readonly FantasyRealmWebApplicationFactory _factory;

        public FantasyRealmDbContextIntegrationTests(FantasyRealmWebApplicationFactory factory)
        {
            _factory = factory;
        }

        private FantasyRealmDbContext CreateDbContext()
        {
            var scope = _factory.Services.CreateScope();
            return scope.ServiceProvider.GetRequiredService<FantasyRealmDbContext>();
        }

        [Fact]
        public async Task CanRetrieveSeededRoles()
        {
            // Arrange
            using var context = CreateDbContext();

            // Act
            var roles = await context.Roles.OrderBy(r => r.Id).ToListAsync();

            // Assert
            Assert.Equal(3, roles.Count);
            Assert.Equal("User", roles[0].Label);
            Assert.Equal("Employee", roles[1].Label);
            Assert.Equal("Admin", roles[2].Label);
        }

        [Fact]
        public async Task CanAddUserWithRole()
        {
            // Arrange
            using var context = CreateDbContext();
            var role = await context.Roles.FirstAsync(r => r.Label == "User");

            var user = new User
            {
                Pseudo = $"player_{Guid.NewGuid():N}"[..20],
                Email = $"player_{Guid.NewGuid():N}@test.com",
                PasswordHash = "hashed_password",
                RoleId = role.Id
            };

            // Act
            context.Users.Add(user);
            await context.SaveChangesAsync();

            // Assert
            var savedUser = await context.Users
                .Include(u => u.Role)
                .FirstAsync(u => u.Id == user.Id);

            Assert.Equal(user.Pseudo, savedUser.Pseudo);
            Assert.Equal("User", savedUser.Role.Label);
        }

        [Fact]
        public async Task CanAddCharacterWithUser()
        {
            // Arrange
            using var context = CreateDbContext();
            var role = await context.Roles.FirstAsync(r => r.Label == "User");

            var user = new User
            {
                Pseudo = $"char_owner_{Guid.NewGuid():N}"[..20],
                Email = $"char_owner_{Guid.NewGuid():N}@test.com",
                PasswordHash = "hashed_password",
                RoleId = role.Id
            };
            context.Users.Add(user);
            await context.SaveChangesAsync();

            var character = new Character
            {
                Name = "Thorin",
                Gender = Gender.Male,
                SkinColor = "#E8BEAC",
                EyeColor = "#4A90D9",
                HairColor = "#2C1810",
                EyeShape = "almond",
                NoseShape = "aquiline",
                MouthShape = "thin",
                UserId = user.Id
            };

            // Act
            context.Characters.Add(character);
            await context.SaveChangesAsync();

            // Assert
            var savedCharacter = await context.Characters
                .Include(c => c.User)
                .FirstAsync(c => c.Id == character.Id);

            Assert.Equal("Thorin", savedCharacter.Name);
            Assert.Equal(Gender.Male, savedCharacter.Gender);
            Assert.Equal(user.Pseudo, savedCharacter.User.Pseudo);
        }

        [Fact]
        public async Task CanEquipArticleToCharacter()
        {
            // Arrange
            using var context = CreateDbContext();
            var role = await context.Roles.FirstAsync(r => r.Label == "User");

            var user = new User
            {
                Pseudo = $"equip_user_{Guid.NewGuid():N}"[..20],
                Email = $"equip_user_{Guid.NewGuid():N}@test.com",
                PasswordHash = "hashed_password",
                RoleId = role.Id
            };
            context.Users.Add(user);

            var article = new Article
            {
                Name = "Iron Sword",
                Type = ArticleType.Weapon
            };
            context.Articles.Add(article);
            await context.SaveChangesAsync();

            var character = new Character
            {
                Name = "Warrior",
                Gender = Gender.Male,
                SkinColor = "#E8BEAC",
                EyeColor = "#4A90D9",
                HairColor = "#2C1810",
                EyeShape = "almond",
                NoseShape = "aquiline",
                MouthShape = "thin",
                UserId = user.Id
            };
            context.Characters.Add(character);
            await context.SaveChangesAsync();

            var characterArticle = new CharacterArticle
            {
                CharacterId = character.Id,
                ArticleId = article.Id
            };

            // Act
            context.CharacterArticles.Add(characterArticle);
            await context.SaveChangesAsync();

            // Assert
            var savedCharacter = await context.Characters
                .Include(c => c.CharacterArticles)
                .ThenInclude(ca => ca.Article)
                .FirstAsync(c => c.Id == character.Id);

            Assert.Single(savedCharacter.CharacterArticles);
            Assert.Equal("Iron Sword", savedCharacter.CharacterArticles.First().Article.Name);
        }

        [Fact]
        public async Task CanAddCommentToCharacter()
        {
            // Arrange
            using var context = CreateDbContext();
            var role = await context.Roles.FirstAsync(r => r.Label == "User");

            var owner = new User
            {
                Pseudo = $"owner_{Guid.NewGuid():N}"[..20],
                Email = $"owner_{Guid.NewGuid():N}@test.com",
                PasswordHash = "hashed_password",
                RoleId = role.Id
            };
            var commenter = new User
            {
                Pseudo = $"commenter_{Guid.NewGuid():N}"[..20],
                Email = $"commenter_{Guid.NewGuid():N}@test.com",
                PasswordHash = "hashed_password",
                RoleId = role.Id
            };
            context.Users.AddRange(owner, commenter);
            await context.SaveChangesAsync();

            var character = new Character
            {
                Name = "SharedHero",
                Gender = Gender.Female,
                SkinColor = "#E8BEAC",
                EyeColor = "#4A90D9",
                HairColor = "#2C1810",
                EyeShape = "almond",
                NoseShape = "aquiline",
                MouthShape = "thin",
                IsShared = true,
                IsAuthorized = true,
                UserId = owner.Id
            };
            context.Characters.Add(character);
            await context.SaveChangesAsync();

            var comment = new Comment
            {
                Rating = 5,
                Text = "Amazing character!",
                Status = CommentStatus.Approved,
                CommentedAt = DateTime.UtcNow,
                CharacterId = character.Id,
                AuthorId = commenter.Id
            };

            // Act
            context.Comments.Add(comment);
            await context.SaveChangesAsync();

            // Assert
            var savedComment = await context.Comments
                .Include(c => c.Character)
                .Include(c => c.Author)
                .FirstAsync(c => c.Id == comment.Id);

            Assert.Equal(5, savedComment.Rating);
            Assert.Equal("SharedHero", savedComment.Character.Name);
            Assert.Equal(commenter.Pseudo, savedComment.Author.Pseudo);
        }

        [Fact]
        public async Task UniqueEmailConstraint_ThrowsOnDuplicate()
        {
            // Arrange
            using var context = CreateDbContext();
            var role = await context.Roles.FirstAsync(r => r.Label == "User");
            var email = $"unique_{Guid.NewGuid():N}@test.com";

            var user1 = new User
            {
                Pseudo = $"user1_{Guid.NewGuid():N}"[..20],
                Email = email,
                PasswordHash = "hashed_password",
                RoleId = role.Id
            };
            context.Users.Add(user1);
            await context.SaveChangesAsync();

            var user2 = new User
            {
                Pseudo = $"user2_{Guid.NewGuid():N}"[..20],
                Email = email,
                PasswordHash = "hashed_password",
                RoleId = role.Id
            };
            context.Users.Add(user2);

            // Act & Assert
            await Assert.ThrowsAsync<DbUpdateException>(() => context.SaveChangesAsync());
        }

        [Fact]
        public async Task UniquePseudoConstraint_ThrowsOnDuplicate()
        {
            // Arrange
            using var context = CreateDbContext();
            var role = await context.Roles.FirstAsync(r => r.Label == "User");
            var pseudo = $"dup_{Guid.NewGuid():N}"[..20];

            var user1 = new User
            {
                Pseudo = pseudo,
                Email = $"user1_{Guid.NewGuid():N}@test.com",
                PasswordHash = "hashed_password",
                RoleId = role.Id
            };
            context.Users.Add(user1);
            await context.SaveChangesAsync();

            var user2 = new User
            {
                Pseudo = pseudo,
                Email = $"user2_{Guid.NewGuid():N}@test.com",
                PasswordHash = "hashed_password",
                RoleId = role.Id
            };
            context.Users.Add(user2);

            // Act & Assert
            await Assert.ThrowsAsync<DbUpdateException>(() => context.SaveChangesAsync());
        }

        [Fact]
        public async Task CommentRatingConstraint_EnforcesRange()
        {
            // Arrange
            using var context = CreateDbContext();
            var role = await context.Roles.FirstAsync(r => r.Label == "User");

            var user = new User
            {
                Pseudo = $"rating_user_{Guid.NewGuid():N}"[..20],
                Email = $"rating_user_{Guid.NewGuid():N}@test.com",
                PasswordHash = "hashed_password",
                RoleId = role.Id
            };
            context.Users.Add(user);
            await context.SaveChangesAsync();

            var character = new Character
            {
                Name = "TestChar",
                Gender = Gender.Male,
                SkinColor = "#E8BEAC",
                EyeColor = "#4A90D9",
                HairColor = "#2C1810",
                EyeShape = "almond",
                NoseShape = "aquiline",
                MouthShape = "thin",
                IsShared = true,
                IsAuthorized = true,
                UserId = user.Id
            };
            context.Characters.Add(character);
            await context.SaveChangesAsync();

            var invalidComment = new Comment
            {
                Rating = 10,
                Text = "Invalid rating",
                Status = CommentStatus.Pending,
                CommentedAt = DateTime.UtcNow,
                CharacterId = character.Id,
                AuthorId = user.Id
            };
            context.Comments.Add(invalidComment);

            // Act & Assert
            await Assert.ThrowsAsync<DbUpdateException>(() => context.SaveChangesAsync());
        }
    }
}
