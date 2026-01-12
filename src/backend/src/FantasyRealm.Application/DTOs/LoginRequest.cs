using System.ComponentModel.DataAnnotations;

namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Request payload for user login.
    /// </summary>
    public sealed record LoginRequest(
        [Required(ErrorMessage = "L'email est requis.")]
        [EmailAddress(ErrorMessage = "Le format de l'email est invalide.")]
        string Email,

        [Required(ErrorMessage = "Le mot de passe est requis.")]
        string Password
    );
}
