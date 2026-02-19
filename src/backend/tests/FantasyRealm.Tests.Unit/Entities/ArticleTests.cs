using FantasyRealm.Domain.Entities;
using FantasyRealm.Domain.Exceptions;
using FluentAssertions;

namespace FantasyRealm.Tests.Unit.Entities
{
    [Trait("Category", "Unit")]
    [Trait("Category", "Article")]
    public class ArticleTests
    {
        [Fact]
        public void Create_WithValidData_ReturnsArticle()
        {
            var article = Article.Create("Steel Sword", 3, 5);

            article.Name.Should().Be("Steel Sword");
            article.TypeId.Should().Be(3);
            article.SlotId.Should().Be(5);
            article.IsActive.Should().BeTrue();
            article.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(2));
            article.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(2));
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("   ")]
        public void Create_WithEmptyName_ThrowsDomainException(string? name)
        {
            var act = () => Article.Create(name!, 1, 1);

            act.Should().Throw<DomainException>()
                .WithMessage("Le nom de l'article est obligatoire.");
        }

        [Fact]
        public void Create_WithNameTooLong_ThrowsDomainException()
        {
            var longName = new string('A', 101);

            var act = () => Article.Create(longName, 1, 1);

            act.Should().Throw<DomainException>()
                .WithMessage("Le nom de l'article ne peut pas dépasser 100 caractères.");
        }

        [Fact]
        public void Create_TrimsName()
        {
            var article = Article.Create("  Steel Sword  ", 3, 5);

            article.Name.Should().Be("Steel Sword");
        }

        [Fact]
        public void Update_WithValidData_UpdatesProperties()
        {
            var article = Article.Create("Old Name", 1, 1);
            var beforeUpdate = article.UpdatedAt;

            article.Update("New Name", 2, 3);

            article.Name.Should().Be("New Name");
            article.TypeId.Should().Be(2);
            article.SlotId.Should().Be(3);
            article.UpdatedAt.Should().BeOnOrAfter(beforeUpdate);
        }

        [Fact]
        public void Update_WithEmptyName_ThrowsDomainException()
        {
            var article = Article.Create("Sword", 1, 1);

            var act = () => article.Update("", 1, 1);

            act.Should().Throw<DomainException>()
                .WithMessage("Le nom de l'article est obligatoire.");
        }

        [Fact]
        public void Activate_SetsIsActiveTrue()
        {
            var article = Article.Create("Sword", 1, 1);
            article.Deactivate();

            article.Activate();

            article.IsActive.Should().BeTrue();
        }

        [Fact]
        public void Deactivate_SetsIsActiveFalse()
        {
            var article = Article.Create("Sword", 1, 1);

            article.Deactivate();

            article.IsActive.Should().BeFalse();
        }

        [Fact]
        public void SetImage_SetsImageBytes()
        {
            var article = Article.Create("Sword", 1, 1);
            var imageBytes = new byte[] { 1, 2, 3 };

            article.SetImage(imageBytes);

            article.Image.Should().BeEquivalentTo(imageBytes);
        }

        [Fact]
        public void SetImage_WithNull_RemovesImage()
        {
            var article = Article.Create("Sword", 1, 1);
            article.SetImage(new byte[] { 1, 2, 3 });

            article.SetImage(null);

            article.Image.Should().BeNull();
        }
    }
}
