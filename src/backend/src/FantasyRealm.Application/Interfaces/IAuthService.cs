using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;

namespace FantasyRealm.Application.Interfaces
{
    /// <summary>
    /// Service interface for authentication operations.
    /// </summary>
    public interface IAuthService
    {
        /// <summary>
        /// Registers a new user account.
        /// </summary>
        /// <param name="request">The registration request containing user details.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A result containing the registered user info or an error.</returns>
        Task<Result<RegisterResponse>> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);

        /// <summary>
        /// Authenticates a user and returns a JWT token.
        /// </summary>
        /// <param name="request">The login request containing credentials.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A result containing the login response with token or an error.</returns>
        Task<Result<LoginResponse>> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);

        /// <summary>
        /// Initiates a password reset by generating a temporary password and sending it via email.
        /// </summary>
        /// <param name="request">The forgot password request containing email and pseudo.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A result indicating success or an error.</returns>
        Task<Result<Unit>> ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default);

        /// <summary>
        /// Changes the password for an authenticated user.
        /// </summary>
        /// <param name="userId">The ID of the authenticated user.</param>
        /// <param name="request">The change password request containing current and new passwords.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A result containing the new token or an error.</returns>
        Task<Result<ChangePasswordResponse>> ChangePasswordAsync(int userId, ChangePasswordRequest request, CancellationToken cancellationToken = default);
    }
}
