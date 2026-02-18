using System.IdentityModel.Tokens.Jwt;
using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FantasyRealm.Api.Controllers
{
    /// <summary>
    /// Controller for user management endpoints used by employees.
    /// </summary>
    [ApiController]
    [Route("api/moderation/users")]
    [Authorize(Policy = "RequireEmployee")]
    public sealed class UserModerationController(IUserModerationService userModerationService) : ControllerBase
    {
        /// <summary>
        /// Returns a paginated list of users with optional search and suspension filter.
        /// Only users with the "user" role are returned.
        /// </summary>
        /// <param name="page">Page number (1-based, default 1).</param>
        /// <param name="pageSize">Items per page (default 12, max 50).</param>
        /// <param name="search">Optional search term for pseudo or email.</param>
        /// <param name="isSuspended">Optional filter by suspension status.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A paginated list of users.</returns>
        /// <response code="200">Users retrieved successfully.</response>
        [HttpGet]
        [ProducesResponseType(typeof(PagedResponse<UserManagementResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetUsers(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 12,
            [FromQuery] string? search = null,
            [FromQuery] bool? isSuspended = null,
            CancellationToken cancellationToken = default)
        {
            var result = await userModerationService.GetUsersAsync(page, pageSize, search, isSuspended, cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });

            return Ok(result.Value);
        }

        /// <summary>
        /// Returns the total number of users with the "user" role.
        /// </summary>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The total user count.</returns>
        /// <response code="200">Count retrieved successfully.</response>
        [HttpGet("count")]
        [ProducesResponseType(typeof(int), StatusCodes.Status200OK)]
        public async Task<IActionResult> Count(CancellationToken cancellationToken)
        {
            var result = await userModerationService.CountUsersAsync(cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });

            return Ok(result.Value);
        }

        /// <summary>
        /// Updates the suspension status of a user account.
        /// When suspending, a reason is required (10-500 characters).
        /// Sends a notification email to the user.
        /// </summary>
        /// <param name="id">The user identifier.</param>
        /// <param name="request">The status update payload.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The updated user.</returns>
        /// <response code="200">User status updated successfully.</response>
        /// <response code="400">Invalid status transition or missing reason.</response>
        /// <response code="403">Target user is not a regular user.</response>
        /// <response code="404">User not found.</response>
        [HttpPatch("{id:int}")]
        [ProducesResponseType(typeof(UserManagementResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateUserStatusRequest request, CancellationToken cancellationToken)
        {
            if (!TryGetUserId(out var reviewerId))
                return Unauthorized(new { message = "Utilisateur non identifié." });

            var result = request.IsSuspended
                ? await userModerationService.SuspendAsync(id, request.Reason ?? string.Empty, reviewerId, cancellationToken)
                : await userModerationService.ReactivateAsync(id, reviewerId, cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });

            return Ok(result.Value);
        }

        /// <summary>
        /// Permanently deletes a user account and all associated data.
        /// Sends a notification email before deletion.
        /// </summary>
        /// <param name="id">The user identifier.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>No content on success.</returns>
        /// <response code="204">User deleted successfully.</response>
        /// <response code="403">Target user is not a regular user.</response>
        /// <response code="404">User not found.</response>
        [HttpDelete("{id:int}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            if (!TryGetUserId(out var reviewerId))
                return Unauthorized(new { message = "Utilisateur non identifié." });

            var result = await userModerationService.DeleteAsync(id, reviewerId, cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });

            return NoContent();
        }

        private bool TryGetUserId(out int userId)
        {
            userId = 0;
            var claim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            return !string.IsNullOrEmpty(claim) && int.TryParse(claim, out userId);
        }
    }
}
