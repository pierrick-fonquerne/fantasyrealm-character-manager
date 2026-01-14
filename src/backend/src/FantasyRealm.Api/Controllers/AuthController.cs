using System.IdentityModel.Tokens.Jwt;
using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
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
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });
            }

            return CreatedAtAction(nameof(Register), new { id = result.Value!.Id }, result.Value);
        }

        /// <summary>
        /// Authenticates a user and returns a JWT token.
        /// </summary>
        /// <param name="request">The login credentials.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The JWT token and user information.</returns>
        /// <response code="200">Login successful.</response>
        /// <response code="401">Invalid credentials.</response>
        /// <response code="403">Account suspended.</response>
        [HttpPost("login")]
        [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
        {
            var result = await _authService.LoginAsync(request, cancellationToken);

            if (result.IsFailure)
            {
                return StatusCode(result.ErrorCode ?? 401, new { message = result.Error });
            }

            return Ok(result.Value);
        }

        /// <summary>
        /// Initiates a password reset by generating and sending a temporary password.
        /// </summary>
        /// <param name="request">The email and pseudo for identity verification.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>Success message.</returns>
        /// <response code="200">Password reset email sent successfully.</response>
        /// <response code="400">Invalid request data.</response>
        /// <response code="403">Account suspended.</response>
        /// <response code="404">No account matches the provided email and pseudo.</response>
        [HttpPost("forgot-password")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request, CancellationToken cancellationToken)
        {
            var result = await _authService.ForgotPasswordAsync(request, cancellationToken);

            if (result.IsFailure)
            {
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });
            }

            return Ok(new { message = "Un nouveau mot de passe a été envoyé à votre adresse email." });
        }

        /// <summary>
        /// Changes the password for the authenticated user.
        /// </summary>
        /// <param name="request">The current and new password details.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A new JWT token upon successful password change.</returns>
        /// <response code="200">Password changed successfully.</response>
        /// <response code="400">Invalid request data or password validation failed.</response>
        /// <response code="401">Not authenticated or current password is incorrect.</response>
        /// <response code="403">Account suspended.</response>
        [HttpPost("change-password")]
        [Authorize]
        [ProducesResponseType(typeof(ChangePasswordResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken cancellationToken)
        {
            var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Token invalide." });
            }

            var result = await _authService.ChangePasswordAsync(userId, request, cancellationToken);

            if (result.IsFailure)
            {
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });
            }

            return Ok(result.Value);
        }
    }
}
