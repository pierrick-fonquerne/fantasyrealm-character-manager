namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Request payload for duplicating a character.
    /// </summary>
    public sealed record DuplicateCharacterRequest(string Name);
}
