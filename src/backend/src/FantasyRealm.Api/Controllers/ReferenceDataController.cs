using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FantasyRealm.Api.Controllers
{
    /// <summary>
    /// Controller for game reference data (character classes, equipment slots).
    /// </summary>
    [ApiController]
    [Route("api")]
    public sealed class ReferenceDataController(IReferenceDataService referenceDataService) : ControllerBase
    {
        /// <summary>
        /// Returns all available character classes.
        /// </summary>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A list of character classes.</returns>
        /// <response code="200">Character classes retrieved successfully.</response>
        [HttpGet("character-classes")]
        [ProducesResponseType(typeof(IReadOnlyList<CharacterClassResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetCharacterClasses(CancellationToken cancellationToken)
        {
            var result = await referenceDataService.GetCharacterClassesAsync(cancellationToken);

            if (result.IsFailure)
            {
                return StatusCode(result.ErrorCode ?? 500, new { message = result.Error });
            }

            return Ok(result.Value);
        }

        /// <summary>
        /// Returns all equipment slots ordered by display order.
        /// </summary>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A list of equipment slots.</returns>
        /// <response code="200">Equipment slots retrieved successfully.</response>
        [HttpGet("equipment-slots")]
        [ProducesResponseType(typeof(IReadOnlyList<EquipmentSlotResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetEquipmentSlots(CancellationToken cancellationToken)
        {
            var result = await referenceDataService.GetEquipmentSlotsAsync(cancellationToken);

            if (result.IsFailure)
            {
                return StatusCode(result.ErrorCode ?? 500, new { message = result.Error });
            }

            return Ok(result.Value);
        }

        /// <summary>
        /// Returns all article types.
        /// </summary>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A list of article types.</returns>
        /// <response code="200">Article types retrieved successfully.</response>
        [HttpGet("article-types")]
        [ProducesResponseType(typeof(IReadOnlyList<ArticleTypeResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetArticleTypes(CancellationToken cancellationToken)
        {
            var result = await referenceDataService.GetArticleTypesAsync(cancellationToken);

            if (result.IsFailure)
            {
                return StatusCode(result.ErrorCode ?? 500, new { message = result.Error });
            }

            return Ok(result.Value);
        }
    }
}
