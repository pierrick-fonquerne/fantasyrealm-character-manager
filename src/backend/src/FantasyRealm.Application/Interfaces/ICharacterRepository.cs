using FantasyRealm.Application.DTOs;
using FantasyRealm.Domain.Entities;

namespace FantasyRealm.Application.Interfaces
{
    /// <summary>
    /// Repository contract for character persistence operations.
    /// </summary>
    public interface ICharacterRepository
    {
        /// <summary>
        /// Returns a character by its identifier, including the related class.
        /// </summary>
        Task<Character?> GetByIdAsync(int id, CancellationToken cancellationToken);

        /// <summary>
        /// Returns all characters belonging to a specific user.
        /// </summary>
        Task<IReadOnlyList<Character>> GetByUserIdAsync(int userId, CancellationToken cancellationToken);

        /// <summary>
        /// Persists a new character.
        /// </summary>
        Task<Character> CreateAsync(Character character, CancellationToken cancellationToken);

        /// <summary>
        /// Saves changes to an existing character.
        /// </summary>
        Task UpdateAsync(Character character, CancellationToken cancellationToken);

        /// <summary>
        /// Removes a character from the database.
        /// </summary>
        Task DeleteAsync(Character character, CancellationToken cancellationToken);

        /// <summary>
        /// Checks whether a character with the given name already exists for a specific user.
        /// </summary>
        Task<bool> ExistsByNameAndUserAsync(string name, int userId, int? excludeCharacterId, CancellationToken cancellationToken);

        /// <summary>
        /// Returns a paginated list of approved and shared characters for the public gallery.
        /// Uses server-side projection to avoid loading sensitive user data into memory.
        /// Supports optional filtering by gender and author pseudo, with configurable sorting.
        /// </summary>
        Task<(IReadOnlyList<GalleryCharacterResponse> Items, int TotalCount)> GetGalleryAsync(
            string? gender,
            string? authorPseudo,
            string sortBy,
            int page,
            int pageSize,
            CancellationToken cancellationToken);

        /// <summary>
        /// Returns a character by its identifier, including the related class and owner.
        /// Used by moderation workflows that need access to the owner's email and pseudo.
        /// </summary>
        Task<Character?> GetByIdWithUserAsync(int id, CancellationToken cancellationToken);

        /// <summary>
        /// Returns a paginated list of characters pending moderation review.
        /// Uses server-side projection to avoid loading sensitive user data into memory.
        /// Results are ordered by submission date (oldest first).
        /// </summary>
        Task<(IReadOnlyList<PendingCharacterResponse> Items, int TotalCount)> GetPendingForModerationAsync(
            int page,
            int pageSize,
            CancellationToken cancellationToken);
    }
}
