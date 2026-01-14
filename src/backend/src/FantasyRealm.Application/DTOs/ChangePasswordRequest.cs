using System.ComponentModel.DataAnnotations;

namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Request payload for changing user password.
    /// </summary>
    public sealed record ChangePasswordRequest(
        [Required(ErrorMessage = "Le mot de passe actuel est requis.")]
        string CurrentPassword,

        [Required(ErrorMessage = "Le nouveau mot de passe est requis.")]
        string NewPassword,

        [Required(ErrorMessage = "La confirmation du mot de passe est requise.")]
        string ConfirmNewPassword
    );
}
