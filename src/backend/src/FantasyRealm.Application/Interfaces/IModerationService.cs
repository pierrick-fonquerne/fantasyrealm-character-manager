using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;

namespace FantasyRealm.Application.Interfaces
{
    /// <summary>
    /// Defines the contract for character moderation operations performed by employees.
    /// </summary>
    public interface IModerationService
    {
        /// <summary>
        /// Returns a paginated list of characters pending moderation review.
        /// </summary>
        /// <param name="page">Page number (1-based).</param>
        /// <param name="pageSize">Number of items per page.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task<Result<PagedResponse<PendingCharacterResponse>>> GetPendingCharactersAsync(
            int page,
            int pageSize,
            CancellationToken cancellationToken);

        /// <summary>
        /// Approves a character pending moderation, making it visible in the gallery.
        /// Sends a notification email to the character owner.
        /// </summary>
        /// <param name="characterId">The character identifier.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task<Result<CharacterResponse>> ApproveAsync(
            int characterId,
            CancellationToken cancellationToken);

        /// <summary>
        /// Rejects a character pending moderation with a mandatory reason.
        /// Sends a notification email to the character owner with the rejection reason.
        /// </summary>
        /// <param name="characterId">The character identifier.</param>
        /// <param name="reason">The rejection reason (required).</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task<Result<CharacterResponse>> RejectAsync(
            int characterId,
            string reason,
            CancellationToken cancellationToken);
    }
}
