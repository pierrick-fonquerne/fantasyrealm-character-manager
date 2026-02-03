namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Request payload for updating an existing character.
    /// </summary>
    public sealed record UpdateCharacterRequest(
        string Name,
        int ClassId,
        string Gender,
        string SkinColor,
        string EyeColor,
        string HairColor,
        string HairStyle,
        string EyeShape,
        string NoseShape,
        string MouthShape,
        string FaceShape);
}
