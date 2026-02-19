using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using FantasyRealm.Application.Validators;
using FantasyRealm.Domain.Entities;
using FantasyRealm.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace FantasyRealm.Application.Services
{
    /// <summary>
    /// Service implementation for authentication operations.
    /// </summary>
    public sealed class AuthService(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IPasswordGenerator passwordGenerator,
        IEmailService emailService,
        IJwtService jwtService,
        IActivityLogService activityLogService,
        ILogger<AuthService> logger) : IAuthService
    {
        private const string DefaultRole = "User";
        private const string InvalidCredentialsMessage = "Identifiants incorrects.";
        private const string AccountSuspendedMessage = "Votre compte a été suspendu.";
        private const string UserNotFoundMessage = "Aucun compte ne correspond à ces informations.";

        /// <inheritdoc />
        public async Task<Result<RegisterResponse>> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
        {
            if (request.Password != request.ConfirmPassword)
            {
                return Result<RegisterResponse>.Failure("Les mots de passe ne correspondent pas.", 400);
            }

            var passwordValidation = PasswordValidator.Validate(request.Password);
            if (!passwordValidation.IsValid)
            {
                var errorMessage = string.Join(" ", passwordValidation.Errors);
                return Result<RegisterResponse>.Failure(errorMessage, 400);
            }

            var emailExists = await userRepository.ExistsByEmailAsync(request.Email, cancellationToken);
            if (emailExists)
            {
                return Result<RegisterResponse>.Failure("Cette adresse email est déjà utilisée.", 409);
            }

            var pseudoExists = await userRepository.ExistsByPseudoAsync(request.Pseudo, cancellationToken);
            if (pseudoExists)
            {
                return Result<RegisterResponse>.Failure("Ce pseudo est déjà utilisé.", 409);
            }

            var role = await userRepository.GetRoleByLabelAsync(DefaultRole, cancellationToken);
            if (role is null)
            {
                return Result<RegisterResponse>.Failure("Configuration error: default role not found.", 500);
            }

            var hashedPassword = passwordHasher.Hash(request.Password);
            var user = User.CreateUser(
                request.Email.ToLowerInvariant().Trim(),
                request.Pseudo.Trim(),
                hashedPassword,
                role);

            var createdUser = await userRepository.CreateAsync(user, cancellationToken);

            _ = Task.Run(async () =>
            {
                try
                {
                    await emailService.SendWelcomeEmailAsync(createdUser.Email, createdUser.Pseudo, CancellationToken.None);
                    logger.LogInformation("Welcome email sent to {Email}", createdUser.Email);
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Failed to send welcome email to {Email}", createdUser.Email);
                }
            }, CancellationToken.None);

            return Result<RegisterResponse>.Success(new RegisterResponse(
                createdUser.Id,
                createdUser.Email,
                createdUser.Pseudo,
                DefaultRole,
                createdUser.CreatedAt
            ));
        }

        /// <inheritdoc />
        public async Task<Result<LoginResponse>> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
        {
            var normalizedEmail = request.Email.ToLowerInvariant().Trim();

            var user = await userRepository.GetByEmailWithRoleAsync(normalizedEmail, cancellationToken);

            if (user is null)
            {
                logger.LogWarning("Login failed: user not found for email {Email}", normalizedEmail);
                return Result<LoginResponse>.Failure(InvalidCredentialsMessage, 401);
            }

            if (!passwordHasher.Verify(request.Password, user.PasswordHash))
            {
                logger.LogWarning("Login failed: invalid password for user {UserId}", user.Id);
                return Result<LoginResponse>.Failure(InvalidCredentialsMessage, 401);
            }

            if (user.IsSuspended)
            {
                logger.LogWarning("Login failed: account suspended for user {UserId}", user.Id);
                return Result<LoginResponse>.Failure(AccountSuspendedMessage, 403);
            }

            var token = jwtService.GenerateToken(user.Id, user.Email, user.Pseudo, user.Role.Label);
            var expiresAt = jwtService.GetExpirationDate();

            logger.LogInformation("Login successful for user {UserId} ({Email})", user.Id, user.Email);

            var userInfo = new UserInfo(user.Id, user.Email, user.Pseudo, user.Role.Label);

            return Result<LoginResponse>.Success(new LoginResponse(
                token,
                expiresAt,
                userInfo,
                user.MustChangePassword
            ));
        }

        /// <inheritdoc />
        public async Task<Result<Unit>> ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default)
        {
            var normalizedEmail = request.Email.ToLowerInvariant().Trim();
            var normalizedPseudo = request.Pseudo.Trim();

            var user = await userRepository.GetByEmailAndPseudoAsync(normalizedEmail, normalizedPseudo, cancellationToken);

            if (user is null)
            {
                logger.LogWarning("Password reset failed: no user found for email {Email} and pseudo {Pseudo}", normalizedEmail, normalizedPseudo);
                return Result<Unit>.Failure(UserNotFoundMessage, 404);
            }

            if (user.IsSuspended)
            {
                logger.LogWarning("Password reset failed: account suspended for user {UserId}", user.Id);
                return Result<Unit>.Failure(AccountSuspendedMessage, 403);
            }

            var temporaryPassword = passwordGenerator.GenerateSecurePassword();
            user.SetTemporaryPassword(passwordHasher.Hash(temporaryPassword));

            await userRepository.UpdateAsync(user, cancellationToken);

            _ = Task.Run(async () =>
            {
                try
                {
                    await emailService.SendTemporaryPasswordEmailAsync(user.Email, user.Pseudo, temporaryPassword, CancellationToken.None);
                    logger.LogInformation("Temporary password email sent to {Email}", user.Email);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Failed to send temporary password email to {Email}", user.Email);
                }
            }, CancellationToken.None);

            logger.LogInformation("Password reset successful for user {UserId} ({Email})", user.Id, user.Email);

            return Result<Unit>.Success(Unit.Value);
        }

        /// <inheritdoc />
        public async Task<Result<ChangePasswordResponse>> ChangePasswordAsync(int userId, ChangePasswordRequest request, CancellationToken cancellationToken = default)
        {
            var user = await userRepository.GetByIdWithRoleAsync(userId, cancellationToken);

            if (user is null)
            {
                logger.LogWarning("Change password failed: user not found for ID {UserId}", userId);
                return Result<ChangePasswordResponse>.Failure(InvalidCredentialsMessage, 401);
            }

            if (user.IsSuspended)
            {
                logger.LogWarning("Change password failed: account suspended for user {UserId}", userId);
                return Result<ChangePasswordResponse>.Failure(AccountSuspendedMessage, 403);
            }

            if (!passwordHasher.Verify(request.CurrentPassword, user.PasswordHash))
            {
                logger.LogWarning("Change password failed: invalid current password for user {UserId}", userId);
                return Result<ChangePasswordResponse>.Failure("Le mot de passe actuel est incorrect.", 401);
            }

            if (request.NewPassword != request.ConfirmNewPassword)
            {
                return Result<ChangePasswordResponse>.Failure("Les nouveaux mots de passe ne correspondent pas.", 400);
            }

            var passwordValidation = PasswordValidator.Validate(request.NewPassword);
            if (!passwordValidation.IsValid)
            {
                var errorMessage = string.Join(" ", passwordValidation.Errors);
                return Result<ChangePasswordResponse>.Failure(errorMessage, 400);
            }

            if (passwordHasher.Verify(request.NewPassword, user.PasswordHash))
            {
                return Result<ChangePasswordResponse>.Failure("Le nouveau mot de passe doit être différent de l'ancien.", 400);
            }

            user.ChangePassword(passwordHasher.Hash(request.NewPassword));

            await userRepository.UpdateAsync(user, cancellationToken);

            var token = jwtService.GenerateToken(user.Id, user.Email, user.Pseudo, user.Role.Label);
            var expiresAt = jwtService.GetExpirationDate();

            logger.LogInformation("Password changed successfully for user {UserId} ({Email})", user.Id, user.Email);

            try
            {
                await activityLogService.LogAsync(
                    ActivityAction.PasswordChanged, "User", user.Id, user.Pseudo, null, cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to log password change activity for user {UserId}", user.Id);
            }

            var userInfo = new UserInfo(user.Id, user.Email, user.Pseudo, user.Role.Label);

            return Result<ChangePasswordResponse>.Success(new ChangePasswordResponse(
                token,
                expiresAt,
                userInfo
            ));
        }
    }
}
