namespace FantasyRealm.Domain.Entities
{
    /// <summary>
    /// Represents the many-to-many relationship between characters and equipped articles.
    /// </summary>
    public class CharacterArticle
    {
        public int CharacterId { get; set; }

        public Character Character { get; set; } = null!;

        public int ArticleId { get; set; }

        public Article Article { get; set; } = null!;
    }
}
