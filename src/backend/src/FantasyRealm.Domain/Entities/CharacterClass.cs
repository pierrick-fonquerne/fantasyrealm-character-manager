namespace FantasyRealm.Domain.Entities
{
    /// <summary>
    /// Represents a playable character class (e.g. Warrior, Mage, Archer, Rogue).
    /// </summary>
    public class CharacterClass
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string? IconUrl { get; set; }
    }
}
