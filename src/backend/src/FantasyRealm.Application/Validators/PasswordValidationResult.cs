namespace FantasyRealm.Application.Validators
{
    /// <summary>
    /// Represents the result of a password validation check.
    /// </summary>
    public sealed record PasswordValidationResult(
        bool IsValid,
        int Score,
        IReadOnlyList<string> Errors
    )
    {
        /// <summary>
        /// Password strength levels based on score.
        /// </summary>
        public string Strength => Score switch
        {
            0 => "Très faible",
            1 => "Faible",
            2 => "Moyen",
            3 => "Fort",
            >= 4 => "Très fort",
            _ => "Inconnu"
        };
    }
}
