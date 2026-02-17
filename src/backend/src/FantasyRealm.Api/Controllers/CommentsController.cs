using System.IdentityModel.Tokens.Jwt;
using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FantasyRealm.Api.Controllers
{
    /// <summary>
    /// Controller for comment management endpoints.
    /// </summary>
    [ApiController]
    public sealed class CommentsController(ICommentService commentService) : ControllerBase
    {
        /// <summary>
        /// Creates a new comment on an approved character.
        /// The author must not be the character owner and can only comment once per character.
        /// </summary>
        /// <param name="characterId">The target character identifier.</param>
        /// <param name="request">The comment creation payload containing rating and text.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The created comment.</returns>
        /// <response code="201">Comment created successfully.</response>
        /// <response code="400">Invalid request data or business rule violation.</response>
        /// <response code="404">Character not found.</response>
        /// <response code="409">The user has already commented on this character.</response>
        [HttpPost("api/characters/{characterId:int}/comments")]
        [Authorize(Policy = "RequireUser")]
        [ProducesResponseType(typeof(CommentResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Create(int characterId, [FromBody] CreateCommentRequest request, CancellationToken cancellationToken)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized(new { message = "Token invalide." });

            var result = await commentService.CreateAsync(characterId, request, userId, cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });

            return StatusCode(StatusCodes.Status201Created, result.Value);
        }

        /// <summary>
        /// Returns all approved comments for a given character.
        /// </summary>
        /// <param name="characterId">The character identifier.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A list of approved comments.</returns>
        /// <response code="200">Comments retrieved successfully.</response>
        /// <response code="404">Character not found.</response>
        [HttpGet("api/characters/{characterId:int}/comments")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(IReadOnlyList<CommentResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetByCharacter(int characterId, CancellationToken cancellationToken)
        {
            var result = await commentService.GetByCharacterAsync(characterId, cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });

            return Ok(result.Value);
        }

        /// <summary>
        /// Returns the authenticated user's own comment for a given character, regardless of status.
        /// </summary>
        /// <param name="characterId">The character identifier.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The user's comment or no content if none exists.</returns>
        /// <response code="200">Comment found.</response>
        /// <response code="204">The user has not commented on this character.</response>
        /// <response code="404">Character not found.</response>
        [HttpGet("api/characters/{characterId:int}/comments/mine")]
        [Authorize(Policy = "RequireUser")]
        [ProducesResponseType(typeof(CommentResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetMyComment(int characterId, CancellationToken cancellationToken)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized(new { message = "Token invalide." });

            var result = await commentService.GetMyCommentAsync(characterId, userId, cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });

            return result.Value is null ? NoContent() : Ok(result.Value);
        }

        /// <summary>
        /// Deletes a comment owned by the authenticated user.
        /// </summary>
        /// <param name="id">The comment identifier.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>No content on success.</returns>
        /// <response code="204">Comment deleted successfully.</response>
        /// <response code="403">The authenticated user is not the comment author.</response>
        /// <response code="404">Comment not found.</response>
        [HttpDelete("api/comments/{id:int}")]
        [Authorize(Policy = "RequireUser")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized(new { message = "Token invalide." });

            var result = await commentService.DeleteAsync(id, userId, cancellationToken);

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
