using FantasyRealm.Domain.Entities;

namespace FantasyRealm.Application.Interfaces
{
    /// <summary>
    /// Repository contract for game reference data (character classes, equipment slots).
    /// </summary>
    public interface IReferenceDataRepository
    {
        /// <summary>
        /// Returns all character classes.
        /// </summary>
        Task<IReadOnlyList<CharacterClass>> GetAllClassesAsync(CancellationToken cancellationToken);

        /// <summary>
        /// Returns all equipment slots ordered by display order.
        /// </summary>
        Task<IReadOnlyList<EquipmentSlot>> GetAllSlotsAsync(CancellationToken cancellationToken);

        /// <summary>
        /// Returns all article types.
        /// </summary>
        Task<IReadOnlyList<ArticleType>> GetAllArticleTypesAsync(CancellationToken cancellationToken);
    }
}
