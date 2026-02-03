using FantasyRealm.Application.Interfaces;
using FantasyRealm.Domain.Entities;
using FantasyRealm.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FantasyRealm.Infrastructure.Repositories
{
    /// <summary>
    /// Provides persistence operations for characters using PostgreSQL.
    /// </summary>
    public sealed class CharacterRepository(FantasyRealmDbContext context) : ICharacterRepository
    {
        /// <inheritdoc />
        public async Task<Character?> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await context.Characters
                .Include(c => c.Class)
                .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<IReadOnlyList<Character>> GetByUserIdAsync(int userId, CancellationToken cancellationToken)
        {
            return await context.Characters
                .Include(c => c.Class)
                .Where(c => c.UserId == userId)
                .OrderByDescending(c => c.UpdatedAt)
                .ToListAsync(cancellationToken);
        }

        /// <inheritdoc />
        public async Task<Character> CreateAsync(Character character, CancellationToken cancellationToken)
        {
            context.Characters.Add(character);
            await context.SaveChangesAsync(cancellationToken);

            await context.Entry(character).Reference(c => c.Class).LoadAsync(cancellationToken);

            return character;
        }

        /// <inheritdoc />
        public async Task UpdateAsync(Character character, CancellationToken cancellationToken)
        {
            context.Characters.Update(character);
            await context.SaveChangesAsync(cancellationToken);
        }

        /// <inheritdoc />
        public async Task DeleteAsync(Character character, CancellationToken cancellationToken)
        {
            context.Characters.Remove(character);
            await context.SaveChangesAsync(cancellationToken);
        }

        /// <inheritdoc />
        public async Task<bool> ExistsByNameAndUserAsync(string name, int userId, int? excludeCharacterId, CancellationToken cancellationToken)
        {
            return await context.Characters
                .AnyAsync(c => c.Name == name
                            && c.UserId == userId
                            && (!excludeCharacterId.HasValue || c.Id != excludeCharacterId.Value),
                    cancellationToken);
        }
    }
}
