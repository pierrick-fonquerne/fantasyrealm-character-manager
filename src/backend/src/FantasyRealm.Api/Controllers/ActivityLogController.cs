using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using FantasyRealm.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FantasyRealm.Api.Controllers
{
    /// <summary>
    /// Controller for activity log endpoints used by administrators.
    /// </summary>
    [ApiController]
    [Route("api/admin/activity-logs")]
    [Authorize(Policy = "RequireAdmin")]
    public sealed class ActivityLogController(IActivityLogService activityLogService) : ControllerBase
    {
        /// <summary>
        /// Returns a paginated list of activity logs with optional filters.
        /// </summary>
        /// <param name="page">Page number (1-based, default 1).</param>
        /// <param name="pageSize">Items per page (default 20, max 50).</param>
        /// <param name="action">Optional action type filter.</param>
        /// <param name="from">Optional start date filter (inclusive).</param>
        /// <param name="to">Optional end date filter (inclusive).</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A paginated list of activity logs.</returns>
        /// <response code="200">Activity logs retrieved successfully.</response>
        [HttpGet]
        [ProducesResponseType(typeof(PagedResponse<ActivityLogResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetLogs(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] ActivityAction? action = null,
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null,
            CancellationToken cancellationToken = default)
        {
            var result = await activityLogService.GetLogsAsync(page, pageSize, action, from, to, cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });

            return Ok(result.Value);
        }
    }
}
