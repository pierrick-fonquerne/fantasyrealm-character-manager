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
    }
}
