using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using FantasyRealm.Application.Mapping;
using FantasyRealm.Domain.Entities;
using FantasyRealm.Domain.Exceptions;

namespace FantasyRealm.Application.Services
{
    /// <summary>
    /// Handles article CRUD operations for employee management and public read access.
    /// </summary>
    public sealed class ArticleService(
        IArticleRepository articleRepository,
        IReferenceDataRepository referenceDataRepository) : IArticleService
    {
        /// <inheritdoc />
        public async Task<Result<ArticleResponse>> CreateAsync(CreateArticleRequest request, CancellationToken cancellationToken)
        {
            var types = await referenceDataRepository.GetAllArticleTypesAsync(cancellationToken);
            if (types.All(t => t.Id != request.TypeId))
                return Result<ArticleResponse>.Failure("Type d'article invalide.", 400);

            var slots = await referenceDataRepository.GetAllSlotsAsync(cancellationToken);
            if (slots.All(s => s.Id != request.SlotId))
                return Result<ArticleResponse>.Failure("Emplacement d'équipement invalide.", 400);

            var nameExists = await articleRepository.ExistsByNameAsync(request.Name, null, cancellationToken);
            if (nameExists)
                return Result<ArticleResponse>.Failure("Un article avec ce nom existe déjà.", 409);

            Article article;
            try
            {
                article = Article.Create(request.Name, request.TypeId, request.SlotId);
            }
            catch (DomainException ex)
            {
                return Result<ArticleResponse>.Failure(ex.Message, ex.StatusCode);
            }

            if (request.ImageBase64 is not null)
                article.SetImage(Convert.FromBase64String(request.ImageBase64));

            var created = await articleRepository.CreateAsync(article, cancellationToken);

            created.Type = types.First(t => t.Id == request.TypeId);
            created.Slot = slots.First(s => s.Id == request.SlotId);

            return Result<ArticleResponse>.Success(ArticleMapper.ToResponse(created));
        }

        /// <inheritdoc />
        public async Task<Result<ArticleResponse>> UpdateAsync(int id, UpdateArticleRequest request, CancellationToken cancellationToken)
        {
            var article = await articleRepository.GetByIdAsync(id, cancellationToken);
            if (article is null)
                return Result<ArticleResponse>.Failure("Article introuvable.", 404);

            var types = await referenceDataRepository.GetAllArticleTypesAsync(cancellationToken);
            if (types.All(t => t.Id != request.TypeId))
                return Result<ArticleResponse>.Failure("Type d'article invalide.", 400);

            var slots = await referenceDataRepository.GetAllSlotsAsync(cancellationToken);
            if (slots.All(s => s.Id != request.SlotId))
                return Result<ArticleResponse>.Failure("Emplacement d'équipement invalide.", 400);

            var nameExists = await articleRepository.ExistsByNameAsync(request.Name, id, cancellationToken);
            if (nameExists)
                return Result<ArticleResponse>.Failure("Un article avec ce nom existe déjà.", 409);

            try
            {
                article.Update(request.Name, request.TypeId, request.SlotId);
            }
            catch (DomainException ex)
            {
                return Result<ArticleResponse>.Failure(ex.Message, ex.StatusCode);
            }

            if (request.ImageBase64 is not null)
            {
                var imageBytes = request.ImageBase64.Length > 0
                    ? Convert.FromBase64String(request.ImageBase64)
                    : null;
                article.SetImage(imageBytes);
            }

            await articleRepository.UpdateAsync(article, cancellationToken);
            return Result<ArticleResponse>.Success(ArticleMapper.ToResponse(article));
        }

        /// <inheritdoc />
        public async Task<Result<ArticleResponse>> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            var article = await articleRepository.GetByIdAsync(id, cancellationToken);
            if (article is null)
                return Result<ArticleResponse>.Failure("Article introuvable.", 404);

            return Result<ArticleResponse>.Success(ArticleMapper.ToResponse(article));
        }

        /// <inheritdoc />
        public async Task<Result<ArticleResponse>> GetByIdPublicAsync(int id, CancellationToken cancellationToken)
        {
            var article = await articleRepository.GetByIdAsync(id, cancellationToken);
            if (article is null || !article.IsActive)
                return Result<ArticleResponse>.Failure("Article introuvable.", 404);

            return Result<ArticleResponse>.Success(ArticleMapper.ToResponse(article));
        }

