namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Full character details returned by the API.
    /// </summary>
    public sealed record CharacterResponse(
        int Id,
        string Name,
        int ClassId,
        string ClassName,
        string Gender,
        string Status,
        string SkinColor,
        string EyeColor,
        string HairColor,
        string HairStyle,
        string EyeShape,
        string NoseShape,
        string MouthShape,
        string FaceShape,
        bool IsShared,
        bool IsOwner,
        DateTime CreatedAt,
        DateTime UpdatedAt);
}
