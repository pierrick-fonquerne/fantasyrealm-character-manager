using FantasyRealm.Application.DTOs;
using FantasyRealm.Domain.Entities;

namespace FantasyRealm.Application.Mapping
{
    /// <summary>
    /// Provides centralized mapping between <see cref="Comment"/> entities and DTOs.
    /// </summary>
    public static class CommentMapper
    {
        /// <summary>
        /// Maps a <see cref="Comment"/> entity to a <see cref="CommentResponse"/> DTO.
        /// </summary>
        /// <param name="comment">The comment entity to map. Must include the <see cref="Comment.Author"/> navigation property.</param>
        /// <returns>A fully populated <see cref="CommentResponse"/>.</returns>
        public static CommentResponse ToResponse(Comment comment)
        {
            return new CommentResponse(
                comment.Id,
                comment.Rating,
                comment.Text,
                comment.Status.ToString(),
                comment.CommentedAt,
                comment.CharacterId,
                comment.AuthorId,
                comment.Author.Pseudo,
                comment.RejectionReason);
        }

        /// <summary>
        /// Maps a <see cref="Comment"/> entity to a <see cref="PendingCommentResponse"/> DTO for moderation.
        /// </summary>
        /// <param name="comment">The comment entity. Must include <see cref="Comment.Author"/> and <see cref="Comment.Character"/> navigation properties.</param>
        /// <returns>A fully populated <see cref="PendingCommentResponse"/>.</returns>
        public static PendingCommentResponse ToPendingResponse(Comment comment)
        {
            return new PendingCommentResponse(
                comment.Id,
                comment.Rating,
                comment.Text,
                comment.CommentedAt,
                comment.CharacterId,
                comment.Character.Name,
                comment.AuthorId,
                comment.Author.Pseudo);
        }

        /// <summary>
        /// Creates a new <see cref="Comment"/> entity from a creation request.
        /// The comment is initialized with <see cref="CommentStatus.Pending"/> status.
        /// </summary>
        /// <param name="request">The creation request containing rating and text.</param>
        /// <param name="characterId">The target character identifier.</param>
        /// <param name="authorId">The authenticated user identifier.</param>
        /// <returns>A new <see cref="Comment"/> entity ready to be persisted.</returns>
        public static Comment ToEntity(CreateCommentRequest request, int characterId, int authorId)
        {
            return Comment.Create(request.Rating, request.Text, characterId, authorId);
        }
    }
}
