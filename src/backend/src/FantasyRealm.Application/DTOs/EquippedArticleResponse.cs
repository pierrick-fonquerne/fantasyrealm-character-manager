namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Represents an article currently equipped on a character.
    /// </summary>
    /// <param name="ArticleId">The article identifier.</param>
    /// <param name="Name">The article display name.</param>
    /// <param name="SlotId">The equipment slot identifier.</param>
    /// <param name="SlotName">The equipment slot display name.</param>
    /// <param name="TypeId">The article type identifier.</param>
    /// <param name="TypeName">The article type display name.</param>
    public record EquippedArticleResponse(
        int ArticleId,
        string Name,
        int SlotId,
        string SlotName,
        int TypeId,
        string TypeName);
}