        /// <inheritdoc />
        public async Task<Result<PagedResponse<ArticleSummaryResponse>>> GetAllManageAsync(
            string? search,
            int? slotId,
            int? typeId,
            bool? isActive,
            string? sortBy,
            int page,
            int pageSize,
            CancellationToken cancellationToken)
        {
            if (page < 1)
                return Result<PagedResponse<ArticleSummaryResponse>>.Failure("Le numéro de page doit être supérieur à 0.");

            if (page > 1000)
                return Result<PagedResponse<ArticleSummaryResponse>>.Failure("Le numéro de page ne peut pas dépasser 1000.");

            pageSize = Math.Clamp(pageSize, 1, 50);

            var allowedSortValues = new[] { "recent", "oldest", "nameAsc", "nameDesc" };
            var sort = allowedSortValues.Contains(sortBy) ? sortBy! : "nameAsc";

            var (items, totalCount) = await articleRepository.GetPagedAsync(
                search, slotId, typeId, isActive, sort, page, pageSize, cancellationToken);

            var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

            return Result<PagedResponse<ArticleSummaryResponse>>.Success(
                new PagedResponse<ArticleSummaryResponse>(items, page, pageSize, totalCount, totalPages));
        }

        /// <inheritdoc />
        public async Task<Result<PagedResponse<ArticleSummaryResponse>>> GetAllPublicAsync(
            string? search,
            int? slotId,
            int? typeId,
            string? sortBy,
            int page,
            int pageSize,
            CancellationToken cancellationToken)
        {
            if (page < 1)
                return Result<PagedResponse<ArticleSummaryResponse>>.Failure("Le numéro de page doit être supérieur à 0.");

            if (page > 1000)
                return Result<PagedResponse<ArticleSummaryResponse>>.Failure("Le numéro de page ne peut pas dépasser 1000.");

            pageSize = Math.Clamp(pageSize, 1, 50);

            var allowedSortValues = new[] { "recent", "oldest", "nameAsc", "nameDesc" };
            var sort = allowedSortValues.Contains(sortBy) ? sortBy! : "nameAsc";

            var (items, totalCount) = await articleRepository.GetActivePagedAsync(
                search, slotId, typeId, sort, page, pageSize, cancellationToken);

            var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

            return Result<PagedResponse<ArticleSummaryResponse>>.Success(
                new PagedResponse<ArticleSummaryResponse>(items, page, pageSize, totalCount, totalPages));
        }

        /// <inheritdoc />
        public async Task<Result<ArticleResponse>> ToggleActiveAsync(int id, CancellationToken cancellationToken)
        {
            var article = await articleRepository.GetByIdAsync(id, cancellationToken);
            if (article is null)
                return Result<ArticleResponse>.Failure("Article introuvable.", 404);

            if (article.IsActive)
                article.Deactivate();
            else
                article.Activate();

            await articleRepository.UpdateAsync(article, cancellationToken);
            return Result<ArticleResponse>.Success(ArticleMapper.ToResponse(article));
        }

        /// <inheritdoc />
        public async Task<Result<Unit>> DeleteAsync(int id, CancellationToken cancellationToken)
        {
            var article = await articleRepository.GetByIdAsync(id, cancellationToken);
            if (article is null)
                return Result<Unit>.Failure("Article introuvable.", 404);

            var isEquipped = await articleRepository.IsEquippedAsync(id, cancellationToken);
            if (isEquipped)
                return Result<Unit>.Failure("Cet article est équipé par un ou plusieurs personnages et ne peut pas être supprimé. Vous pouvez le désactiver.", 409);

            await articleRepository.DeleteAsync(article, cancellationToken);
            return Result<Unit>.Success(Unit.Value);
        }

        /// <inheritdoc />
        public async Task<Result<bool>> IsNameAvailableAsync(string name, int? excludeId, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(name))
                return Result<bool>.Failure("Le nom est requis.", 400);

            var nameExists = await articleRepository.ExistsByNameAsync(name, excludeId, cancellationToken);
            return Result<bool>.Success(!nameExists);
        }
    }
}
