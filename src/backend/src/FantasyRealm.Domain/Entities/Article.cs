namespace FantasyRealm.Domain.Entities
{
    /// <summary>
    /// Represents a customization item (clothing, armor, weapon, accessory).
    /// </summary>
    public class Article
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public int TypeId { get; set; }

        public int SlotId { get; set; }

        public byte[]? Image { get; set; }

        public bool IsActive { get; set; } = true;

        public ArticleType Type { get; set; } = null!;

        public EquipmentSlot Slot { get; set; } = null!;

        public ICollection<CharacterArticle> CharacterArticles { get; set; } = [];
    }
}
