namespace FantasyRealm.Domain.Entities
{
    /// <summary>
    /// Represents an equipment slot where articles can be equipped (e.g. Head, Chest, MainHand).
    /// </summary>
    public class EquipmentSlot
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public int DisplayOrder { get; set; }
    }
}
