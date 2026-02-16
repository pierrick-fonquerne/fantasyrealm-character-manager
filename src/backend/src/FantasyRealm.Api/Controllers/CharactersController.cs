using System.IdentityModel.Tokens.Jwt;
using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FantasyRealm.Api.Controllers
{
    /// <summary>
    /// Controller for character management endpoints.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "RequireUser")]
    public sealed class CharactersController(ICharacterService characterService) : ControllerBase
    {
        /// <summary>
        /// Creates a new character for the authenticated user.
        /// </summary>
        /// <param name="request">The character creation payload.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The created character.</returns>
        /// <response code="201">Character created successfully.</response>
        /// <response code="400">Invalid request data.</response>
        /// <response code="409">A character with the same name already exists for this user.</response>
        [HttpPost]
        [ProducesResponseType(typeof(CharacterResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Create([FromBody] CreateCharacterRequest request, CancellationToken cancellationToken)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized(new { message = "Token invalide." });

            var result = await characterService.CreateAsync(userId, request, cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });

            return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
        }

        /// <summary>
        /// Returns all characters belonging to the authenticated user.
        /// </summary>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A list of character summaries.</returns>
        /// <response code="200">Characters retrieved successfully.</response>
        [HttpGet("mine")]
        [ProducesResponseType(typeof(IReadOnlyList<CharacterSummaryResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetMine(CancellationToken cancellationToken)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized(new { message = "Token invalide." });

            var result = await characterService.GetMyCharactersAsync(userId, cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 500, new { message = result.Error });

            return Ok(result.Value);
        }

        /// <summary>
        /// Returns a character by its identifier.
        /// Authenticated owners see all their characters. Anonymous users see only approved shared characters.
        /// </summary>
        /// <param name="id">The character identifier.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The full character details.</returns>
        /// <response code="200">Character retrieved successfully.</response>
        /// <response code="404">Character not found or not accessible.</response>
        [HttpGet("{id:int}")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(CharacterResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            TryGetUserId(out var userId);
            int? nullableUserId = userId > 0 ? userId : null;

            var result = await characterService.GetByIdAsync(id, nullableUserId, cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 500, new { message = result.Error });

            return Ok(result.Value);
        }

        /// <summary>
        /// Updates an existing character (only allowed when status is Draft or Rejected).
        /// </summary>
        /// <param name="id">The character identifier.</param>
        /// <param name="request">The updated character data.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The updated character.</returns>
        /// <response code="200">Character updated successfully.</response>
        /// <response code="400">Invalid data or character status does not allow editing.</response>
        /// <response code="403">The authenticated user is not the owner.</response>
        /// <response code="404">Character not found.</response>
        /// <response code="409">A character with the same name already exists for this user.</response>
        [HttpPut("{id:int}")]
        [ProducesResponseType(typeof(CharacterResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateCharacterRequest request, CancellationToken cancellationToken)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized(new { message = "Token invalide." });

            var result = await characterService.UpdateAsync(id, userId, request, cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });

            return Ok(result.Value);
        }

        /// <summary>
        /// Deletes a character owned by the authenticated user.
        /// </summary>
        /// <param name="id">The character identifier.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>No content on success.</returns>
        /// <response code="204">Character deleted successfully.</response>
        /// <response code="403">The authenticated user is not the owner.</response>
        /// <response code="404">Character not found.</response>
        [HttpDelete("{id:int}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized(new { message = "Token invalide." });

            var result = await characterService.DeleteAsync(id, userId, cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });

            return NoContent();
        }

        /// <summary>
        /// Submits a character for moderation review (Draft or Rejected → Pending).
        /// </summary>
        /// <param name="id">The character identifier.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The updated character with Pending status.</returns>
        /// <response code="200">Character submitted for review.</response>
        /// <response code="400">Character status does not allow submission.</response>
        /// <response code="403">The authenticated user is not the owner.</response>
        /// <response code="404">Character not found.</response>
        [HttpPatch("{id:int}/submit")]
        [ProducesResponseType(typeof(CharacterResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Submit(int id, CancellationToken cancellationToken)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized(new { message = "Token invalide." });

            var result = await characterService.SubmitForReviewAsync(id, userId, cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });

            return Ok(result.Value);
        }

        /// <summary>
        /// Checks if a character name is available for the authenticated user.
        /// </summary>
        /// <param name="name">The character name to check.</param>
        /// <param name="excludeId">Optional character ID to exclude (for edit mode).</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>Availability status.</returns>
        /// <response code="200">Name availability checked successfully.</response>
        /// <response code="400">Invalid request (missing name).</response>
        [HttpGet("check-name")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CheckNameAvailability(
            [FromQuery] string name,
            [FromQuery] int? excludeId,
            CancellationToken cancellationToken)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized(new { message = "Token invalide." });

            if (string.IsNullOrWhiteSpace(name))
                return BadRequest(new { message = "Le nom est requis." });

            var result = await characterService.IsNameAvailableAsync(name, userId, excludeId, cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });

            return Ok(new { available = result.Value });
        }

        /// <summary>
        /// Duplicates an approved character with a new name.
        /// </summary>
        /// <param name="id">The character identifier to duplicate.</param>
        /// <param name="request">The duplicate request containing the new name.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The newly created character in Draft status.</returns>
        /// <response code="201">Character duplicated successfully.</response>
        /// <response code="400">Character status does not allow duplication (must be Approved) or invalid name.</response>
        /// <response code="403">The authenticated user is not the owner.</response>
        /// <response code="404">Character not found.</response>
        /// <response code="409">A character with the same name already exists for this user.</response>
        [HttpPost("{id:int}/duplicate")]
        [ProducesResponseType(typeof(CharacterResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Duplicate(int id, [FromBody] DuplicateCharacterRequest request, CancellationToken cancellationToken)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized(new { message = "Token invalide." });

            var result = await characterService.DuplicateAsync(id, userId, request.Name, cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });

            return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
        }

        /// <summary>
        /// Toggles the sharing status of an approved character.
        /// </summary>
        /// <param name="id">The character identifier.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The updated character with toggled IsShared value.</returns>
        /// <response code="200">Sharing status toggled successfully.</response>
        /// <response code="400">Character status does not allow sharing (must be Approved).</response>
        /// <response code="403">The authenticated user is not the owner.</response>
        /// <response code="404">Character not found.</response>
        [HttpPatch("{id:int}/share")]
        [ProducesResponseType(typeof(CharacterResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ToggleShare(int id, CancellationToken cancellationToken)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized(new { message = "Token invalide." });

            var result = await characterService.ToggleShareAsync(id, userId, cancellationToken);

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
