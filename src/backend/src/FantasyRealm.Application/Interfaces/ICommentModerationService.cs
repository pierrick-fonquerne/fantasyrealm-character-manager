using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;

namespace FantasyRealm.Application.Interfaces
{
    /// <summary>
    /// Defines the contract for comment moderation operations performed by employees.
    /// </summary>
    public interface ICommentModerationService
    {
        /// <summary>
        /// Returns a paginated list of comments pending moderation review.
        /// </summary>
        /// <param name="page">Page number (1-based).</param>
        /// <param name="pageSize">Number of items per page.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task<Result<PagedResponse<PendingCommentResponse>>> GetPendingCommentsAsync(
            int page,
            int pageSize,
            CancellationToken cancellationToken);

        /// <summary>
        /// Approves a comment pending moderation, making it publicly visible.
        /// Sends a notification email to the comment author.
        /// </summary>
        /// <param name="commentId">The comment identifier.</param>
        /// <param name="reviewerId">The employee performing the review.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task<Result<CommentResponse>> ApproveAsync(
            int commentId,
            int reviewerId,
            CancellationToken cancellationToken);

        /// <summary>
        /// Rejects a comment pending moderation with a mandatory reason.
        /// Sends a notification email to the comment author with the rejection reason.
        /// </summary>
        /// <param name="commentId">The comment identifier.</param>
        /// <param name="reason">The rejection reason (required).</param>
        /// <param name="reviewerId">The employee performing the review.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task<Result<CommentResponse>> RejectAsync(
            int commentId,
            string reason,
            int reviewerId,
            CancellationToken cancellationToken);
    }
}
