using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FantasyRealm.Api.Controllers
{
    /// <summary>
    /// Controller for administrator dashboard endpoints.
    /// </summary>
    [ApiController]
    [Route("api/admin")]
    [Authorize(Policy = "RequireAdmin")]
    public sealed class AdminController(IAdminService adminService) : ControllerBase
    {
        /// <summary>
        /// Returns aggregated platform statistics for the admin dashboard.
        /// </summary>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>Platform statistics including user, character, and comment counts.</returns>
        /// <response code="200">Statistics retrieved successfully.</response>
        [HttpGet("stats")]
        [ProducesResponseType(typeof(AdminStatsResponse), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetStats(CancellationToken cancellationToken)
        {
            var result = await adminService.GetStatsAsync(cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });

            return Ok(result.Value);
        }
    }
}
