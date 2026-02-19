namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Response payload for a character class.
    /// </summary>
    /// <param name="Id">The unique identifier.</param>
    /// <param name="Name">The class name (e.g. Warrior, Mage).</param>
    /// <param name="Description">A short description of the class.</param>
    /// <param name="IconUrl">Optional URL to the class icon.</param>
    public sealed record CharacterClassResponse(
        int Id,
        string Name,
        string Description,
        string? IconUrl);
}
