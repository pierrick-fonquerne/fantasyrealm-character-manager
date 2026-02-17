using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using FantasyRealm.Application.Mapping;
using FantasyRealm.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace FantasyRealm.Application.Services
{
    /// <summary>
    /// Handles comment moderation operations performed by employees.
    /// </summary>
    public sealed class CommentModerationService(
        ICommentRepository commentRepository,
        IEmailService emailService,
        ILogger<CommentModerationService> logger) : ICommentModerationService
    {
        /// <inheritdoc />
        public async Task<Result<PagedResponse<PendingCommentResponse>>> GetPendingCommentsAsync(
            int page,
            int pageSize,
            CancellationToken cancellationToken)
        {
            if (page < 1)
                return Result<PagedResponse<PendingCommentResponse>>.Failure("Le numéro de page doit être supérieur à 0.");

            if (page > 1000)
                return Result<PagedResponse<PendingCommentResponse>>.Failure("Le numéro de page ne peut pas dépasser 1000.");

            pageSize = Math.Clamp(pageSize, 1, 50);

            var (items, totalCount) = await commentRepository.GetPendingAsync(page, pageSize, cancellationToken);

            var responses = items.Select(CommentMapper.ToPendingResponse).ToList();
            var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

            return Result<PagedResponse<PendingCommentResponse>>.Success(
                new PagedResponse<PendingCommentResponse>(responses, page, pageSize, totalCount, totalPages));
        }

        /// <inheritdoc />
        public async Task<Result<CommentResponse>> ApproveAsync(
            int commentId,
            int reviewerId,
            CancellationToken cancellationToken)
        {
            var comment = await commentRepository.GetByIdAsync(commentId, cancellationToken);

            if (comment is null)
                return Result<CommentResponse>.Failure("Commentaire introuvable.", 404);

            if (comment.Status is not CommentStatus.Pending)
                return Result<CommentResponse>.Failure("Seuls les commentaires en attente peuvent être approuvés.", 400);

            comment.Status = CommentStatus.Approved;
            comment.ReviewedAt = DateTime.UtcNow;
            comment.ReviewedById = reviewerId;

            await commentRepository.UpdateAsync(comment, cancellationToken);

            try
            {
                await emailService.SendCommentApprovedEmailAsync(
                    comment.Author.Email, comment.Author.Pseudo, comment.Character.Name, cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to send approval email for comment {CommentId}", commentId);
            }

            return Result<CommentResponse>.Success(CommentMapper.ToResponse(comment));
        }

        /// <inheritdoc />
        public async Task<Result<CommentResponse>> RejectAsync(
            int commentId,
            string reason,
            int reviewerId,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(reason))
                return Result<CommentResponse>.Failure("Le motif de rejet est obligatoire.", 400);

            if (reason.Trim().Length < 10)
                return Result<CommentResponse>.Failure("Le motif de rejet doit contenir au moins 10 caractères.", 400);

            if (reason.Trim().Length > 500)
                return Result<CommentResponse>.Failure("Le motif de rejet ne peut pas dépasser 500 caractères.", 400);

            var comment = await commentRepository.GetByIdAsync(commentId, cancellationToken);

            if (comment is null)
                return Result<CommentResponse>.Failure("Commentaire introuvable.", 404);

            if (comment.Status is not CommentStatus.Pending)
                return Result<CommentResponse>.Failure("Seuls les commentaires en attente peuvent être rejetés.", 400);

            comment.Status = CommentStatus.Rejected;
            comment.RejectionReason = reason.Trim();
            comment.ReviewedAt = DateTime.UtcNow;
            comment.ReviewedById = reviewerId;

            await commentRepository.UpdateAsync(comment, cancellationToken);

            try
            {
                await emailService.SendCommentRejectedEmailAsync(
                    comment.Author.Email, comment.Author.Pseudo, comment.Character.Name, reason, cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to send rejection email for comment {CommentId}", commentId);
            }

            return Result<CommentResponse>.Success(CommentMapper.ToResponse(comment));
        }
    }
}
