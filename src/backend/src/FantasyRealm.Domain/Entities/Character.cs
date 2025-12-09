using FantasyRealm.Domain.Enums;

namespace FantasyRealm.Domain.Entities
{
    /// <summary>
    /// Represents a player character created by a user.
    /// </summary>
    public class Character
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public Gender Gender { get; set; }

        public string SkinColor { get; set; } = string.Empty;

        public string EyeColor { get; set; } = string.Empty;

        public string HairColor { get; set; } = string.Empty;

        public string EyeShape { get; set; } = string.Empty;

        public string NoseShape { get; set; } = string.Empty;

        public string MouthShape { get; set; } = string.Empty;

        public string? Image { get; set; }

        public bool IsShared { get; set; }

        public bool IsAuthorized { get; set; }

        public int UserId { get; set; }

        public User User { get; set; } = null!;

        public ICollection<CharacterArticle> CharacterArticles { get; set; } = [];

        public ICollection<Comment> Comments { get; set; } = [];
    }
}
