using System.IdentityModel.Tokens.Jwt;
using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FantasyRealm.Api.Controllers
{
    /// <summary>
    /// Controller for user account self-management operations (RGPD compliance).
    /// </summary>
    [ApiController]
    [Route("api/account")]
    [Authorize(Policy = "RequireUser")]
    public sealed class AccountController(IAccountService accountService) : ControllerBase
    {
        /// <summary>
        /// Permanently deletes the authenticated user's account and all associated data.
        /// Requires password confirmation for security.
        /// </summary>
        /// <param name="request">The deletion request containing the user's password for confirmation.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>No content on success.</returns>
        /// <response code="204">Account successfully deleted.</response>
        /// <response code="400">Invalid request data.</response>
        /// <response code="401">Not authenticated or incorrect password.</response>
        /// <response code="403">Account type cannot be deleted via this endpoint.</response>
        [HttpDelete]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> DeleteAccount(
            [FromBody] DeleteAccountRequest request,
            CancellationToken cancellationToken)
        {
            var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Token invalide." });
            }

            var result = await accountService.DeleteAccountAsync(userId, request.Password, cancellationToken);

            if (result.IsFailure)
            {
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });
            }

            return NoContent();
        }
    }
}
