namespace FantasyRealm.Domain.Entities
{
    /// <summary>
    /// Represents a reference type for customization articles (e.g. Clothing, Armor, Weapon, Accessory).
    /// </summary>
    public class ArticleType
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public ICollection<Article> Articles { get; set; } = [];
    }
}
