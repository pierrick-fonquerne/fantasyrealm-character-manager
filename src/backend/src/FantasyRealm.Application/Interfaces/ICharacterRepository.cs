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
    }
}
