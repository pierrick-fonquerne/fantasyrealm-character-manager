using System.ComponentModel.DataAnnotations;

namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Request payload for user registration.
    /// </summary>
    public sealed record RegisterRequest(
        [Required(ErrorMessage = "L'email est requis.")]
        [EmailAddress(ErrorMessage = "Le format de l'email est invalide.")]
        [MaxLength(255, ErrorMessage = "L'email ne peut pas dépasser 255 caractères.")]
        string Email,

        [Required(ErrorMessage = "Le pseudo est requis.")]
        [MinLength(3, ErrorMessage = "Le pseudo doit contenir au moins 3 caractères.")]
        [MaxLength(50, ErrorMessage = "Le pseudo ne peut pas dépasser 50 caractères.")]
        string Pseudo,

        [Required(ErrorMessage = "Le mot de passe est requis.")]
        string Password,

        [Required(ErrorMessage = "La confirmation du mot de passe est requise.")]
        string ConfirmPassword
    );
}
