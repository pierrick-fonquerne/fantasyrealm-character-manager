using FantasyRealm.Domain.Enums;

namespace FantasyRealm.Domain.Entities
{
    /// <summary>
    /// Represents a customization item (clothing, armor, weapon, accessory).
    /// </summary>
    public class Article
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public ArticleType Type { get; set; }

        public byte[]? Image { get; set; }

        public bool IsActive { get; set; } = true;

        public ICollection<CharacterArticle> CharacterArticles { get; set; } = [];
    }
}
