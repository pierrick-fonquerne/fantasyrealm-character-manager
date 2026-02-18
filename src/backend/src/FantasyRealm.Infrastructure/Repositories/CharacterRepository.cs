using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using FantasyRealm.Domain.Entities;
using FantasyRealm.Domain.Enums;
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

        /// <inheritdoc />
        public async Task<(IReadOnlyList<GalleryCharacterResponse> Items, int TotalCount)> GetGalleryAsync(
            string? gender,
            string? authorPseudo,
            string sortBy,
            int page,
            int pageSize,
            CancellationToken cancellationToken)
        {
            var query = context.Characters
                .Where(c => c.Status == CharacterStatus.Approved && c.IsShared);

            if (!string.IsNullOrWhiteSpace(gender) && Enum.TryParse<Gender>(gender, true, out var parsedGender))
                query = query.Where(c => c.Gender == parsedGender);

            if (!string.IsNullOrWhiteSpace(authorPseudo))
                query = query.Where(c => EF.Functions.ILike(c.User.Pseudo, $"%{authorPseudo}%"));

            query = sortBy switch
            {
                "oldest" => query.OrderBy(c => c.CreatedAt),
                "nameAsc" => query.OrderBy(c => c.Name),
                _ => query.OrderByDescending(c => c.CreatedAt)
            };

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(c => new GalleryCharacterResponse(
                    c.Id,
                    c.Name,
                    c.Class.Name,
                    c.Gender.ToString(),
                    c.User.Pseudo,
                    c.CreatedAt,
                    c.SkinColor,
                    c.HairColor,
                    c.EyeColor,
                    c.FaceShape,
                    c.HairStyle,
                    c.EyeShape,
                    c.NoseShape,
                    c.MouthShape))
                .ToListAsync(cancellationToken);

            return (items, totalCount);
        }

        /// <inheritdoc />
        public async Task<Character?> GetByIdWithUserAsync(int id, CancellationToken cancellationToken)
        {
            return await context.Characters
                .Include(c => c.Class)
                .Include(c => c.User)
                .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<(IReadOnlyList<PendingCharacterResponse> Items, int TotalCount)> GetPendingForModerationAsync(
            int page,
            int pageSize,
            CancellationToken cancellationToken)
        {
            var query = context.Characters
                .Where(c => c.Status == CharacterStatus.Pending)
                .OrderBy(c => c.UpdatedAt);

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(c => new PendingCharacterResponse(
                    c.Id,
                    c.Name,
                    c.Class.Name,
                    c.Gender.ToString(),
                    c.SkinColor,
                    c.EyeColor,
                    c.HairColor,
                    c.HairStyle,
                    c.EyeShape,
                    c.NoseShape,
                    c.MouthShape,
                    c.FaceShape,
                    c.User.Pseudo,
                    c.UpdatedAt))
                .ToListAsync(cancellationToken);

            return (items, totalCount);
        }

        /// <inheritdoc />
        public async Task<int> CountAllAsync(CancellationToken cancellationToken)
        {
            return await context.Characters.CountAsync(cancellationToken);
        }

        /// <inheritdoc />
        public async Task<int> CountPendingAsync(CancellationToken cancellationToken)
        {
            return await context.Characters
                .CountAsync(c => c.Status == CharacterStatus.Pending, cancellationToken);
        }
    }
}
