using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;

namespace FantasyRealm.Application.Services
{
    /// <summary>
    /// Provides read access to game reference data.
    /// </summary>
    public sealed class ReferenceDataService(IReferenceDataRepository repository) : IReferenceDataService
    {
        /// <inheritdoc />
        public async Task<Result<IReadOnlyList<CharacterClassResponse>>> GetCharacterClassesAsync(CancellationToken cancellationToken)
        {
            var classes = await repository.GetAllClassesAsync(cancellationToken);

            var response = classes
                .Select(c => new CharacterClassResponse(c.Id, c.Name, c.Description, c.IconUrl))
                .ToList() as IReadOnlyList<CharacterClassResponse>;

            return Result<IReadOnlyList<CharacterClassResponse>>.Success(response);
        }

        /// <inheritdoc />
        public async Task<Result<IReadOnlyList<EquipmentSlotResponse>>> GetEquipmentSlotsAsync(CancellationToken cancellationToken)
        {
            var slots = await repository.GetAllSlotsAsync(cancellationToken);

            var response = slots
                .Select(s => new EquipmentSlotResponse(s.Id, s.Name, s.DisplayOrder))
                .ToList() as IReadOnlyList<EquipmentSlotResponse>;

            return Result<IReadOnlyList<EquipmentSlotResponse>>.Success(response);
        }

        /// <inheritdoc />
        public async Task<Result<IReadOnlyList<ArticleTypeResponse>>> GetArticleTypesAsync(CancellationToken cancellationToken)
        {
            var types = await repository.GetAllArticleTypesAsync(cancellationToken);

            var response = types
                .Select(t => new ArticleTypeResponse(t.Id, t.Name))
                .ToList() as IReadOnlyList<ArticleTypeResponse>;

            return Result<IReadOnlyList<ArticleTypeResponse>>.Success(response);
        }
    }
}
