using FantasyRealm.Domain.Entities;

namespace FantasyRealm.Application.Interfaces
{
    /// <summary>
    /// Repository contract for comment persistence operations.
    /// </summary>
    public interface ICommentRepository
    {
        /// <summary>
        /// Returns a comment by its identifier, including the related author.
        /// </summary>
        Task<Comment?> GetByIdAsync(int id, CancellationToken cancellationToken);

        /// <summary>
        /// Returns the comment left by a specific user on a specific character, if any.
        /// </summary>
        Task<Comment?> GetByCharacterAndAuthorAsync(int characterId, int authorId, CancellationToken cancellationToken);

        /// <summary>
        /// Returns all approved comments for a given character, including the author.
        /// Results are ordered by most recent first.
        /// </summary>
        Task<IReadOnlyList<Comment>> GetApprovedByCharacterAsync(int characterId, CancellationToken cancellationToken);

        /// <summary>
        /// Persists a new comment.
        /// </summary>
        Task<Comment> AddAsync(Comment comment, CancellationToken cancellationToken);

        /// <summary>
        /// Removes a comment from the database.
        /// </summary>
        Task DeleteAsync(Comment comment, CancellationToken cancellationToken);
    }
}
