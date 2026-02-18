using FantasyRealm.Domain.Entities;

namespace FantasyRealm.Application.Interfaces
{
    /// <summary>
    /// Repository interface for User entity data access operations.
    /// </summary>
    public interface IUserRepository
    {
        /// <summary>
        /// Checks if a user with the specified email already exists.
        /// </summary>
        Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default);

        /// <summary>
        /// Checks if a user with the specified pseudo already exists.
        /// </summary>
        Task<bool> ExistsByPseudoAsync(string pseudo, CancellationToken cancellationToken = default);

        /// <summary>
        /// Creates a new user in the database.
        /// </summary>
        /// <returns>The created user with generated Id.</returns>
        Task<User> CreateAsync(User user, CancellationToken cancellationToken = default);

        /// <summary>
        /// Retrieves a role by its label.
        /// </summary>
        Task<Role?> GetRoleByLabelAsync(string label, CancellationToken cancellationToken = default);

        /// <summary>
        /// Retrieves a user by email address, including their role.
        /// </summary>
        /// <param name="email">The email address to search for (case-insensitive).</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The user with their role, or null if not found.</returns>
        Task<User?> GetByEmailWithRoleAsync(string email, CancellationToken cancellationToken = default);

        /// <summary>
        /// Retrieves a user by ID, including their role.
        /// </summary>
        /// <param name="id">The user ID.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The user with their role, or null if not found.</returns>
        Task<User?> GetByIdWithRoleAsync(int id, CancellationToken cancellationToken = default);

        /// <summary>
        /// Retrieves a user by email and pseudo combination, including their role.
        /// Used for password reset verification.
        /// </summary>
        /// <param name="email">The email address to search for (case-insensitive).</param>
        /// <param name="pseudo">The pseudo to match.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The user with their role, or null if not found.</returns>
        Task<User?> GetByEmailAndPseudoAsync(string email, string pseudo, CancellationToken cancellationToken = default);

        /// <summary>
        /// Updates an existing user in the database.
        /// </summary>
        /// <param name="user">The user entity with updated values.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The updated user entity.</returns>
        Task<User> UpdateAsync(User user, CancellationToken cancellationToken = default);

        /// <summary>
        /// Retrieves a paginated list of users with optional search and suspension filter.
        /// Only returns users with the "user" role.
        /// </summary>
        /// <param name="page">The page number (1-based).</param>
        /// <param name="pageSize">The number of items per page.</param>
        /// <param name="search">Optional search term to filter by pseudo or email.</param>
        /// <param name="isSuspended">Optional filter by suspension status.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A tuple containing the user list and total count.</returns>
        Task<(IReadOnlyList<User> Items, int TotalCount)> GetUsersAsync(
            int page, int pageSize, string? search, bool? isSuspended, CancellationToken cancellationToken = default);

        /// <summary>
        /// Counts users matching the specified role label.
        /// </summary>
        /// <param name="roleLabel">The role label to filter by (e.g. "user").</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The number of matching users.</returns>
        Task<int> CountByRoleAsync(string roleLabel, CancellationToken cancellationToken = default);

        /// <summary>
        /// Permanently deletes a user from the database.
        /// Associated characters and comments are removed via cascade.
        /// </summary>
        /// <param name="user">The user entity to delete.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task DeleteAsync(User user, CancellationToken cancellationToken = default);

        /// <summary>
        /// Returns the number of currently suspended users.
        /// </summary>
        Task<int> CountSuspendedAsync(CancellationToken cancellationToken = default);
    }
}
