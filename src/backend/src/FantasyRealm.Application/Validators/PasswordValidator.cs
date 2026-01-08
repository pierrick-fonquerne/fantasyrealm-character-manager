using System.Text.RegularExpressions;

namespace FantasyRealm.Application.Validators
{
    /// <summary>
    /// Validates passwords according to CNIL recommendations.
    /// </summary>
    public static class PasswordValidator
    {
        private const int MinLength = 12;

        private static readonly Regex UppercaseRegex = new("[A-Z]", RegexOptions.Compiled);
        private static readonly Regex LowercaseRegex = new("[a-z]", RegexOptions.Compiled);
        private static readonly Regex DigitRegex = new("[0-9]", RegexOptions.Compiled);
        private static readonly Regex SpecialCharRegex = new(@"[!@#$%^&*()_+\-=\[\]{}|;:',.<>?/\\]", RegexOptions.Compiled);

        /// <summary>
        /// Validates a password against CNIL security requirements.
        /// </summary>
        /// <param name="password">The password to validate.</param>
        /// <returns>A result containing validation status, strength score, and any errors.</returns>
        public static PasswordValidationResult Validate(string password)
        {
            var errors = new List<string>();
            var score = 0;

            if (string.IsNullOrEmpty(password))
            {
                errors.Add("Le mot de passe est requis.");
                return new PasswordValidationResult(false, 0, errors);
            }

            if (password.Length < MinLength)
            {
                errors.Add($"Le mot de passe doit contenir au moins {MinLength} caractères.");
            }
            else
            {
                score++;
                if (password.Length >= 16) score++;
            }

            if (!UppercaseRegex.IsMatch(password))
            {
                errors.Add("Le mot de passe doit contenir au moins une majuscule.");
            }
            else
            {
                score++;
            }

            if (!LowercaseRegex.IsMatch(password))
            {
                errors.Add("Le mot de passe doit contenir au moins une minuscule.");
            }
            else
            {
                score++;
            }

            if (!DigitRegex.IsMatch(password))
            {
                errors.Add("Le mot de passe doit contenir au moins un chiffre.");
            }
            else
            {
                score++;
            }

            if (!SpecialCharRegex.IsMatch(password))
            {
                errors.Add("Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*()_+-=[]{}|;:',.<>?/).");
            }
            else
            {
                score++;
            }

            return new PasswordValidationResult(errors.Count == 0, score, errors);
        }
    }
}
