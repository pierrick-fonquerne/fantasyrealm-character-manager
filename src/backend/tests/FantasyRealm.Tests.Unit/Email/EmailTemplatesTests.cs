using FantasyRealm.Infrastructure.Email;

namespace FantasyRealm.Tests.Unit.Email
{
    public class EmailTemplatesTests
    {
        [Fact]
        public void GetWelcomeTemplate_ContainsPseudo()
        {
            // Arrange
            var pseudo = "TestPlayer";

            // Act
            var result = EmailTemplates.GetWelcomeTemplate(pseudo);

            // Assert
            Assert.Contains(pseudo, result);
            Assert.Contains("Bienvenue", result);
            Assert.Contains("Créer mon premier personnage", result);
        }

        [Fact]
        public void GetWelcomeTemplate_EscapesHtmlCharacters()
        {
            var pseudo = "<script>alert('xss')</script>";

            var result = EmailTemplates.GetWelcomeTemplate(pseudo);

            Assert.DoesNotContain("<script>", result);
            Assert.Contains("&lt;script&gt;", result);
        }

        [Fact]
        public void GetPasswordResetTemplate_ContainsTokenInUrl()
        {
            var pseudo = "TestPlayer";
            var resetToken = "abc123token";

            var result = EmailTemplates.GetPasswordResetTemplate(pseudo, resetToken);

            Assert.Contains(pseudo, result);
            Assert.Contains(resetToken, result);
            Assert.Contains("reset-password?token=", result);
            Assert.Contains("24 heures", result);
        }

        [Fact]
        public void GetPasswordResetTemplate_UrlEncodesSpecialCharacters()
        {
            var pseudo = "TestPlayer";
            var resetToken = "abc+def/ghi=jkl";

            var result = EmailTemplates.GetPasswordResetTemplate(pseudo, resetToken);

            Assert.Contains("token=abc%2Bdef%2Fghi%3Djkl", result);
            Assert.DoesNotContain("token=abc+def", result);
        }

        [Fact]
        public void GetTemporaryPasswordTemplate_ContainsPseudo()
        {
            var pseudo = "TestPlayer";
            var temporaryPassword = "TempPass@123!";

            var result = EmailTemplates.GetTemporaryPasswordTemplate(pseudo, temporaryPassword);

            Assert.Contains(pseudo, result);
            Assert.Contains(temporaryPassword, result);
            Assert.Contains("mot de passe temporaire", result.ToLower());
        }

        [Fact]
        public void GetTemporaryPasswordTemplate_ContainsChangePasswordWarning()
        {
            var pseudo = "TestPlayer";
            var temporaryPassword = "TempPass@123!";

            var result = EmailTemplates.GetTemporaryPasswordTemplate(pseudo, temporaryPassword);

            Assert.Contains("changer ce mot de passe", result.ToLower());
            Assert.Contains("prochaine connexion", result.ToLower());
        }

        [Fact]
        public void GetTemporaryPasswordTemplate_EscapesHtmlCharacters()
        {
            var pseudo = "<script>alert('xss')</script>";
            var temporaryPassword = "TempPass@123!";

            var result = EmailTemplates.GetTemporaryPasswordTemplate(pseudo, temporaryPassword);

            Assert.DoesNotContain("<script>", result);
            Assert.Contains("&lt;script&gt;", result);
        }

        [Fact]
        public void GetCharacterApprovedTemplate_ContainsCharacterName()
        {
            var pseudo = "TestPlayer";
            var characterName = "Thorin";

            var result = EmailTemplates.GetCharacterApprovedTemplate(pseudo, characterName);

            Assert.Contains(pseudo, result);
            Assert.Contains(characterName, result);
            Assert.Contains("approuvé", result.ToLower());
        }

        [Fact]
        public void GetCharacterRejectedTemplate_ContainsReason()
        {
            var pseudo = "TestPlayer";
            var characterName = "Thorin";
            var reason = "Inappropriate content";

            var result = EmailTemplates.GetCharacterRejectedTemplate(pseudo, characterName, reason);

            Assert.Contains(pseudo, result);
            Assert.Contains(characterName, result);
            Assert.Contains(reason, result);
            Assert.Contains("non approuvé", result.ToLower());
        }

