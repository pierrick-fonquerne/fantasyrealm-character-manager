using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;

namespace FantasyRealm.Application.Interfaces
{
    /// <summary>
    /// Contract for character equipment operations (equip, unequip, list).
    /// </summary>
    public interface ICharacterEquipmentService
    {
        /// <summary>
        /// Returns the list of articles currently equipped on a character.
        /// </summary>
        /// <param name="characterId">The character identifier.</param>
        /// <param name="userId">The requesting user identifier (must be the owner).</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task<Result<IReadOnlyList<EquippedArticleResponse>>> GetEquipmentAsync(
            int characterId,
            int userId,
            CancellationToken cancellationToken);

        /// <summary>
        /// Equips an active article on a character, replacing any existing article in the same slot.
        /// </summary>
        /// <param name="characterId">The character identifier.</param>
        /// <param name="articleId">The article identifier to equip.</param>
        /// <param name="userId">The requesting user identifier (must be the owner).</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task<Result<bool>> EquipArticleAsync(
            int characterId,
            int articleId,
            int userId,
            CancellationToken cancellationToken);

        /// <summary>
        /// Unequips an article from a character.
        /// </summary>
        /// <param name="characterId">The character identifier.</param>
        /// <param name="articleId">The article identifier to unequip.</param>
        /// <param name="userId">The requesting user identifier (must be the owner).</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task<Result<bool>> UnequipArticleAsync(
            int characterId,
            int articleId,
            int userId,
            CancellationToken cancellationToken);
    }
}
