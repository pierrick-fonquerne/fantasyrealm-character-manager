using FantasyRealm.Application.DTOs;
using FantasyRealm.Domain.Entities;

namespace FantasyRealm.Application.Mapping
{
    /// <summary>
    /// Provides centralized mapping from <see cref="Character"/> entities to response DTOs.
    /// Shared across services to avoid duplication and ensure consistent serialization.
    /// </summary>
    public static class CharacterMapper
    {
        /// <summary>
        /// Maps a <see cref="Character"/> entity to a <see cref="CharacterResponse"/> DTO.
        /// </summary>
        /// <param name="character">The character entity to map.</param>
        /// <param name="className">The resolved class display name.</param>
        /// <param name="isOwner">Whether the requesting user owns this character.</param>
        /// <returns>A fully populated <see cref="CharacterResponse"/>.</returns>
        public static CharacterResponse ToResponse(Character character, string className, bool isOwner)
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
                isOwner,
                character.CreatedAt,
                character.UpdatedAt);
        }
    }
}
