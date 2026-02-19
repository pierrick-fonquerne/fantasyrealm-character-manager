using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FantasyRealm.Api.Controllers
{
    /// <summary>
    /// Controller for character moderation endpoints used by employees.
    /// </summary>
    [ApiController]
    [Route("api/moderation/characters")]
    [Authorize(Policy = "RequireEmployee")]
    public sealed class ModerationController(IModerationService moderationService) : ControllerBase
    {
        /// <summary>
        /// Returns a paginated list of characters pending moderation review.
        /// </summary>
        /// <param name="page">Page number (1-based, default 1).</param>
        /// <param name="pageSize">Items per page (default 12, max 50).</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A paginated list of pending characters.</returns>
        /// <response code="200">Pending characters retrieved successfully.</response>
        [HttpGet]
        [ProducesResponseType(typeof(PagedResponse<PendingCharacterResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPending(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 12,
            CancellationToken cancellationToken = default)
        {
            var result = await moderationService.GetPendingCharactersAsync(page, pageSize, cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });

            return Ok(result.Value);
        }

        /// <summary>
        /// Approves a character pending moderation, changing its status to Approved.
        /// Sends a notification email to the character owner.
        /// </summary>
        /// <param name="id">The character identifier.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The updated character with Approved status.</returns>
        /// <response code="200">Character approved successfully.</response>
        /// <response code="400">Character is not in Pending status.</response>
        /// <response code="404">Character not found.</response>
        [HttpPatch("{id:int}/approve")]
        [ProducesResponseType(typeof(CharacterResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Approve(int id, CancellationToken cancellationToken)
        {
            var result = await moderationService.ApproveAsync(id, cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });

            return Ok(result.Value);
        }

        /// <summary>
        /// Rejects a character pending moderation with a mandatory reason.
        /// Sends a notification email to the character owner with the rejection reason.
        /// </summary>
        /// <param name="id">The character identifier.</param>
        /// <param name="request">The rejection payload containing the reason.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The updated character with Rejected status.</returns>
        /// <response code="200">Character rejected successfully.</response>
        /// <response code="400">Character is not in Pending status or reason is missing.</response>
        /// <response code="404">Character not found.</response>
        [HttpPatch("{id:int}/reject")]
        [ProducesResponseType(typeof(CharacterResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Reject(int id, [FromBody] RejectCharacterRequest request, CancellationToken cancellationToken)
        {
            var result = await moderationService.RejectAsync(id, request.Reason, cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });

            return Ok(result.Value);
        }
    }
}
