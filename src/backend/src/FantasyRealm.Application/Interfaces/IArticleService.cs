using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;

namespace FantasyRealm.Application.Interfaces
{
    /// <summary>
    /// Service contract for article management operations.
    /// </summary>
    public interface IArticleService
    {
        /// <summary>
        /// Creates a new article.
        /// </summary>
        Task<Result<ArticleResponse>> CreateAsync(CreateArticleRequest request, CancellationToken cancellationToken);

        /// <summary>
        /// Updates an existing article.
        /// </summary>
        Task<Result<ArticleResponse>> UpdateAsync(int id, UpdateArticleRequest request, CancellationToken cancellationToken);

        /// <summary>
        /// Returns an article by its identifier (employee access, any status).
        /// </summary>
        Task<Result<ArticleResponse>> GetByIdAsync(int id, CancellationToken cancellationToken);

        /// <summary>
        /// Returns an active article by its identifier (public access).
        /// </summary>
        Task<Result<ArticleResponse>> GetByIdPublicAsync(int id, CancellationToken cancellationToken);

        /// <summary>
        /// Returns a paginated list of all articles with optional filters (employee management).
        /// </summary>
        Task<Result<PagedResponse<ArticleSummaryResponse>>> GetAllManageAsync(
            string? search,
            int? slotId,
            int? typeId,
            bool? isActive,
            string? sortBy,
            int page,
            int pageSize,
            CancellationToken cancellationToken);

        /// <summary>
        /// Returns a paginated list of active articles (public listing).
        /// </summary>
        Task<Result<PagedResponse<ArticleSummaryResponse>>> GetAllPublicAsync(
            string? search,
            int? slotId,
            int? typeId,
            string? sortBy,
            int page,
            int pageSize,
            CancellationToken cancellationToken);

        /// <summary>
        /// Toggles the active state of an article.
        /// </summary>
        Task<Result<ArticleResponse>> ToggleActiveAsync(int id, CancellationToken cancellationToken);

        /// <summary>
        /// Deletes an article if it is not currently equipped by any character.
        /// </summary>
        Task<Result<Unit>> DeleteAsync(int id, CancellationToken cancellationToken);

        /// <summary>
        /// Checks if an article name is available.
        /// </summary>
        /// <param name="name">The article name to check.</param>
        /// <param name="excludeId">Optional article ID to exclude (for edit mode).</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task<Result<bool>> IsNameAvailableAsync(string name, int? excludeId, CancellationToken cancellationToken);
    }
}
