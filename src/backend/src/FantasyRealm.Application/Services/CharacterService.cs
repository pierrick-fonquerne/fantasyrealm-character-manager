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
            var summaries = characters.Select(MapToSummaryResponse).ToList().AsReadOnly();
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

            if (character.Status is not (CharacterStatus.Draft or CharacterStatus.Rejected or CharacterStatus.Approved))
                return Result<CharacterResponse>.Failure("Seuls les personnages en brouillon, rejetés ou approuvés peuvent être modifiés.", 400);

            if (!Enum.TryParse<Gender>(request.Gender, true, out var gender))
                return Result<CharacterResponse>.Failure("Genre invalide. Valeurs acceptées : Male, Female.");

            var classes = await referenceDataRepository.GetAllClassesAsync(cancellationToken);
            var characterClass = classes.FirstOrDefault(c => c.Id == request.ClassId);
            if (characterClass is null)
                return Result<CharacterResponse>.Failure("Classe de personnage invalide.", 400);

            var nameExists = await characterRepository.ExistsByNameAndUserAsync(request.Name, userId, characterId, cancellationToken);
            if (nameExists)
                return Result<CharacterResponse>.Failure("Vous avez déjà un personnage avec ce nom.", 409);

            var nameChanged = !string.Equals(character.Name, request.Name, StringComparison.Ordinal);

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

            if (character.Status == CharacterStatus.Approved && nameChanged)
            {
                character.Status = CharacterStatus.Pending;
                character.IsShared = false;
            }

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

        /// <inheritdoc />
        public async Task<Result<CharacterResponse>> DuplicateAsync(int characterId, int userId, string newName, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(newName))
                return Result<CharacterResponse>.Failure("Le nom est requis.", 400);

            var character = await characterRepository.GetByIdAsync(characterId, cancellationToken);
            if (character is null)
                return Result<CharacterResponse>.Failure("Personnage introuvable.", 404);

            if (character.UserId != userId)
                return Result<CharacterResponse>.Failure("Accès non autorisé.", 403);

            if (character.Status != CharacterStatus.Approved)
                return Result<CharacterResponse>.Failure("Seuls les personnages approuvés peuvent être dupliqués.", 400);

            var nameExists = await characterRepository.ExistsByNameAndUserAsync(newName, userId, null, cancellationToken);
            if (nameExists)
                return Result<CharacterResponse>.Failure("Vous avez déjà un personnage avec ce nom.", 409);

            var duplicate = new Character
            {
                Name = newName,
                ClassId = character.ClassId,
                Gender = character.Gender,
                Status = CharacterStatus.Draft,
                SkinColor = character.SkinColor,
                EyeColor = character.EyeColor,
                HairColor = character.HairColor,
                HairStyle = character.HairStyle,
                EyeShape = character.EyeShape,
                NoseShape = character.NoseShape,
                MouthShape = character.MouthShape,
                FaceShape = character.FaceShape,
                IsShared = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                UserId = userId
            };

            var created = await characterRepository.CreateAsync(duplicate, cancellationToken);
            return Result<CharacterResponse>.Success(MapToResponse(created, character.Class.Name));
        }

        /// <inheritdoc />
        public async Task<Result<CharacterResponse>> ToggleShareAsync(int characterId, int userId, CancellationToken cancellationToken)
        {
            var character = await characterRepository.GetByIdAsync(characterId, cancellationToken);
            if (character is null)
                return Result<CharacterResponse>.Failure("Personnage introuvable.", 404);

            if (character.UserId != userId)
                return Result<CharacterResponse>.Failure("Accès non autorisé.", 403);

            if (character.Status != CharacterStatus.Approved)
                return Result<CharacterResponse>.Failure("Seuls les personnages approuvés peuvent être partagés.", 400);

            character.IsShared = !character.IsShared;
            character.UpdatedAt = DateTime.UtcNow;

            await characterRepository.UpdateAsync(character, cancellationToken);
            return Result<CharacterResponse>.Success(MapToResponse(character, character.Class.Name));
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

        private static CharacterSummaryResponse MapToSummaryResponse(Character character)
        {
            return new CharacterSummaryResponse(
                character.Id,
                character.Name,
                character.Class.Name,
                character.Status.ToString(),
                character.Gender.ToString(),
                character.IsShared,
                character.SkinColor,
                character.HairColor,
                character.EyeColor,
                character.FaceShape,
                character.HairStyle,
                character.EyeShape,
                character.NoseShape,
                character.MouthShape);
        }
    }
}
