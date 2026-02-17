using FantasyRealm.Domain.Enums;

namespace FantasyRealm.Domain.Entities
{
    /// <summary>
    /// Represents a user review on a shared character.
    /// </summary>
    public class Comment
    {
        public int Id { get; set; }

        public int Rating { get; set; }

        public string Text { get; set; } = string.Empty;

        public CommentStatus Status { get; set; }

        public DateTime CommentedAt { get; set; }

        public int CharacterId { get; set; }

        public Character Character { get; set; } = null!;

        public string? RejectionReason { get; set; }

        public DateTime? ReviewedAt { get; set; }

        public int AuthorId { get; set; }

        public User Author { get; set; } = null!;

        public int? ReviewedById { get; set; }

        public User? ReviewedBy { get; set; }
    }
}
