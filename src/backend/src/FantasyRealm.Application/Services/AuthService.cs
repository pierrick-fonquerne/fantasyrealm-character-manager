using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using FantasyRealm.Application.Validators;
using FantasyRealm.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace FantasyRealm.Application.Services
{
    /// <summary>
    /// Service implementation for authentication operations.
    /// </summary>
    public sealed class AuthService : IAuthService
    {
        private const string DefaultRole = "User";

        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IEmailService _emailService;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            IUserRepository userRepository,
            IPasswordHasher passwordHasher,
            IEmailService emailService,
            ILogger<AuthService> logger)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
            _emailService = emailService;
            _logger = logger;
        }

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

            var emailExists = await _userRepository.ExistsByEmailAsync(request.Email, cancellationToken);
            if (emailExists)
            {
                return Result<RegisterResponse>.Failure("Cette adresse email est déjà utilisée.", 409);
            }

            var pseudoExists = await _userRepository.ExistsByPseudoAsync(request.Pseudo, cancellationToken);
            if (pseudoExists)
            {
                return Result<RegisterResponse>.Failure("Ce pseudo est déjà utilisé.", 409);
            }

            var role = await _userRepository.GetRoleByLabelAsync(DefaultRole, cancellationToken);
            if (role is null)
            {
                return Result<RegisterResponse>.Failure("Configuration error: default role not found.", 500);
            }

            var user = new User
            {
                Email = request.Email.ToLowerInvariant().Trim(),
                Pseudo = request.Pseudo.Trim(),
                PasswordHash = _passwordHasher.Hash(request.Password),
                RoleId = role.Id,
                IsSuspended = false,
                MustChangePassword = false
            };

            var createdUser = await _userRepository.CreateAsync(user, cancellationToken);

            _ = Task.Run(async () =>
            {
                try
                {
                    await _emailService.SendWelcomeEmailAsync(createdUser.Email, createdUser.Pseudo, CancellationToken.None);
                    _logger.LogInformation("Welcome email sent to {Email}", createdUser.Email);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to send welcome email to {Email}", createdUser.Email);
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
    }
}
