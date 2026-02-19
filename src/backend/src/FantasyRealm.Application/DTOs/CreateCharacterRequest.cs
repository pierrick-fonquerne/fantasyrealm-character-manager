namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Request payload for creating a new character.
    /// </summary>
    public sealed record CreateCharacterRequest(
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
