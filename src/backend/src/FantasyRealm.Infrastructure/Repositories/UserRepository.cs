using FantasyRealm.Application.Interfaces;
using FantasyRealm.Domain.Entities;
using FantasyRealm.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FantasyRealm.Infrastructure.Repositories
{
    /// <summary>
    /// Repository implementation for User entity data access operations.
    /// </summary>
    public sealed class UserRepository : IUserRepository
    {
        private readonly FantasyRealmDbContext _context;

        public UserRepository(FantasyRealmDbContext context)
        {
            _context = context;
        }

        /// <inheritdoc />
        public async Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default)
        {
            var normalizedEmail = email.ToLowerInvariant().Trim();
            return await _context.Users
                .AnyAsync(u => u.Email == normalizedEmail, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<bool> ExistsByPseudoAsync(string pseudo, CancellationToken cancellationToken = default)
        {
            var normalizedPseudo = pseudo.Trim();
            return await _context.Users
                .AnyAsync(u => u.Pseudo == normalizedPseudo, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<User> CreateAsync(User user, CancellationToken cancellationToken = default)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync(cancellationToken);
            return user;
        }

        /// <inheritdoc />
        public async Task<Role?> GetRoleByLabelAsync(string label, CancellationToken cancellationToken = default)
        {
            return await _context.Roles
                .FirstOrDefaultAsync(r => r.Label == label, cancellationToken);
        }
    }
}
