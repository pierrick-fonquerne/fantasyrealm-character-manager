using FantasyRealm.Application.Interfaces;
using FantasyRealm.Domain.Entities;
using FantasyRealm.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FantasyRealm.Infrastructure.Repositories
{
    /// <summary>
    /// Provides read access to game reference data from PostgreSQL.
    /// </summary>
    public sealed class ReferenceDataRepository(FantasyRealmDbContext context) : IReferenceDataRepository
    {
        /// <inheritdoc />
        public async Task<IReadOnlyList<CharacterClass>> GetAllClassesAsync(CancellationToken cancellationToken)
        {
            return await context.CharacterClasses
                .AsNoTracking()
                .OrderBy(c => c.Name)
                .ToListAsync(cancellationToken);
        }

        /// <inheritdoc />
        public async Task<IReadOnlyList<EquipmentSlot>> GetAllSlotsAsync(CancellationToken cancellationToken)
        {
            return await context.EquipmentSlots
                .AsNoTracking()
                .OrderBy(s => s.DisplayOrder)
                .ToListAsync(cancellationToken);
        }
    }
}
