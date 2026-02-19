namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Response payload for an article type.
    /// </summary>
    /// <param name="Id">The unique identifier.</param>
    /// <param name="Name">The type name (e.g. Clothing, Armor, Weapon, Accessory).</param>
    public sealed record ArticleTypeResponse(
        int Id,
        string Name);
}
