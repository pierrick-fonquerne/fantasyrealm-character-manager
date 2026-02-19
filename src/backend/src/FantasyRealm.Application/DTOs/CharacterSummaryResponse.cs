namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Character summary for list views including appearance data for preview.
    /// </summary>
    public sealed record CharacterSummaryResponse(
        int Id,
        string Name,
        string ClassName,
        string Status,
        string Gender,
        bool IsShared,
        string SkinColor,
        string HairColor,
        string EyeColor,
        string FaceShape,
        string HairStyle,
        string EyeShape,
        string NoseShape,
        string MouthShape);
}
