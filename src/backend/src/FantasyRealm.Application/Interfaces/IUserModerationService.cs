using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;

namespace FantasyRealm.Application.Interfaces
{
    /// <summary>
    /// Defines the contract for user management operations performed by employees.
    /// </summary>
    public interface IUserModerationService
    {
        /// <summary>
        /// Returns a paginated list of users with optional search and suspension filter.
        /// Only users with the "user" role are returned.
        /// </summary>
        /// <param name="page">Page number (1-based).</param>
        /// <param name="pageSize">Number of items per page.</param>
        /// <param name="search">Optional search term for pseudo or email.</param>
        /// <param name="isSuspended">Optional filter by suspension status.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task<Result<PagedResponse<UserManagementResponse>>> GetUsersAsync(
            int page,
            int pageSize,
            string? search,
            bool? isSuspended,
            CancellationToken cancellationToken);

        /// <summary>
        /// Returns the total number of users with the "user" role.
        /// </summary>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task<Result<int>> CountUsersAsync(CancellationToken cancellationToken);

        /// <summary>
        /// Suspends a user account with a mandatory reason.
        /// Sends a notification email to the user.
        /// </summary>
        /// <param name="userId">The user identifier.</param>
        /// <param name="reason">The suspension reason (required, 10-500 characters).</param>
        /// <param name="reviewerId">The employee performing the action.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task<Result<UserManagementResponse>> SuspendAsync(
            int userId,
            string reason,
            int reviewerId,
            CancellationToken cancellationToken);

        /// <summary>
        /// Reactivates a suspended user account.
        /// Sends a notification email to the user.
        /// </summary>
        /// <param name="userId">The user identifier.</param>
        /// <param name="reviewerId">The employee performing the action.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task<Result<UserManagementResponse>> ReactivateAsync(
            int userId,
            int reviewerId,
            CancellationToken cancellationToken);

        /// <summary>
        /// Permanently deletes a user account and all associated data.
        /// Sends a notification email before deletion.
        /// </summary>
        /// <param name="userId">The user identifier.</param>
        /// <param name="reviewerId">The employee performing the action.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task<Result<Unit>> DeleteAsync(
            int userId,
            int reviewerId,
            CancellationToken cancellationToken);
    }
}
