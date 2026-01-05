using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FantasyRealm.Api.Controllers
{
    /// <summary>
    /// Controller for authentication-related endpoints.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public sealed class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        /// <summary>
        /// Registers a new user account.
        /// </summary>
        /// <param name="request">The registration details.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The created user information.</returns>
        /// <response code="201">User successfully registered.</response>
        /// <response code="400">Invalid request data or password validation failed.</response>
        /// <response code="409">Email or pseudo already exists.</response>
        [HttpPost("register")]
        [ProducesResponseType(typeof(RegisterResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
        {
            var result = await _authService.RegisterAsync(request, cancellationToken);

            if (result.IsFailure)
            {
                return StatusCode(result.ErrorCode ?? 400, new { error = result.Error });
            }

            return CreatedAtAction(nameof(Register), new { id = result.Value!.Id }, result.Value);
        }
    }
}
