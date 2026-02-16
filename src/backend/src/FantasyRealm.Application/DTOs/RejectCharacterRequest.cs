using System.ComponentModel.DataAnnotations;

namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Request payload for rejecting a character during moderation.
    /// </summary>
    public sealed record RejectCharacterRequest(
        [Required]
        [MinLength(10, ErrorMessage = "Le motif de rejet doit contenir au moins 10 caractères.")]
        [MaxLength(500, ErrorMessage = "Le motif de rejet ne peut pas dépasser 500 caractères.")]
        string Reason);
}
