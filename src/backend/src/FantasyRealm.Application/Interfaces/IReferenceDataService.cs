using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;

namespace FantasyRealm.Application.Interfaces
{
    /// <summary>
    /// Service contract for game reference data (character classes, equipment slots).
    /// </summary>
    public interface IReferenceDataService
    {
        /// <summary>
        /// Returns all available character classes.
        /// </summary>
        Task<Result<IReadOnlyList<CharacterClassResponse>>> GetCharacterClassesAsync(CancellationToken cancellationToken);

        /// <summary>
        /// Returns all equipment slots ordered by display order.
        /// </summary>
        Task<Result<IReadOnlyList<EquipmentSlotResponse>>> GetEquipmentSlotsAsync(CancellationToken cancellationToken);

        /// <summary>
        /// Returns all article types.
        /// </summary>
        Task<Result<IReadOnlyList<ArticleTypeResponse>>> GetArticleTypesAsync(CancellationToken cancellationToken);
    }
}
