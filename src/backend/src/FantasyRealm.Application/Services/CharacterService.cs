using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using FantasyRealm.Domain.Entities;
using FantasyRealm.Domain.Enums;

namespace FantasyRealm.Application.Services
{
    /// <summary>
    /// Handles character creation, retrieval, update, deletion, and submission for review.
    /// </summary>
    public sealed class CharacterService(
        ICharacterRepository characterRepository,
        IReferenceDataRepository referenceDataRepository) : ICharacterService
    {
        /// <inheritdoc />
        public async Task<Result<CharacterResponse>> CreateAsync(int userId, CreateCharacterRequest request, CancellationToken cancellationToken)
        {
            if (!Enum.TryParse<Gender>(request.Gender, true, out var gender))
                return Result<CharacterResponse>.Failure("Genre invalide. Valeurs acceptées : Male, Female.");

            var classes = await referenceDataRepository.GetAllClassesAsync(cancellationToken);
            var characterClass = classes.FirstOrDefault(c => c.Id == request.ClassId);
            if (characterClass is null)
                return Result<CharacterResponse>.Failure("Classe de personnage invalide.", 400);

            var nameExists = await characterRepository.ExistsByNameAndUserAsync(request.Name, userId, null, cancellationToken);
            if (nameExists)
                return Result<CharacterResponse>.Failure("Vous avez déjà un personnage avec ce nom.", 409);

            var character = new Character
            {
                Name = request.Name,
                ClassId = request.ClassId,
                Gender = gender,
                Status = CharacterStatus.Draft,
                SkinColor = request.SkinColor,
                EyeColor = request.EyeColor,
                HairColor = request.HairColor,
                HairStyle = request.HairStyle,
                EyeShape = request.EyeShape,
                NoseShape = request.NoseShape,
                MouthShape = request.MouthShape,
                FaceShape = request.FaceShape,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                UserId = userId
            };

            var created = await characterRepository.CreateAsync(character, cancellationToken);
            return Result<CharacterResponse>.Success(MapToResponse(created, characterClass.Name));
        }

        /// <inheritdoc />
        public async Task<Result<CharacterResponse>> GetByIdAsync(int characterId, int userId, CancellationToken cancellationToken)
        {
            var character = await characterRepository.GetByIdAsync(characterId, cancellationToken);
            if (character is null)
                return Result<CharacterResponse>.Failure("Personnage introuvable.", 404);

            if (character.UserId != userId)
                return Result<CharacterResponse>.Failure("Accès non autorisé.", 403);

            return Result<CharacterResponse>.Success(MapToResponse(character, character.Class.Name));
        }

        /// <inheritdoc />
        public async Task<Result<IReadOnlyList<CharacterSummaryResponse>>> GetMyCharactersAsync(int userId, CancellationToken cancellationToken)
        {
            var characters = await characterRepository.GetByUserIdAsync(userId, cancellationToken);

            var summaries = characters
                .Select(c => new CharacterSummaryResponse(
                    c.Id,
                    c.Name,
                    c.Class.Name,
                    c.Status.ToString(),
                    c.Gender.ToString()))
                .ToList() as IReadOnlyList<CharacterSummaryResponse>;

            return Result<IReadOnlyList<CharacterSummaryResponse>>.Success(summaries);
        }

        /// <inheritdoc />
        public async Task<Result<CharacterResponse>> UpdateAsync(int characterId, int userId, UpdateCharacterRequest request, CancellationToken cancellationToken)
        {
            var character = await characterRepository.GetByIdAsync(characterId, cancellationToken);
            if (character is null)
                return Result<CharacterResponse>.Failure("Personnage introuvable.", 404);

            if (character.UserId != userId)
                return Result<CharacterResponse>.Failure("Accès non autorisé.", 403);

            if (character.Status is not (CharacterStatus.Draft or CharacterStatus.Rejected))
                return Result<CharacterResponse>.Failure("Seuls les personnages en brouillon ou rejetés peuvent être modifiés.", 400);

            if (!Enum.TryParse<Gender>(request.Gender, true, out var gender))
                return Result<CharacterResponse>.Failure("Genre invalide. Valeurs acceptées : Male, Female.");

            var classes = await referenceDataRepository.GetAllClassesAsync(cancellationToken);
            var characterClass = classes.FirstOrDefault(c => c.Id == request.ClassId);
            if (characterClass is null)
                return Result<CharacterResponse>.Failure("Classe de personnage invalide.", 400);

            var nameExists = await characterRepository.ExistsByNameAndUserAsync(request.Name, userId, characterId, cancellationToken);
            if (nameExists)
                return Result<CharacterResponse>.Failure("Vous avez déjà un personnage avec ce nom.", 409);

            character.Name = request.Name;
            character.ClassId = request.ClassId;
            character.Gender = gender;
            character.SkinColor = request.SkinColor;
            character.EyeColor = request.EyeColor;
            character.HairColor = request.HairColor;
            character.HairStyle = request.HairStyle;
            character.EyeShape = request.EyeShape;
            character.NoseShape = request.NoseShape;
            character.MouthShape = request.MouthShape;
            character.FaceShape = request.FaceShape;
            character.UpdatedAt = DateTime.UtcNow;

            await characterRepository.UpdateAsync(character, cancellationToken);
            return Result<CharacterResponse>.Success(MapToResponse(character, characterClass.Name));
        }

        /// <inheritdoc />
        public async Task<Result<bool>> DeleteAsync(int characterId, int userId, CancellationToken cancellationToken)
        {
            var character = await characterRepository.GetByIdAsync(characterId, cancellationToken);
            if (character is null)
                return Result<bool>.Failure("Personnage introuvable.", 404);

            if (character.UserId != userId)
                return Result<bool>.Failure("Accès non autorisé.", 403);

            await characterRepository.DeleteAsync(character, cancellationToken);
            return Result<bool>.Success(true);
        }

        /// <inheritdoc />
        public async Task<Result<CharacterResponse>> SubmitForReviewAsync(int characterId, int userId, CancellationToken cancellationToken)
        {
            var character = await characterRepository.GetByIdAsync(characterId, cancellationToken);
            if (character is null)
                return Result<CharacterResponse>.Failure("Personnage introuvable.", 404);

            if (character.UserId != userId)
                return Result<CharacterResponse>.Failure("Accès non autorisé.", 403);

            if (character.Status is not (CharacterStatus.Draft or CharacterStatus.Rejected))
                return Result<CharacterResponse>.Failure("Seuls les personnages en brouillon ou rejetés peuvent être soumis.", 400);

            character.Status = CharacterStatus.Pending;
            character.UpdatedAt = DateTime.UtcNow;

            await characterRepository.UpdateAsync(character, cancellationToken);
            return Result<CharacterResponse>.Success(MapToResponse(character, character.Class.Name));
        }

        /// <inheritdoc />
        public async Task<Result<bool>> IsNameAvailableAsync(string name, int userId, int? excludeCharacterId, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(name))
                return Result<bool>.Failure("Le nom est requis.", 400);

            var nameExists = await characterRepository.ExistsByNameAndUserAsync(name, userId, excludeCharacterId, cancellationToken);
            return Result<bool>.Success(!nameExists);
        }

        private static CharacterResponse MapToResponse(Character character, string className)
        {
            return new CharacterResponse(
                character.Id,
                character.Name,
                character.ClassId,
                className,
                character.Gender.ToString(),
                character.Status.ToString(),
                character.SkinColor,
                character.EyeColor,
                character.HairColor,
                character.HairStyle,
                character.EyeShape,
                character.NoseShape,
                character.MouthShape,
                character.FaceShape,
                character.IsShared,
                character.CreatedAt,
                character.UpdatedAt);
        }
    }
}