        [Fact]
        public void GetCommentApprovedTemplate_ContainsCharacterName()
        {
            var pseudo = "TestPlayer";
            var characterName = "Thorin";

            var result = EmailTemplates.GetCommentApprovedTemplate(pseudo, characterName);

            Assert.Contains(pseudo, result);
            Assert.Contains(characterName, result);
            Assert.Contains("Commentaire publié", result);
        }

        [Fact]
        public void GetCommentRejectedTemplate_ContainsReason()
        {
            var pseudo = "TestPlayer";
            var characterName = "Thorin";
            var reason = "Offensive language";

            var result = EmailTemplates.GetCommentRejectedTemplate(pseudo, characterName, reason);

            Assert.Contains(pseudo, result);
            Assert.Contains(characterName, result);
            Assert.Contains(reason, result);
        }

        [Fact]
        public void GetAccountSuspendedTemplate_ContainsReason()
        {
            var pseudo = "TestPlayer";
            var reason = "Multiple violations of community guidelines";

            var result = EmailTemplates.GetAccountSuspendedTemplate(pseudo, reason);

            Assert.Contains(pseudo, result);
            Assert.Contains(reason, result);
            Assert.Contains("suspendu", result.ToLower());
        }

        [Theory]
        [InlineData("GetWelcomeTemplate")]
        [InlineData("GetPasswordResetTemplate")]
        [InlineData("GetTemporaryPasswordTemplate")]
        [InlineData("GetCharacterApprovedTemplate")]
        [InlineData("GetCharacterRejectedTemplate")]
        [InlineData("GetCommentApprovedTemplate")]
        [InlineData("GetCommentRejectedTemplate")]
        [InlineData("GetAccountSuspendedTemplate")]
        public void AllTemplates_ContainHtmlStructure(string templateMethod)
        {
            var result = templateMethod switch
            {
                "GetWelcomeTemplate" => EmailTemplates.GetWelcomeTemplate("Test"),
                "GetPasswordResetTemplate" => EmailTemplates.GetPasswordResetTemplate("Test", "token"),
                "GetTemporaryPasswordTemplate" => EmailTemplates.GetTemporaryPasswordTemplate("Test", "TempPass123!"),
                "GetCharacterApprovedTemplate" => EmailTemplates.GetCharacterApprovedTemplate("Test", "Character"),
                "GetCharacterRejectedTemplate" => EmailTemplates.GetCharacterRejectedTemplate("Test", "Character", "Reason"),
                "GetCommentApprovedTemplate" => EmailTemplates.GetCommentApprovedTemplate("Test", "Character"),
                "GetCommentRejectedTemplate" => EmailTemplates.GetCommentRejectedTemplate("Test", "Character", "Reason"),
                "GetAccountSuspendedTemplate" => EmailTemplates.GetAccountSuspendedTemplate("Test", "Reason"),
                _ => throw new ArgumentException($"Unknown template: {templateMethod}")
            };

            Assert.Contains("<!DOCTYPE html>", result);
            Assert.Contains("<html", result);
            Assert.Contains("</html>", result);
            Assert.Contains("FantasyRealm", result);
            Assert.Contains("PixelVerse Studios", result);
        }

        [Fact]
        public void AllTemplates_ContainCurrentYear()
        {
            var currentYear = DateTime.UtcNow.Year.ToString();

            var templates = new[]
            {
                EmailTemplates.GetWelcomeTemplate("Test"),
                EmailTemplates.GetPasswordResetTemplate("Test", "token"),
                EmailTemplates.GetTemporaryPasswordTemplate("Test", "TempPass123!"),
                EmailTemplates.GetCharacterApprovedTemplate("Test", "Character"),
                EmailTemplates.GetCharacterRejectedTemplate("Test", "Character", "Reason"),
                EmailTemplates.GetCommentApprovedTemplate("Test", "Character"),
                EmailTemplates.GetCommentRejectedTemplate("Test", "Character", "Reason"),
                EmailTemplates.GetAccountSuspendedTemplate("Test", "Reason")
            };

            foreach (var template in templates)
            {
                Assert.Contains(currentYear, template);
            }
        }
    }
}
