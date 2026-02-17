using System.IdentityModel.Tokens.Jwt;
using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FantasyRealm.Api.Controllers
{
    /// <summary>
    /// Controller for comment moderation endpoints used by employees.
    /// </summary>
    [ApiController]
    [Route("api/moderation/comments")]
    [Authorize(Policy = "RequireEmployee")]
    public sealed class CommentModerationController(ICommentModerationService commentModerationService) : ControllerBase
    {
        /// <summary>
        /// Returns a paginated list of comments pending moderation review.
        /// </summary>
        /// <param name="page">Page number (1-based, default 1).</param>
        /// <param name="pageSize">Items per page (default 12, max 50).</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A paginated list of pending comments.</returns>
        /// <response code="200">Pending comments retrieved successfully.</response>
        [HttpGet]
        [ProducesResponseType(typeof(PagedResponse<PendingCommentResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPending(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 12,
            CancellationToken cancellationToken = default)
        {
            var result = await commentModerationService.GetPendingCommentsAsync(page, pageSize, cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });

            return Ok(result.Value);
        }

        /// <summary>
        /// Approves a comment pending moderation, making it publicly visible.
        /// Sends a notification email to the comment author.
        /// </summary>
        /// <param name="id">The comment identifier.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The updated comment with Approved status.</returns>
        /// <response code="200">Comment approved successfully.</response>
        /// <response code="400">Comment is not in Pending status.</response>
        /// <response code="404">Comment not found.</response>
        [HttpPatch("{id:int}/approve")]
        [ProducesResponseType(typeof(CommentResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Approve(int id, CancellationToken cancellationToken)
        {
            if (!TryGetUserId(out var reviewerId))
                return Unauthorized(new { message = "Utilisateur non identifié." });

            var result = await commentModerationService.ApproveAsync(id, reviewerId, cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });

            return Ok(result.Value);
        }

        /// <summary>
        /// Rejects a comment pending moderation with a mandatory reason.
        /// Sends a notification email to the comment author with the rejection reason.
        /// </summary>
        /// <param name="id">The comment identifier.</param>
        /// <param name="request">The rejection payload containing the reason.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The updated comment with Rejected status.</returns>
        /// <response code="200">Comment rejected successfully.</response>
        /// <response code="400">Comment is not in Pending status or reason is missing.</response>
        /// <response code="404">Comment not found.</response>
        [HttpPatch("{id:int}/reject")]
        [ProducesResponseType(typeof(CommentResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Reject(int id, [FromBody] RejectCommentRequest request, CancellationToken cancellationToken)
        {
            if (!TryGetUserId(out var reviewerId))
                return Unauthorized(new { message = "Utilisateur non identifié." });

            var result = await commentModerationService.RejectAsync(id, request.Reason, reviewerId, cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });

            return Ok(result.Value);
        }

        private bool TryGetUserId(out int userId)
        {
            userId = 0;
            var claim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            return !string.IsNullOrEmpty(claim) && int.TryParse(claim, out userId);
        }
    }
}
