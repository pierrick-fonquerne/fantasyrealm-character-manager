using FantasyRealm.Domain.Enums;
using FantasyRealm.Domain.Exceptions;

namespace FantasyRealm.Domain.Entities
{
    /// <summary>
    /// Represents a user review on a shared character.
    /// </summary>
    public class Comment
    {
        public int Id { get; set; }

        public int Rating { get; internal set; }

        public string Text { get; internal set; } = string.Empty;

        public CommentStatus Status { get; internal set; }

        public DateTime CommentedAt { get; internal set; }

        public int CharacterId { get; internal set; }

        public Character Character { get; set; } = null!;

        public string? RejectionReason { get; internal set; }

        public DateTime? ReviewedAt { get; internal set; }

        public int AuthorId { get; internal set; }

        public User Author { get; set; } = null!;

        public int? ReviewedById { get; internal set; }

        public User? ReviewedBy { get; set; }

        /// <summary>
        /// Creates a new comment in pending status.
        /// </summary>
        /// <param name="rating">The rating value.</param>
        /// <param name="text">The comment text.</param>
        /// <param name="characterId">The target character identifier.</param>
        /// <param name="authorId">The author user identifier.</param>
        public static Comment Create(int rating, string text, int characterId, int authorId)
        {
            return new Comment
            {
                Rating = rating,
                Text = text,
                Status = CommentStatus.Pending,
                CommentedAt = DateTime.UtcNow,
                CharacterId = characterId,
                AuthorId = authorId
            };
        }

        /// <summary>
        /// Approves the comment after moderation review.
        /// </summary>
        /// <param name="reviewerId">The identifier of the moderator who approved the comment.</param>
        /// <exception cref="DomainException">Thrown when the comment is not pending review.</exception>
        public void Approve(int reviewerId)
        {
            if (Status is not CommentStatus.Pending)
                throw new DomainException("Seuls les commentaires en attente peuvent être approuvés.");

            Status = CommentStatus.Approved;
            ReviewedAt = DateTime.UtcNow;
            ReviewedById = reviewerId;
        }

        /// <summary>
        /// Rejects the comment after moderation review with a mandatory reason.
        /// </summary>
        /// <param name="reason">The rejection reason (10-500 characters).</param>
        /// <param name="reviewerId">The identifier of the moderator who rejected the comment.</param>
        /// <exception cref="DomainException">Thrown when the comment is not pending or the reason is invalid.</exception>
        public void Reject(string reason, int reviewerId)
        {
            if (Status is not CommentStatus.Pending)
                throw new DomainException("Seuls les commentaires en attente peuvent être rejetés.");

            if (string.IsNullOrWhiteSpace(reason))
                throw new DomainException("Le motif de rejet est obligatoire.");

            var trimmedReason = reason.Trim();

            if (trimmedReason.Length < 10)
                throw new DomainException("Le motif de rejet doit contenir au moins 10 caractères.");

            if (trimmedReason.Length > 500)
                throw new DomainException("Le motif de rejet ne peut pas dépasser 500 caractères.");

            Status = CommentStatus.Rejected;
            RejectionReason = trimmedReason;
            ReviewedAt = DateTime.UtcNow;
            ReviewedById = reviewerId;
        }
    }
}
