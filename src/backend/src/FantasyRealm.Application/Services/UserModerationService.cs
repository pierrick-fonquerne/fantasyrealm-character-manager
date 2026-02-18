using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using FantasyRealm.Application.Mapping;
using Microsoft.Extensions.Logging;

namespace FantasyRealm.Application.Services
{
    /// <summary>
    /// Handles user management operations performed by employees.
    /// </summary>
    public sealed class UserModerationService(
        IUserRepository userRepository,
        IEmailService emailService,
        ILogger<UserModerationService> logger) : IUserModerationService
    {
        private const string UserRoleLabel = "User";

        /// <inheritdoc />
        public async Task<Result<PagedResponse<UserManagementResponse>>> GetUsersAsync(
            int page,
            int pageSize,
            string? search,
            bool? isSuspended,
            CancellationToken cancellationToken)
        {
            if (page < 1)
                return Result<PagedResponse<UserManagementResponse>>.Failure("Le numéro de page doit être supérieur à 0.");

            if (page > 1000)
                return Result<PagedResponse<UserManagementResponse>>.Failure("Le numéro de page ne peut pas dépasser 1000.");

            pageSize = Math.Clamp(pageSize, 1, 50);

            var (items, totalCount) = await userRepository.GetUsersAsync(page, pageSize, search, isSuspended, cancellationToken);

            var responses = items.Select(UserMapper.ToManagementResponse).ToList();
            var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

            return Result<PagedResponse<UserManagementResponse>>.Success(
                new PagedResponse<UserManagementResponse>(responses, page, pageSize, totalCount, totalPages));
        }

        /// <inheritdoc />
        public async Task<Result<int>> CountUsersAsync(CancellationToken cancellationToken)
        {
            var count = await userRepository.CountByRoleAsync(UserRoleLabel, cancellationToken);
            return Result<int>.Success(count);
        }

        /// <inheritdoc />
        public async Task<Result<UserManagementResponse>> SuspendAsync(
            int userId,
            string reason,
            int reviewerId,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(reason))
                return Result<UserManagementResponse>.Failure("Le motif de suspension est obligatoire.", 400);

            if (reason.Trim().Length < 10)
                return Result<UserManagementResponse>.Failure("Le motif de suspension doit contenir au moins 10 caractères.", 400);

            if (reason.Trim().Length > 500)
                return Result<UserManagementResponse>.Failure("Le motif de suspension ne peut pas dépasser 500 caractères.", 400);

            var user = await userRepository.GetByIdWithRoleAsync(userId, cancellationToken);

            if (user is null)
                return Result<UserManagementResponse>.Failure("Utilisateur introuvable.", 404);

            if (user.Role.Label != UserRoleLabel)
                return Result<UserManagementResponse>.Failure("Seuls les comptes utilisateurs peuvent être suspendus.", 403);

            if (user.IsSuspended)
                return Result<UserManagementResponse>.Failure("Ce compte est déjà suspendu.", 400);

            user.IsSuspended = true;
            var updated = await userRepository.UpdateAsync(user, cancellationToken);

            logger.LogInformation("User {UserId} suspended by reviewer {ReviewerId}", userId, reviewerId);

            try
            {
                await emailService.SendAccountSuspendedEmailAsync(
                    updated.Email, updated.Pseudo, reason.Trim(), cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to send suspension email for user {UserId}", userId);
            }

            return Result<UserManagementResponse>.Success(
                new UserManagementResponse(updated.Id, updated.Pseudo, updated.Email, updated.IsSuspended, updated.CreatedAt, 0));
        }

        /// <inheritdoc />
        public async Task<Result<UserManagementResponse>> ReactivateAsync(
            int userId,
            int reviewerId,
            CancellationToken cancellationToken)
        {
            var user = await userRepository.GetByIdWithRoleAsync(userId, cancellationToken);

            if (user is null)
                return Result<UserManagementResponse>.Failure("Utilisateur introuvable.", 404);

            if (user.Role.Label != UserRoleLabel)
                return Result<UserManagementResponse>.Failure("Seuls les comptes utilisateurs peuvent être réactivés.", 403);

            if (!user.IsSuspended)
                return Result<UserManagementResponse>.Failure("Ce compte n'est pas suspendu.", 400);

            user.IsSuspended = false;
            var updated = await userRepository.UpdateAsync(user, cancellationToken);

            logger.LogInformation("User {UserId} reactivated by reviewer {ReviewerId}", userId, reviewerId);

            try
            {
                await emailService.SendAccountReactivatedEmailAsync(
                    updated.Email, updated.Pseudo, cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to send reactivation email for user {UserId}", userId);
            }

            return Result<UserManagementResponse>.Success(
                new UserManagementResponse(updated.Id, updated.Pseudo, updated.Email, updated.IsSuspended, updated.CreatedAt, 0));
        }

        /// <inheritdoc />
        public async Task<Result<Unit>> DeleteAsync(
            int userId,
            int reviewerId,
            CancellationToken cancellationToken)
        {
            var user = await userRepository.GetByIdWithRoleAsync(userId, cancellationToken);

            if (user is null)
                return Result<Unit>.Failure("Utilisateur introuvable.", 404);

            if (user.Role.Label != UserRoleLabel)
                return Result<Unit>.Failure("Seuls les comptes utilisateurs peuvent être supprimés.", 403);

            try
            {
                await emailService.SendAccountDeletedEmailAsync(
                    user.Email, user.Pseudo, cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to send deletion email for user {UserId}", userId);
            }

            await userRepository.DeleteAsync(user, cancellationToken);

            logger.LogInformation("User {UserId} deleted by reviewer {ReviewerId}", userId, reviewerId);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
