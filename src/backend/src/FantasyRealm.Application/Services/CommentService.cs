using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using FantasyRealm.Application.Mapping;
using FantasyRealm.Domain.Enums;

namespace FantasyRealm.Application.Services
{
    /// <summary>
    /// Handles comment creation, retrieval, and deletion on shared characters.
    /// </summary>
    public sealed class CommentService(
        ICommentRepository commentRepository,
        ICharacterRepository characterRepository) : ICommentService
    {
        /// <inheritdoc />
        public async Task<Result<CommentResponse>> CreateAsync(int characterId, CreateCommentRequest request, int userId, CancellationToken cancellationToken)
        {
            if (request.Rating < 1 || request.Rating > 5)
                return Result<CommentResponse>.Failure("La note doit être comprise entre 1 et 5.");

            if (string.IsNullOrWhiteSpace(request.Text) || request.Text.Trim().Length < 10)
                return Result<CommentResponse>.Failure("Le commentaire doit contenir au moins 10 caractères.");

            if (request.Text.Trim().Length > 500)
                return Result<CommentResponse>.Failure("Le commentaire ne peut pas dépasser 500 caractères.");

            var character = await characterRepository.GetByIdAsync(characterId, cancellationToken);
            if (character is null)
                return Result<CommentResponse>.Failure("Personnage introuvable.", 404);

            if (character.Status != CharacterStatus.Approved)
                return Result<CommentResponse>.Failure("Seuls les personnages approuvés peuvent recevoir des avis.");

            if (character.UserId == userId)
                return Result<CommentResponse>.Failure("Vous ne pouvez pas commenter votre propre personnage.");

            var existing = await commentRepository.GetByCharacterAndAuthorAsync(characterId, userId, cancellationToken);
            if (existing is not null)
                return Result<CommentResponse>.Failure("Vous avez déjà donné votre avis sur ce personnage.", 409);

            var comment = CommentMapper.ToEntity(request, characterId, userId);
            var created = await commentRepository.AddAsync(comment, cancellationToken);

            return Result<CommentResponse>.Success(CommentMapper.ToResponse(created));
        }

        /// <inheritdoc />
        public async Task<Result<IReadOnlyList<CommentResponse>>> GetByCharacterAsync(int characterId, CancellationToken cancellationToken)
        {
            var character = await characterRepository.GetByIdAsync(characterId, cancellationToken);
            if (character is null)
                return Result<IReadOnlyList<CommentResponse>>.Failure("Personnage introuvable.", 404);

            var comments = await commentRepository.GetApprovedByCharacterAsync(characterId, cancellationToken);
            var responses = comments.Select(CommentMapper.ToResponse).ToList();

            return Result<IReadOnlyList<CommentResponse>>.Success(responses);
        }

        /// <inheritdoc />
        public async Task<Result<CommentResponse?>> GetMyCommentAsync(int characterId, int userId, CancellationToken cancellationToken)
        {
            var character = await characterRepository.GetByIdAsync(characterId, cancellationToken);
            if (character is null)
                return Result<CommentResponse?>.Failure("Personnage introuvable.", 404);

            var comment = await commentRepository.GetByCharacterAndAuthorAsync(characterId, userId, cancellationToken);

            return Result<CommentResponse?>.Success(comment is null ? null : CommentMapper.ToResponse(comment));
        }

        /// <inheritdoc />
        public async Task<Result<bool>> DeleteAsync(int commentId, int userId, CancellationToken cancellationToken)
        {
            var comment = await commentRepository.GetByIdAsync(commentId, cancellationToken);
            if (comment is null)
                return Result<bool>.Failure("Commentaire introuvable.", 404);

            if (comment.AuthorId != userId)
                return Result<bool>.Failure("Vous ne pouvez supprimer que vos propres commentaires.", 403);

            await commentRepository.DeleteAsync(comment, cancellationToken);

            return Result<bool>.Success(true);
        }
    }
}
