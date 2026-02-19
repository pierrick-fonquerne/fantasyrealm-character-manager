using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;

namespace FantasyRealm.Application.Services
{
    /// <summary>
    /// Provides aggregated platform statistics for the administrator dashboard.
    /// </summary>
    public sealed class AdminService(
        IUserRepository userRepository,
        ICharacterRepository characterRepository,
        ICommentRepository commentRepository) : IAdminService
    {
        private const string EmployeeRoleLabel = "Employee";
        private const string UserRoleLabel = "User";

        /// <inheritdoc />
        public async Task<Result<AdminStatsResponse>> GetStatsAsync(CancellationToken cancellationToken = default)
        {
            var totalUsers = await userRepository.CountByRoleAsync(UserRoleLabel, cancellationToken);
            var suspendedUsers = await userRepository.CountSuspendedAsync(cancellationToken);
            var totalEmployees = await userRepository.CountByRoleAsync(EmployeeRoleLabel, cancellationToken);
            var totalCharacters = await characterRepository.CountAllAsync(cancellationToken);
            var pendingCharacters = await characterRepository.CountPendingAsync(cancellationToken);
            var totalComments = await commentRepository.CountAllAsync(cancellationToken);
            var pendingComments = await commentRepository.CountPendingAsync(cancellationToken);

            var stats = new AdminStatsResponse(
                totalUsers,
                suspendedUsers,
                totalEmployees,
                totalCharacters,
                pendingCharacters,
                totalComments,
                pendingComments);

            return Result<AdminStatsResponse>.Success(stats);
        }
    }
}
