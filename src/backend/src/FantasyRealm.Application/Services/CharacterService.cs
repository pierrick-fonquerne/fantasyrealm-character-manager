using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using FantasyRealm.Application.Mapping;
using FantasyRealm.Domain.Entities;
using FantasyRealm.Domain.Enums;
using FantasyRealm.Domain.Exceptions;

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

            var character = Character.Create(
                request.Name,
                request.ClassId,
                gender,
                request.SkinColor,
                request.EyeColor,
                request.HairColor,
                request.HairStyle,
                request.EyeShape,
                request.NoseShape,
                request.MouthShape,
                request.FaceShape,
                userId);

            var created = await characterRepository.CreateAsync(character, cancellationToken);
            return Result<CharacterResponse>.Success(CharacterMapper.ToResponse(created, characterClass.Name, true));
        }

        /// <inheritdoc />
        public async Task<Result<CharacterResponse>> GetByIdAsync(int characterId, int? userId, CancellationToken cancellationToken)
        {
            var character = await characterRepository.GetByIdAsync(characterId, cancellationToken);
            if (character is null)
                return Result<CharacterResponse>.Failure("Personnage introuvable.", 404);

            var isOwner = userId.HasValue && character.UserId == userId.Value;

            if (!isOwner && !(character.Status == CharacterStatus.Approved && character.IsShared))
                return Result<CharacterResponse>.Failure("Personnage introuvable.", 404);

            return Result<CharacterResponse>.Success(CharacterMapper.ToResponse(character, character.Class.Name, isOwner));
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

            if (!Enum.TryParse<Gender>(request.Gender, true, out var gender))
                return Result<CharacterResponse>.Failure("Genre invalide. Valeurs acceptées : Male, Female.");

            var classes = await referenceDataRepository.GetAllClassesAsync(cancellationToken);
            var characterClass = classes.FirstOrDefault(c => c.Id == request.ClassId);
            if (characterClass is null)
                return Result<CharacterResponse>.Failure("Classe de personnage invalide.", 400);

            var nameExists = await characterRepository.ExistsByNameAndUserAsync(request.Name, userId, characterId, cancellationToken);
            if (nameExists)
                return Result<CharacterResponse>.Failure("Vous avez déjà un personnage avec ce nom.", 409);

            try
            {
                character.UpdateAppearance(
                    request.Name,
                    request.ClassId,
                    gender,
                    request.SkinColor,
                    request.EyeColor,
                    request.HairColor,
                    request.HairStyle,
                    request.EyeShape,
                    request.NoseShape,
                    request.MouthShape,
                    request.FaceShape);
            }
            catch (DomainException ex)
            {
                return Result<CharacterResponse>.Failure(ex.Message, ex.StatusCode);
            }

            await characterRepository.UpdateAsync(character, cancellationToken);
            return Result<CharacterResponse>.Success(CharacterMapper.ToResponse(character, characterClass.Name, true));
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

            try
            {
                character.SubmitForReview();
            }
            catch (DomainException ex)
            {
                return Result<CharacterResponse>.Failure(ex.Message, ex.StatusCode);
            }

            await characterRepository.UpdateAsync(character, cancellationToken);
            return Result<CharacterResponse>.Success(CharacterMapper.ToResponse(character, character.Class.Name, true));
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

            var duplicate = Character.Duplicate(character, newName, userId);

            var created = await characterRepository.CreateAsync(duplicate, cancellationToken);
            return Result<CharacterResponse>.Success(CharacterMapper.ToResponse(created, character.Class.Name, true));
        }

        /// <inheritdoc />
        public async Task<Result<CharacterResponse>> ToggleShareAsync(int characterId, int userId, CancellationToken cancellationToken)
        {
            var character = await characterRepository.GetByIdAsync(characterId, cancellationToken);
            if (character is null)
                return Result<CharacterResponse>.Failure("Personnage introuvable.", 404);

            if (character.UserId != userId)
                return Result<CharacterResponse>.Failure("Accès non autorisé.", 403);

            try
            {
                character.ToggleShare();
            }
            catch (DomainException ex)
            {
                return Result<CharacterResponse>.Failure(ex.Message, ex.StatusCode);
            }

            await characterRepository.UpdateAsync(character, cancellationToken);
            return Result<CharacterResponse>.Success(CharacterMapper.ToResponse(character, character.Class.Name, true));
        }

        /// <inheritdoc />
        public async Task<Result<PagedResponse<GalleryCharacterResponse>>> GetGalleryAsync(
            string? gender,
            string? authorPseudo,
            string? sortBy,
            int page,
            int pageSize,
            CancellationToken cancellationToken)
        {
            if (page < 1)
                return Result<PagedResponse<GalleryCharacterResponse>>.Failure("Le numéro de page doit être supérieur à 0.");

            if (page > 1000)
                return Result<PagedResponse<GalleryCharacterResponse>>.Failure("Le numéro de page ne peut pas dépasser 1000.");

            pageSize = Math.Clamp(pageSize, 1, 50);

            var allowedSortValues = new[] { "recent", "oldest", "nameAsc" };
            var sort = allowedSortValues.Contains(sortBy) ? sortBy! : "recent";

            var sanitizedAuthor = SanitizeLikePattern(authorPseudo);

            var (items, totalCount) = await characterRepository.GetGalleryAsync(
                gender, sanitizedAuthor, sort, page, pageSize, cancellationToken);

            var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

            return Result<PagedResponse<GalleryCharacterResponse>>.Success(
                new PagedResponse<GalleryCharacterResponse>(items, page, pageSize, totalCount, totalPages));
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

        /// <summary>
        /// Escapes LIKE-pattern metacharacters (<c>%</c>, <c>_</c>, <c>\</c>) in a search term
        /// to prevent wildcard injection in PostgreSQL ILike queries.
        /// </summary>
        private static string? SanitizeLikePattern(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return value;

            return value
                .Replace(@"\", @"\\")
                .Replace("%", @"\%")
                .Replace("_", @"\_");
        }
    }
}
