using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;

namespace FantasyRealm.Application.Interfaces
{
    /// <summary>
    /// Service contract for administrator dashboard operations.
    /// </summary>
    public interface IAdminService
    {
        /// <summary>
        /// Returns aggregated platform statistics for the admin dashboard.
        /// </summary>
        Task<Result<AdminStatsResponse>> GetStatsAsync(CancellationToken cancellationToken = default);
    }
}
