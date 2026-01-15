using FantasyRealm.Application.Interfaces;
using FantasyRealm.Domain.Entities;
using FantasyRealm.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FantasyRealm.Infrastructure.Repositories
{
    /// <summary>
    /// Repository implementation for User entity data access operations.
    /// </summary>
    public sealed class UserRepository(FantasyRealmDbContext context) : IUserRepository
    {
        /// <inheritdoc />
        public async Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default)
        {
            var normalizedEmail = email.ToLowerInvariant().Trim();
            return await context.Users
                .AnyAsync(u => u.Email == normalizedEmail, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<bool> ExistsByPseudoAsync(string pseudo, CancellationToken cancellationToken = default)
        {
            var normalizedPseudo = pseudo.Trim();
            return await context.Users
                .AnyAsync(u => u.Pseudo == normalizedPseudo, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<User> CreateAsync(User user, CancellationToken cancellationToken = default)
        {
            context.Users.Add(user);
            await context.SaveChangesAsync(cancellationToken);
            return user;
        }

        /// <inheritdoc />
        public async Task<Role?> GetRoleByLabelAsync(string label, CancellationToken cancellationToken = default)
        {
            return await context.Roles
                .FirstOrDefaultAsync(r => r.Label == label, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<User?> GetByEmailWithRoleAsync(string email, CancellationToken cancellationToken = default)
        {
            var normalizedEmail = email.ToLowerInvariant().Trim();
            return await context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == normalizedEmail, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<User?> GetByIdWithRoleAsync(int id, CancellationToken cancellationToken = default)
        {
            return await context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<User?> GetByEmailAndPseudoAsync(string email, string pseudo, CancellationToken cancellationToken = default)
        {
            var normalizedEmail = email.ToLowerInvariant().Trim();
            var normalizedPseudo = pseudo.Trim();
            return await context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == normalizedEmail && u.Pseudo == normalizedPseudo, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<User> UpdateAsync(User user, CancellationToken cancellationToken = default)
        {
            user.UpdatedAt = DateTime.UtcNow;
            context.Users.Update(user);
            await context.SaveChangesAsync(cancellationToken);
            return user;
        }
    }
}
