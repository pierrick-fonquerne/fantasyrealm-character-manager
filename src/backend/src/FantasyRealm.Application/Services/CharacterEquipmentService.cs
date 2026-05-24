using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using FantasyRealm.Domain.Exceptions;

namespace FantasyRealm.Application.Services
{
    /// <summary>
    /// Handles equipping and unequipping articles on player characters.
    /// </summary>
    public sealed class CharacterEquipmentService(
        ICharacterRepository characterRepository,
        IArticleRepository articleRepository) : ICharacterEquipmentService
    {
        /// <inheritdoc />
        public async Task<Result<IReadOnlyList<EquippedArticleResponse>>> GetEquipmentAsync(
            int characterId,
            int userId,
            CancellationToken cancellationToken)
        {
            var character = await characterRepository.GetByIdWithEquipmentAsync(characterId, cancellationToken);
            if (character is null)
                return Result<IReadOnlyList<EquippedArticleResponse>>.Failure("Personnage introuvable.", 404);

            if (character.UserId != userId)
                return Result<IReadOnlyList<EquippedArticleResponse>>.Failure("Accès non autorisé.", 403);

            IReadOnlyList<EquippedArticleResponse> equipment = character.CharacterArticles
                .Select(ca => new EquippedArticleResponse(
                    ca.ArticleId,
                    ca.Article.Name,
                    ca.Article.SlotId,
                    ca.Article.Slot.Name,
                    ca.Article.TypeId,
                    ca.Article.Type.Name))
                .ToList();

            return Result<IReadOnlyList<EquippedArticleResponse>>.Success(equipment);
        }

        /// <inheritdoc />
        public async Task<Result<bool>> EquipArticleAsync(
            int characterId,
            int articleId,
            int userId,
            CancellationToken cancellationToken)
        {
            var character = await characterRepository.GetByIdWithEquipmentAsync(characterId, cancellationToken);
            if (character is null)
                return Result<bool>.Failure("Personnage introuvable.", 404);

            if (character.UserId != userId)
                return Result<bool>.Failure("Accès non autorisé.", 403);

            var article = await articleRepository.GetByIdAsync(articleId, cancellationToken);
            if (article is null || !article.IsActive)
                return Result<bool>.Failure("Article introuvable ou inactif.", 404);

            try
            {
                character.Equip(article);
            }
            catch (DomainException ex)
            {
                return Result<bool>.Failure(ex.Message, 400);
            }

            await characterRepository.UpdateAsync(character, cancellationToken);
            return Result<bool>.Success(true);
        }

        /// <inheritdoc />
        public async Task<Result<bool>> UnequipArticleAsync(
            int characterId,
            int articleId,
            int userId,
            CancellationToken cancellationToken)
        {
            var character = await characterRepository.GetByIdWithEquipmentAsync(characterId, cancellationToken);
            if (character is null)
                return Result<bool>.Failure("Personnage introuvable.", 404);

            if (character.UserId != userId)
                return Result<bool>.Failure("Accès non autorisé.", 403);

            try
            {
                character.Unequip(articleId);
            }
            catch (DomainException ex)
            {
                return Result<bool>.Failure(ex.Message, 400);
            }

            await characterRepository.UpdateAsync(character, cancellationToken);
            return Result<bool>.Success(true);
        }
    }
}
