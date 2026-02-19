using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;

namespace FantasyRealm.Application.Interfaces
{
    /// <summary>
    /// Service contract for comment management operations.
    /// </summary>
    public interface ICommentService
    {
        /// <summary>
        /// Creates a new comment on an approved character.
        /// The author must not be the character owner, and can only comment once per character.
        /// </summary>
        Task<Result<CommentResponse>> CreateAsync(int characterId, CreateCommentRequest request, int userId, CancellationToken cancellationToken);

        /// <summary>
        /// Returns all approved comments for a given character.
        /// </summary>
        Task<Result<IReadOnlyList<CommentResponse>>> GetByCharacterAsync(int characterId, CancellationToken cancellationToken);

        /// <summary>
        /// Returns the authenticated user's own comment for a given character, regardless of status.
        /// Returns null when the user has not commented yet.
        /// </summary>
        Task<Result<CommentResponse?>> GetMyCommentAsync(int characterId, int userId, CancellationToken cancellationToken);

        /// <summary>
        /// Deletes a comment if the requesting user is the author.
        /// </summary>
        Task<Result<bool>> DeleteAsync(int commentId, int userId, CancellationToken cancellationToken);
    }
}
