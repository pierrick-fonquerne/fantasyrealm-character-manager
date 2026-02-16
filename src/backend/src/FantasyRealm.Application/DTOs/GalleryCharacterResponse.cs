namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Character data for the public gallery, including author information and appearance preview.
    /// </summary>
    public sealed record GalleryCharacterResponse(
        int Id,
        string Name,
        string ClassName,
        string Gender,
        string AuthorPseudo,
        DateTime CreatedAt,
        string SkinColor,
        string HairColor,
        string EyeColor,
        string FaceShape,
        string HairStyle,
        string EyeShape,
        string NoseShape,
        string MouthShape);
}
