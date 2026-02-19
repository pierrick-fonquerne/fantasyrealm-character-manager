namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Response payload for an equipment slot.
    /// </summary>
    /// <param name="Id">The unique identifier.</param>
    /// <param name="Name">The slot name (e.g. Head, Chest, MainHand).</param>
    /// <param name="DisplayOrder">The display order for UI rendering.</param>
    public sealed record EquipmentSlotResponse(
        int Id,
        string Name,
        int DisplayOrder);
}
