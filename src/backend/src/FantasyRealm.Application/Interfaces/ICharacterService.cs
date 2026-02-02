using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;

namespace FantasyRealm.Application.Interfaces
{
    /// <summary>
    /// Service contract for character management operations.
    /// </summary>
    public interface ICharacterService
    {
        /// <summary>
        /// Creates a new character for the specified user.
        /// </summary>
        Task<Result<CharacterResponse>> CreateAsync(int userId, CreateCharacterRequest request, CancellationToken cancellationToken);

        /// <summary>
        /// Returns a character by its identifier if the user is the owner.
        /// </summary>
        Task<Result<CharacterResponse>> GetByIdAsync(int characterId, int userId, CancellationToken cancellationToken);

        /// <summary>
        /// Returns all characters belonging to the specified user.
        /// </summary>
        Task<Result<IReadOnlyList<CharacterSummaryResponse>>> GetMyCharactersAsync(int userId, CancellationToken cancellationToken);

        /// <summary>
        /// Updates an existing character if the user is the owner and the status allows editing.
        /// </summary>
        Task<Result<CharacterResponse>> UpdateAsync(int characterId, int userId, UpdateCharacterRequest request, CancellationToken cancellationToken);

        /// <summary>
        /// Deletes a character if the user is the owner.
        /// </summary>
        Task<Result<bool>> DeleteAsync(int characterId, int userId, CancellationToken cancellationToken);

        /// <summary>
        /// Submits a character for moderation review (Draft or Rejected → Pending).
        /// </summary>
        Task<Result<CharacterResponse>> SubmitForReviewAsync(int characterId, int userId, CancellationToken cancellationToken);
    }
}
