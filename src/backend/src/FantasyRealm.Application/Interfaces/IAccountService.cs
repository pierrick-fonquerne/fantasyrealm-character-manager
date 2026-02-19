using FantasyRealm.Application.Common;

namespace FantasyRealm.Application.Interfaces
{
    /// <summary>
    /// Service for user account self-management operations (RGPD compliance).
    /// </summary>
    public interface IAccountService
    {
        /// <summary>
        /// Permanently deletes the authenticated user's account and all associated data
        /// after password verification. Sends a confirmation email and logs the activity.
        /// </summary>
        /// <param name="userId">The ID of the authenticated user requesting deletion.</param>
        /// <param name="password">The user's current password for confirmation.</param>
        /// <param name="cancellationToken">A cancellation token.</param>
        /// <returns>A result indicating success or failure with error details.</returns>
        Task<Result<Unit>> DeleteAccountAsync(int userId, string password, CancellationToken cancellationToken = default);
    }
}
