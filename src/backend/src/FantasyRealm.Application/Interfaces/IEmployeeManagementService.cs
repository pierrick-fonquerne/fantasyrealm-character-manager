using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;

namespace FantasyRealm.Application.Interfaces
{
    /// <summary>
    /// Defines the contract for employee management operations performed by administrators.
    /// </summary>
    public interface IEmployeeManagementService
    {
        /// <summary>
        /// Returns a paginated list of employees with optional search and suspension filter.
        /// </summary>
        /// <param name="page">Page number (1-based).</param>
        /// <param name="pageSize">Number of items per page.</param>
        /// <param name="search">Optional search term for pseudo or email.</param>
        /// <param name="isSuspended">Optional filter by suspension status.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task<Result<PagedResponse<EmployeeManagementResponse>>> GetEmployeesAsync(
            int page,
            int pageSize,
            string? search,
            bool? isSuspended,
            CancellationToken cancellationToken);

        /// <summary>
        /// Returns the total number of employees.
        /// </summary>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task<Result<int>> CountEmployeesAsync(CancellationToken cancellationToken);

        /// <summary>
        /// Creates a new employee account with a generated temporary password.
        /// Sends a welcome email with the temporary credentials.
        /// </summary>
        /// <param name="request">The creation request containing email and pseudo.</param>
        /// <param name="adminId">The administrator performing the action.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task<Result<EmployeeManagementResponse>> CreateAsync(
            CreateEmployeeRequest request,
            int adminId,
            CancellationToken cancellationToken);

        /// <summary>
        /// Suspends an employee account with a mandatory reason.
        /// Sends a notification email to the employee.
        /// </summary>
        /// <param name="employeeId">The employee identifier.</param>
        /// <param name="reason">The suspension reason (required, 10-500 characters).</param>
        /// <param name="adminId">The administrator performing the action.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task<Result<EmployeeManagementResponse>> SuspendAsync(
            int employeeId,
            string reason,
            int adminId,
            CancellationToken cancellationToken);

        /// <summary>
        /// Reactivates a suspended employee account.
        /// Sends a notification email to the employee.
        /// </summary>
        /// <param name="employeeId">The employee identifier.</param>
        /// <param name="adminId">The administrator performing the action.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task<Result<EmployeeManagementResponse>> ReactivateAsync(
            int employeeId,
            int adminId,
            CancellationToken cancellationToken);

        /// <summary>
        /// Permanently deletes an employee account.
        /// Sends a notification email before deletion.
        /// </summary>
        /// <param name="employeeId">The employee identifier.</param>
        /// <param name="adminId">The administrator performing the action.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task<Result<Unit>> DeleteAsync(
            int employeeId,
            int adminId,
            CancellationToken cancellationToken);
    }
}
