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
    }
}
