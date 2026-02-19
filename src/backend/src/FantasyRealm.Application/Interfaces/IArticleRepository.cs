using FantasyRealm.Application.DTOs;
using FantasyRealm.Domain.Entities;

namespace FantasyRealm.Application.Interfaces
{
    /// <summary>
    /// Repository contract for article persistence operations.
    /// </summary>
    public interface IArticleRepository
    {
        /// <summary>
        /// Returns an article by its identifier, including related type and slot.
        /// </summary>
        Task<Article?> GetByIdAsync(int id, CancellationToken cancellationToken);

        /// <summary>
        /// Returns a paginated list of articles with optional filters.
        /// Includes both active and inactive articles (for employee management).
        /// </summary>
        Task<(IReadOnlyList<ArticleSummaryResponse> Items, int TotalCount)> GetPagedAsync(
            string? search,
            int? slotId,
            int? typeId,
            bool? isActive,
            string sortBy,
            int page,
            int pageSize,
            CancellationToken cancellationToken);

        /// <summary>
        /// Returns a paginated list of active articles only (for public listings).
        /// </summary>
        Task<(IReadOnlyList<ArticleSummaryResponse> Items, int TotalCount)> GetActivePagedAsync(
            string? search,
            int? slotId,
            int? typeId,
            string sortBy,
            int page,
            int pageSize,
            CancellationToken cancellationToken);

        /// <summary>
        /// Persists a new article.
        /// </summary>
        Task<Article> CreateAsync(Article article, CancellationToken cancellationToken);

        /// <summary>
        /// Saves changes to an existing article.
        /// </summary>
        Task UpdateAsync(Article article, CancellationToken cancellationToken);

        /// <summary>
        /// Checks whether an article with the given name already exists.
        /// </summary>
        /// <param name="name">The article name to check.</param>
        /// <param name="excludeId">Optional article ID to exclude (for edit mode).</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task<bool> ExistsByNameAsync(string name, int? excludeId, CancellationToken cancellationToken);

        /// <summary>
        /// Checks whether an article is currently equipped by any character.
        /// </summary>
        Task<bool> IsEquippedAsync(int articleId, CancellationToken cancellationToken);

        /// <summary>
        /// Removes an article from the database.
        /// </summary>
        Task DeleteAsync(Article article, CancellationToken cancellationToken);
    }
}
