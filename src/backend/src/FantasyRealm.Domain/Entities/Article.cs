using FantasyRealm.Domain.Exceptions;

namespace FantasyRealm.Domain.Entities
{
    /// <summary>
    /// Represents a customization item (clothing, armor, weapon, accessory).
    /// </summary>
    public class Article
    {
        public int Id { get; set; }

        public string Name { get; internal set; } = string.Empty;

        public int TypeId { get; internal set; }

        public int SlotId { get; internal set; }

        public byte[]? Image { get; internal set; }

        public bool IsActive { get; internal set; } = true;

        public DateTime CreatedAt { get; internal set; }

        public DateTime UpdatedAt { get; internal set; }

        public ArticleType Type { get; set; } = null!;

        public EquipmentSlot Slot { get; set; } = null!;

        public ICollection<CharacterArticle> CharacterArticles { get; set; } = [];

        /// <summary>
        /// Creates a new active article with the specified properties.
        /// </summary>
        /// <param name="name">The article display name (1-100 characters).</param>
        /// <param name="typeId">The article type identifier.</param>
        /// <param name="slotId">The equipment slot identifier.</param>
        /// <returns>A new <see cref="Article"/> instance in active state.</returns>
        /// <exception cref="DomainException">Thrown when the name is empty or exceeds 100 characters.</exception>
        public static Article Create(string name, int typeId, int slotId)
        {
            ValidateName(name);

            return new Article
            {
                Name = name.Trim(),
                TypeId = typeId,
                SlotId = slotId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }

        /// <summary>
        /// Updates the article properties.
        /// </summary>
        /// <param name="name">The new article display name (1-100 characters).</param>
        /// <param name="typeId">The new article type identifier.</param>
        /// <param name="slotId">The new equipment slot identifier.</param>
        /// <exception cref="DomainException">Thrown when the name is empty or exceeds 100 characters.</exception>
        public void Update(string name, int typeId, int slotId)
        {
            ValidateName(name);

            Name = name.Trim();
            TypeId = typeId;
            SlotId = slotId;
            UpdatedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Activates the article, making it available for use.
        /// </summary>
        public void Activate()
        {
            IsActive = true;
            UpdatedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Deactivates the article, hiding it from public listings.
        /// </summary>
        public void Deactivate()
        {
            IsActive = false;
            UpdatedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Sets or removes the article image.
        /// </summary>
        /// <param name="image">The image bytes, or <c>null</c> to remove the image.</param>
        public void SetImage(byte[]? image)
        {
            Image = image;
            UpdatedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Validates the article name against domain invariants.
        /// </summary>
        /// <param name="name">The name to validate.</param>
        /// <exception cref="DomainException">Thrown when the name is empty or exceeds 100 characters.</exception>
        private static void ValidateName(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new DomainException("Le nom de l'article est obligatoire.");

            if (name.Trim().Length > 100)
                throw new DomainException("Le nom de l'article ne peut pas dépasser 100 caractères.");
        }
    }
}
