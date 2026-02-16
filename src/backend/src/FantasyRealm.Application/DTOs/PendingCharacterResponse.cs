namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Represents a character pending moderation review.
    /// </summary>
    public sealed record PendingCharacterResponse(
        int Id,
        string Name,
        string ClassName,
        string Gender,
        string SkinColor,
        string EyeColor,
        string HairColor,
        string HairStyle,
        string EyeShape,
        string NoseShape,
        string MouthShape,
        string FaceShape,
        string OwnerPseudo,
        DateTime SubmittedAt);
}
