using System.IdentityModel.Tokens.Jwt;
using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FantasyRealm.Api.Controllers
{
    /// <summary>
    /// Controller for employee management endpoints used by administrators.
    /// </summary>
    [ApiController]
    [Route("api/admin/employees")]
    [Authorize(Policy = "RequireAdmin")]
    public sealed class EmployeeManagementController(IEmployeeManagementService employeeManagementService) : ControllerBase
    {
        /// <summary>
        /// Returns a paginated list of employees with optional search and suspension filter.
        /// </summary>
        /// <param name="page">Page number (1-based, default 1).</param>
        /// <param name="pageSize">Items per page (default 12, max 50).</param>
        /// <param name="search">Optional search term for pseudo or email.</param>
        /// <param name="isSuspended">Optional filter by suspension status.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A paginated list of employees.</returns>
        /// <response code="200">Employees retrieved successfully.</response>
        [HttpGet]
        [ProducesResponseType(typeof(PagedResponse<EmployeeManagementResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetEmployees(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 12,
            [FromQuery] string? search = null,
            [FromQuery] bool? isSuspended = null,
            CancellationToken cancellationToken = default)
        {
            var result = await employeeManagementService.GetEmployeesAsync(page, pageSize, search, isSuspended, cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });

            return Ok(result.Value);
        }

        /// <summary>
        /// Returns the total number of employees.
        /// </summary>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The total employee count.</returns>
        /// <response code="200">Count retrieved successfully.</response>
        [HttpGet("count")]
        [ProducesResponseType(typeof(int), StatusCodes.Status200OK)]
        public async Task<IActionResult> Count(CancellationToken cancellationToken)
        {
            var result = await employeeManagementService.CountEmployeesAsync(cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });

            return Ok(result.Value);
        }

        /// <summary>
        /// Creates a new employee account with a generated temporary password.
        /// A welcome email with the credentials is sent automatically.
        /// </summary>
        /// <param name="request">The employee creation payload (email and pseudo).</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The created employee.</returns>
        /// <response code="201">Employee created successfully.</response>
        /// <response code="400">Invalid request data.</response>
        /// <response code="409">Email or pseudo already taken.</response>
        [HttpPost]
        [ProducesResponseType(typeof(EmployeeManagementResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Create([FromBody] CreateEmployeeRequest request, CancellationToken cancellationToken)
        {
            if (!TryGetUserId(out var adminId))
                return Unauthorized(new { message = "Utilisateur non identifié." });

            var result = await employeeManagementService.CreateAsync(request, adminId, cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });

            return CreatedAtAction(nameof(GetEmployees), null, result.Value);
        }

        /// <summary>
        /// Updates the suspension status of an employee account.
        /// When suspending, a reason is required (10-500 characters).
        /// Sends a notification email to the employee.
        /// </summary>
        /// <param name="id">The employee identifier.</param>
        /// <param name="request">The status update payload.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The updated employee.</returns>
        /// <response code="200">Employee status updated successfully.</response>
        /// <response code="400">Invalid status transition or missing reason.</response>
        /// <response code="403">Target user is not an employee.</response>
        /// <response code="404">Employee not found.</response>
        [HttpPatch("{id:int}")]
        [ProducesResponseType(typeof(EmployeeManagementResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateUserStatusRequest request, CancellationToken cancellationToken)
        {
            if (!TryGetUserId(out var adminId))
                return Unauthorized(new { message = "Utilisateur non identifié." });

            var result = request.IsSuspended
                ? await employeeManagementService.SuspendAsync(id, request.Reason ?? string.Empty, adminId, cancellationToken)
                : await employeeManagementService.ReactivateAsync(id, adminId, cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });

            return Ok(result.Value);
        }

        /// <summary>
        /// Permanently deletes an employee account.
        /// Sends a notification email before deletion.
        /// </summary>
        /// <param name="id">The employee identifier.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>No content on success.</returns>
        /// <response code="204">Employee deleted successfully.</response>
        /// <response code="403">Target user is not an employee.</response>
        /// <response code="404">Employee not found.</response>
        [HttpDelete("{id:int}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            if (!TryGetUserId(out var adminId))
                return Unauthorized(new { message = "Utilisateur non identifié." });

            var result = await employeeManagementService.DeleteAsync(id, adminId, cancellationToken);

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
