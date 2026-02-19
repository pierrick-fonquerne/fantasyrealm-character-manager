using FantasyRealm.Application.DTOs;
using FantasyRealm.Domain.Entities;

namespace FantasyRealm.Application.Mapping
{
    /// <summary>
    /// Provides centralized mapping from <see cref="Article"/> entities to response DTOs.
    /// </summary>
    public static class ArticleMapper
    {
        /// <summary>
        /// Maps an <see cref="Article"/> entity to an <see cref="ArticleResponse"/> DTO.
        /// Converts the binary image to a base64 string for JSON transport.
        /// </summary>
        /// <param name="article">The article entity to map (must include Type and Slot navigation properties).</param>
        /// <returns>A fully populated <see cref="ArticleResponse"/>.</returns>
        public static ArticleResponse ToResponse(Article article)
        {
            return new ArticleResponse(
                article.Id,
                article.Name,
                article.TypeId,
                article.Type.Name,
                article.SlotId,
                article.Slot.Name,
                article.Image is not null ? Convert.ToBase64String(article.Image) : null,
                article.IsActive,
                article.CreatedAt,
                article.UpdatedAt);
        }

        /// <summary>
        /// Maps an <see cref="Article"/> entity to an <see cref="ArticleSummaryResponse"/> DTO.
        /// </summary>
        /// <param name="article">The article entity to map (must include Type and Slot navigation properties).</param>
        /// <returns>A lightweight <see cref="ArticleSummaryResponse"/>.</returns>
        public static ArticleSummaryResponse ToSummary(Article article)
        {
            return new ArticleSummaryResponse(
                article.Id,
                article.Name,
                article.Type.Name,
                article.Slot.Name,
                article.IsActive,
                article.Image is not null ? Convert.ToBase64String(article.Image) : null);
        }
    }
}
