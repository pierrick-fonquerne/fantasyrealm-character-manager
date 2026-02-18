using System.ComponentModel.DataAnnotations;

namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Request payload for updating a user's suspension status.
    /// When <see cref="IsSuspended"/> is true, <see cref="Reason"/> is required.
    /// </summary>
    public sealed record UpdateUserStatusRequest(
        bool IsSuspended,

        [MaxLength(500, ErrorMessage = "Le motif de suspension ne peut pas dépasser 500 caractères.")]
        string? Reason);
}
