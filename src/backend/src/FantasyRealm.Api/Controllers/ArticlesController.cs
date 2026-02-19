using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FantasyRealm.Api.Controllers
{
    /// <summary>
    /// Controller for article management (employee CRUD) and public read access.
    /// </summary>
    [ApiController]
    [Route("api/articles")]
    public sealed class ArticlesController(IArticleService articleService) : ControllerBase
    {
        /// <summary>
        /// Returns a paginated list of active articles (public access).
        /// </summary>
        /// <param name="search">Optional name search filter.</param>
        /// <param name="slotId">Optional equipment slot filter.</param>
        /// <param name="typeId">Optional article type filter.</param>
        /// <param name="sortBy">Sort order: nameAsc (default), nameDesc, recent, oldest.</param>
        /// <param name="page">Page number (1-based, default 1).</param>
        /// <param name="pageSize">Items per page (default 20, max 50).</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <response code="200">Articles retrieved successfully.</response>
        [HttpGet]
        [AllowAnonymous]
        [ProducesResponseType(typeof(PagedResponse<ArticleSummaryResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search,
            [FromQuery] int? slotId,
            [FromQuery] int? typeId,
            [FromQuery] string? sortBy,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken cancellationToken = default)
        {
            var result = await articleService.GetAllPublicAsync(search, slotId, typeId, sortBy, page, pageSize, cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });

            return Ok(result.Value);
        }

        /// <summary>
        /// Returns an active article by its identifier (public access).
        /// </summary>
        /// <param name="id">The article identifier.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <response code="200">Article retrieved successfully.</response>
        /// <response code="404">Article not found or inactive.</response>
        [HttpGet("{id:int}")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ArticleResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var result = await articleService.GetByIdPublicAsync(id, cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });

            return Ok(result.Value);
        }

        /// <summary>
        /// Returns a paginated list of all articles for employee management.
        /// </summary>
        /// <param name="search">Optional name search filter.</param>
        /// <param name="slotId">Optional equipment slot filter.</param>
        /// <param name="typeId">Optional article type filter.</param>
        /// <param name="isActive">Optional active status filter.</param>
        /// <param name="sortBy">Sort order: nameAsc (default), nameDesc, recent, oldest.</param>
        /// <param name="page">Page number (1-based, default 1).</param>
        /// <param name="pageSize">Items per page (default 20, max 50).</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <response code="200">Articles retrieved successfully.</response>
        [HttpGet("manage")]
        [Authorize(Policy = "RequireEmployee")]
        [ProducesResponseType(typeof(PagedResponse<ArticleSummaryResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllManage(
            [FromQuery] string? search,
            [FromQuery] int? slotId,
            [FromQuery] int? typeId,
            [FromQuery] bool? isActive,
            [FromQuery] string? sortBy,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken cancellationToken = default)
        {
            var result = await articleService.GetAllManageAsync(search, slotId, typeId, isActive, sortBy, page, pageSize, cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });

            return Ok(result.Value);
        }

        /// <summary>
        /// Returns an article by its identifier for employee management (any status).
        /// </summary>
        /// <param name="id">The article identifier.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <response code="200">Article retrieved successfully.</response>
        /// <response code="404">Article not found.</response>
        [HttpGet("manage/{id:int}")]
        [Authorize(Policy = "RequireEmployee")]
        [ProducesResponseType(typeof(ArticleResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetByIdManage(int id, CancellationToken cancellationToken)
        {
            var result = await articleService.GetByIdAsync(id, cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });

            return Ok(result.Value);
        }

        /// <summary>
        /// Creates a new article.
        /// </summary>
        /// <param name="request">The article creation payload.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <response code="201">Article created successfully.</response>
        /// <response code="400">Invalid data.</response>
        /// <response code="409">An article with this name already exists.</response>
        [HttpPost]
        [Authorize(Policy = "RequireEmployee")]
        [ProducesResponseType(typeof(ArticleResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Create([FromBody] CreateArticleRequest request, CancellationToken cancellationToken)
        {
            var result = await articleService.CreateAsync(request, cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });

            return CreatedAtAction(nameof(GetByIdManage), new { id = result.Value!.Id }, result.Value);
        }

        /// <summary>
        /// Updates an existing article.
        /// </summary>
        /// <param name="id">The article identifier.</param>
        /// <param name="request">The article update payload.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <response code="200">Article updated successfully.</response>
        /// <response code="400">Invalid data.</response>
        /// <response code="404">Article not found.</response>
        /// <response code="409">An article with this name already exists.</response>
        [HttpPut("{id:int}")]
        [Authorize(Policy = "RequireEmployee")]
        [ProducesResponseType(typeof(ArticleResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateArticleRequest request, CancellationToken cancellationToken)
        {
            var result = await articleService.UpdateAsync(id, request, cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });

            return Ok(result.Value);
        }

        /// <summary>
        /// Toggles the active state of an article.
        /// </summary>
        /// <param name="id">The article identifier.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <response code="200">Article status toggled successfully.</response>
        /// <response code="404">Article not found.</response>
        [HttpPatch("{id:int}/toggle-active")]
        [Authorize(Policy = "RequireEmployee")]
        [ProducesResponseType(typeof(ArticleResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ToggleActive(int id, CancellationToken cancellationToken)
        {
            var result = await articleService.ToggleActiveAsync(id, cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });

            return Ok(result.Value);
        }

        /// <summary>
        /// Deletes an article if it is not equipped by any character.
        /// </summary>
        /// <param name="id">The article identifier.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <response code="204">Article deleted successfully.</response>
        /// <response code="404">Article not found.</response>
        /// <response code="409">Article is equipped and cannot be deleted.</response>
        [HttpDelete("{id:int}")]
        [Authorize(Policy = "RequireEmployee")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            var result = await articleService.DeleteAsync(id, cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });

            return NoContent();
        }

        /// <summary>
        /// Checks if an article name is available.
        /// </summary>
        /// <param name="name">The article name to check.</param>
        /// <param name="excludeId">Optional article ID to exclude (for edit mode).</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <response code="200">Returns true if the name is available.</response>
        [HttpGet("check-name")]
        [Authorize(Policy = "RequireEmployee")]
        [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
        public async Task<IActionResult> CheckName(
            [FromQuery] string name,
            [FromQuery] int? excludeId,
            CancellationToken cancellationToken)
        {
            var result = await articleService.IsNameAvailableAsync(name, excludeId, cancellationToken);

            if (result.IsFailure)
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });

            return Ok(new { available = result.Value });
        }
    }
}
