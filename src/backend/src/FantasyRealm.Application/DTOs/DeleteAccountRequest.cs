using System.ComponentModel.DataAnnotations;

namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Request payload for self-service account deletion.
    /// Requires the user's current password for confirmation.
    /// </summary>
    public sealed record DeleteAccountRequest(
        [Required(ErrorMessage = "Le mot de passe est requis.")]
        string Password
    );
}
