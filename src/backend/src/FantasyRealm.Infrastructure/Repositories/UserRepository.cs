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

        /// <inheritdoc />
        public async Task<(IReadOnlyList<User> Items, int TotalCount)> GetUsersAsync(
            int page, int pageSize, string? search, bool? isSuspended, CancellationToken cancellationToken = default)
        {
            var query = context.Users
                .Include(u => u.Role)
                .Include(u => u.Characters)
                .Where(u => u.Role.Label == "User");

            if (!string.IsNullOrWhiteSpace(search))
            {
                var pattern = $"%{search.Trim()}%";
                query = query.Where(u =>
                    EF.Functions.ILike(u.Pseudo, pattern) ||
                    EF.Functions.ILike(u.Email, pattern));
            }

            if (isSuspended.HasValue)
                query = query.Where(u => u.IsSuspended == isSuspended.Value);

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return (items, totalCount);
        }

        /// <inheritdoc />
        public async Task<int> CountByRoleAsync(string roleLabel, CancellationToken cancellationToken = default)
        {
            return await context.Users
                .CountAsync(u => u.Role.Label == roleLabel, cancellationToken);
        }

        /// <inheritdoc />
        public async Task DeleteAsync(User user, CancellationToken cancellationToken = default)
        {
            context.Users.Remove(user);
            await context.SaveChangesAsync(cancellationToken);
        }
    }
}
