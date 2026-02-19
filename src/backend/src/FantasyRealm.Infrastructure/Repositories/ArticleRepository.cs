using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using FantasyRealm.Domain.Entities;
using FantasyRealm.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FantasyRealm.Infrastructure.Repositories
{
    /// <summary>
    /// Provides persistence operations for articles using PostgreSQL.
    /// </summary>
    public sealed class ArticleRepository(FantasyRealmDbContext context) : IArticleRepository
    {
        /// <inheritdoc />
        public async Task<Article?> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await context.Articles
                .Include(a => a.Type)
                .Include(a => a.Slot)
                .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<(IReadOnlyList<ArticleSummaryResponse> Items, int TotalCount)> GetPagedAsync(
            string? search,
            int? slotId,
            int? typeId,
            bool? isActive,
            string sortBy,
            int page,
            int pageSize,
            CancellationToken cancellationToken)
        {
            var query = context.Articles.AsQueryable();

            query = ApplyFilters(query, search, slotId, typeId, isActive);
            query = ApplySorting(query, sortBy);

            var totalCount = await query.CountAsync(cancellationToken);

            var rawItems = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new
                {
                    a.Id,
                    a.Name,
                    TypeName = a.Type.Name,
                    SlotName = a.Slot.Name,
                    a.IsActive,
                    a.Image
                })
                .ToListAsync(cancellationToken);

            var items = rawItems
                .Select(a => new ArticleSummaryResponse(
                    a.Id,
                    a.Name,
                    a.TypeName,
                    a.SlotName,
                    a.IsActive,
                    a.Image is not null ? Convert.ToBase64String(a.Image) : null))
                .ToList();

            return (items, totalCount);
        }

        /// <inheritdoc />
        public async Task<(IReadOnlyList<ArticleSummaryResponse> Items, int TotalCount)> GetActivePagedAsync(
            string? search,
            int? slotId,
            int? typeId,
            string sortBy,
            int page,
            int pageSize,
            CancellationToken cancellationToken)
        {
            var query = context.Articles
                .Where(a => a.IsActive);

            query = ApplyFilters(query, search, slotId, typeId, isActive: null);
            query = ApplySorting(query, sortBy);

            var totalCount = await query.CountAsync(cancellationToken);

            var rawItems = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new
                {
                    a.Id,
                    a.Name,
                    TypeName = a.Type.Name,
                    SlotName = a.Slot.Name,
                    a.IsActive,
                    a.Image
                })
                .ToListAsync(cancellationToken);

            var items = rawItems
                .Select(a => new ArticleSummaryResponse(
                    a.Id,
                    a.Name,
                    a.TypeName,
                    a.SlotName,
                    a.IsActive,
                    a.Image is not null ? Convert.ToBase64String(a.Image) : null))
                .ToList();

            return (items, totalCount);
        }

        /// <inheritdoc />
        public async Task<Article> CreateAsync(Article article, CancellationToken cancellationToken)
        {
            context.Articles.Add(article);
            await context.SaveChangesAsync(cancellationToken);

            await context.Entry(article).Reference(a => a.Type).LoadAsync(cancellationToken);
            await context.Entry(article).Reference(a => a.Slot).LoadAsync(cancellationToken);

            return article;
        }

        /// <inheritdoc />
        public async Task UpdateAsync(Article article, CancellationToken cancellationToken)
        {
            context.Articles.Update(article);
            await context.SaveChangesAsync(cancellationToken);

            await context.Entry(article).Reference(a => a.Type).LoadAsync(cancellationToken);
            await context.Entry(article).Reference(a => a.Slot).LoadAsync(cancellationToken);
        }

        /// <inheritdoc />
        public async Task<bool> ExistsByNameAsync(string name, int? excludeId, CancellationToken cancellationToken)
        {
            return await context.Articles
                .AnyAsync(a => EF.Functions.ILike(a.Name, name)
                            && (!excludeId.HasValue || a.Id != excludeId.Value),
                    cancellationToken);
        }

        /// <inheritdoc />
        public async Task<bool> IsEquippedAsync(int articleId, CancellationToken cancellationToken)
        {
            return await context.CharacterArticles
                .AnyAsync(ca => ca.ArticleId == articleId, cancellationToken);
        }

        /// <inheritdoc />
        public async Task DeleteAsync(Article article, CancellationToken cancellationToken)
        {
            context.Articles.Remove(article);
            await context.SaveChangesAsync(cancellationToken);
        }

        private static IQueryable<Article> ApplyFilters(
            IQueryable<Article> query,
            string? search,
            int? slotId,
            int? typeId,
            bool? isActive)
        {
            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(a => EF.Functions.ILike(a.Name, $"%{search}%"));

            if (slotId.HasValue)
                query = query.Where(a => a.SlotId == slotId.Value);

            if (typeId.HasValue)
                query = query.Where(a => a.TypeId == typeId.Value);

            if (isActive.HasValue)
                query = query.Where(a => a.IsActive == isActive.Value);

            return query;
        }

        private static IQueryable<Article> ApplySorting(IQueryable<Article> query, string sortBy)
        {
            return sortBy switch
            {
                "nameDesc" => query.OrderByDescending(a => a.Name),
                "recent" => query.OrderByDescending(a => a.CreatedAt),
                "oldest" => query.OrderBy(a => a.CreatedAt),
                _ => query.OrderBy(a => a.Name)
            };
        }
    }
}
