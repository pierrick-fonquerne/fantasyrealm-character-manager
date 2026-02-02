using System.ComponentModel.DataAnnotations;

namespace FantasyRealm.Application.DTOs;

/// <summary>
/// Represents a contact form submission request.
/// </summary>
public sealed record ContactRequest(
    [Required(ErrorMessage = "L'email est requis.")]
    [EmailAddress(ErrorMessage = "L'email n'est pas valide.")]
    string Email,

    [Required(ErrorMessage = "Le pseudo est requis.")]
    string Pseudo,

    [Required(ErrorMessage = "Le message est requis.")]
    [MinLength(20, ErrorMessage = "Le message doit contenir au moins 20 caractères.")]
    string Message
);
