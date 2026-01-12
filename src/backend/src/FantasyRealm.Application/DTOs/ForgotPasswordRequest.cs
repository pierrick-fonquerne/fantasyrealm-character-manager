using System.ComponentModel.DataAnnotations;

namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Request payload for password reset functionality.
    /// Requires both email and pseudo for identity verification.
    /// </summary>
    public sealed record ForgotPasswordRequest(
        [Required(ErrorMessage = "L'email est requis.")]
        [EmailAddress(ErrorMessage = "Le format de l'email est invalide.")]
        [MaxLength(255, ErrorMessage = "L'email ne peut pas dépasser 255 caractères.")]
        string Email,

        [Required(ErrorMessage = "Le pseudo est requis.")]
        [MinLength(3, ErrorMessage = "Le pseudo doit contenir au moins 3 caractères.")]
        [MaxLength(30, ErrorMessage = "Le pseudo ne peut pas dépasser 30 caractères.")]
        string Pseudo
    );
}
