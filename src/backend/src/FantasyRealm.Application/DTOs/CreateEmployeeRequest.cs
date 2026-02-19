using System.ComponentModel.DataAnnotations;

namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Request payload for creating a new employee account.
    /// The pseudo is automatically derived from the email address.
    /// </summary>
    public sealed record CreateEmployeeRequest(
        [Required(ErrorMessage = "L'adresse email est requise.")]
        [EmailAddress(ErrorMessage = "L'adresse email n'est pas valide.")]
        [MaxLength(254, ErrorMessage = "L'adresse email ne peut pas dépasser 254 caractères.")]
        string Email,

        [Required(ErrorMessage = "Le mot de passe est requis.")]
        [MinLength(12, ErrorMessage = "Le mot de passe doit contenir au moins 12 caractères.")]
        [MaxLength(128, ErrorMessage = "Le mot de passe ne peut pas dépasser 128 caractères.")]
        string Password);
}
