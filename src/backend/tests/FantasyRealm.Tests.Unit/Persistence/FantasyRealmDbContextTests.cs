using FantasyRealm.Domain.Entities;
using FantasyRealm.Domain.Enums;
using FantasyRealm.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FantasyRealm.Tests.Unit.Persistence
{
    public class FantasyRealmDbContextTests
    {
        private static DbContextOptions<FantasyRealmDbContext> CreateInMemoryOptions(string databaseName)
        {
            return new DbContextOptionsBuilder<FantasyRealmDbContext>()
                .UseInMemoryDatabase(databaseName: databaseName)
                .Options;
        }

        [Fact]
        public async Task CanAddAndRetrieveRole()
        {
            var options = CreateInMemoryOptions(nameof(CanAddAndRetrieveRole));

            using (var context = new FantasyRealmDbContext(options))
            {
                var role = new Role { Label = "user" };
                context.Roles.Add(role);
                await context.SaveChangesAsync();
            }

            using (var context = new FantasyRealmDbContext(options))
            {
                var role = await context.Roles.FirstOrDefaultAsync();
                Assert.NotNull(role);
                Assert.Equal("user", role.Label);
            }
        }

        [Fact]
        public async Task CanAddUserWithRole()
        {
            var options = CreateInMemoryOptions(nameof(CanAddUserWithRole));

            using (var context = new FantasyRealmDbContext(options))
            {
                var role = new Role { Label = "user" };
                context.Roles.Add(role);
                await context.SaveChangesAsync();

                var user = new User
                {
                    Pseudo = "player_one",
                    Email = "player@test.com",
                    PasswordHash = "hashed_password",
                    RoleId = role.Id
                };
                context.Users.Add(user);
                await context.SaveChangesAsync();
            }

            using (var context = new FantasyRealmDbContext(options))
            {
                var user = await context.Users.Include(u => u.Role).FirstOrDefaultAsync();
                Assert.NotNull(user);
                Assert.Equal("player_one", user.Pseudo);
                Assert.Equal("user", user.Role.Label);
            }
        }

        [Fact]
        public async Task CanAddCharacterWithUser()
        {
            var options = CreateInMemoryOptions(nameof(CanAddCharacterWithUser));

            using (var context = new FantasyRealmDbContext(options))
            {
                var role = new Role { Label = "user" };
                context.Roles.Add(role);
                await context.SaveChangesAsync();

                var user = new User
                {
                    Pseudo = "player_one",
                    Email = "player@test.com",
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
                context.Characters.Add(character);
                await context.SaveChangesAsync();
            }

            using (var context = new FantasyRealmDbContext(options))
            {
                var character = await context.Characters.Include(c => c.User).FirstOrDefaultAsync();
                Assert.NotNull(character);
                Assert.Equal("Thorin", character.Name);
                Assert.Equal(Gender.Male, character.Gender);
                Assert.Equal("player_one", character.User.Pseudo);
            }
        }

        [Fact]
        public async Task CanEquipArticleToCharacter()
        {
            var options = CreateInMemoryOptions(nameof(CanEquipArticleToCharacter));

            using (var context = new FantasyRealmDbContext(options))
            {
                var role = new Role { Label = "user" };
                context.Roles.Add(role);
                await context.SaveChangesAsync();

                var user = new User
                {
                    Pseudo = "player_one",
                    Email = "player@test.com",
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
                context.Characters.Add(character);
                await context.SaveChangesAsync();

                var characterArticle = new CharacterArticle
                {
                    CharacterId = character.Id,
                    ArticleId = article.Id
                };
                context.CharacterArticles.Add(characterArticle);
                await context.SaveChangesAsync();
            }

            using (var context = new FantasyRealmDbContext(options))
            {
                var character = await context.Characters
                    .Include(c => c.CharacterArticles)
                    .ThenInclude(ca => ca.Article)
                    .FirstOrDefaultAsync();

                Assert.NotNull(character);
                Assert.Single(character.CharacterArticles);
                Assert.Equal("Iron Sword", character.CharacterArticles.First().Article.Name);
            }
        }

        [Fact]
        public async Task CanAddCommentToCharacter()
        {
            var options = CreateInMemoryOptions(nameof(CanAddCommentToCharacter));

            using (var context = new FantasyRealmDbContext(options))
            {
                var role = new Role { Label = "user" };
                context.Roles.Add(role);
                await context.SaveChangesAsync();

                var owner = new User
                {
                    Pseudo = "owner",
                    Email = "owner@test.com",
                    PasswordHash = "hashed_password",
                    RoleId = role.Id
                };
                var commenter = new User
                {
                    Pseudo = "commenter",
                    Email = "commenter@test.com",
                    PasswordHash = "hashed_password",
                    RoleId = role.Id
                };
                context.Users.AddRange(owner, commenter);
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
                context.Comments.Add(comment);
                await context.SaveChangesAsync();
            }

            using (var context = new FantasyRealmDbContext(options))
            {
                var comment = await context.Comments
                    .Include(c => c.Character)
                    .Include(c => c.Author)
                    .FirstOrDefaultAsync();

                Assert.NotNull(comment);
                Assert.Equal(5, comment.Rating);
                Assert.Equal("Thorin", comment.Character.Name);
                Assert.Equal("commenter", comment.Author.Pseudo);
            }
        }

    }
}
