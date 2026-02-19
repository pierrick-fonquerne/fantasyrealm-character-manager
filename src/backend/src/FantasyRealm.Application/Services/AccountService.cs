using FantasyRealm.Application.Common;
using FantasyRealm.Application.Interfaces;
using FantasyRealm.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace FantasyRealm.Application.Services
{
    /// <summary>
    /// Handles self-service account management operations for RGPD compliance,
    /// including account deletion with password verification.
    /// </summary>
    public sealed class AccountService(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IEmailService emailService,
        IActivityLogService activityLogService,
        ILogger<AccountService> logger) : IAccountService
    {
        private const string UserRoleLabel = "User";

        /// <inheritdoc />
        public async Task<Result<Unit>> DeleteAccountAsync(
            int userId,
            string password,
            CancellationToken cancellationToken)
        {
            var user = await userRepository.GetByIdWithRoleAsync(userId, cancellationToken);

            if (user is null)
                return Result<Unit>.Failure("Utilisateur introuvable.", 404);

            if (user.Role.Label != UserRoleLabel)
                return Result<Unit>.Failure("Seuls les comptes utilisateurs peuvent être supprimés via cette fonctionnalité.", 403);

            if (!passwordHasher.Verify(password, user.PasswordHash))
                return Result<Unit>.Failure("Mot de passe incorrect.", 401);

            try
            {
                await emailService.SendAccountDeletedEmailAsync(
                    user.Email, user.Pseudo, cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to send account deletion email for user {UserId}", userId);
            }

            await userRepository.DeleteAsync(user, cancellationToken);

            logger.LogInformation("User {UserId} ({Pseudo}) deleted their own account", userId, user.Pseudo);

            try
            {
                await activityLogService.LogAsync(
                    ActivityAction.UserDeleted,
                    "User",
                    userId,
                    user.Pseudo,
                    "Self-service account deletion (RGPD)",
                    cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to log activity for self-deletion of user {UserId}", userId);
            }

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
