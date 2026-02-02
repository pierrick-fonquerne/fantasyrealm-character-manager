using System.Net;

namespace FantasyRealm.Infrastructure.Email
{
    /// <summary>
    /// Provides HTML email templates for various notification types.
    /// Uses a dark fantasy theme consistent with the FantasyRealm MMORPG aesthetic.
    /// </summary>
    public static class EmailTemplates
    {
        private const string DarkBg = "#0D0D0F";      // --dark-900
        private const string CardBg = "#121110";      // --dark-800
        private const string CardBorder = "#18181B";  // --dark-700
        private const string GoldPrimary = "#F59E0B"; // --gold-500
        private const string GoldLight = "#FBBF24";   // --gold-400
        private const string GoldDark = "#D97706";    // --gold-600
        private const string TextLight = "#E8E4DE";   // --cream-200 (text-primary)
        private const string TextMuted = "#A8A29E";   // --cream-400 (text-muted)

        /// <summary>
        /// Generates a welcome email template for new users.
        /// </summary>
        /// <param name="pseudo">The user's display name.</param>
        /// <param name="baseUrl">The base URL for links in the email.</param>
        /// <returns>The HTML email body.</returns>
        public static string GetWelcomeTemplate(string pseudo, string baseUrl)
        {
            return WrapInLayout(
                "Bienvenue dans FantasyRealm !",
                $@"
                <div style=""text-align: center; margin-bottom: 30px;"">
                    <div style=""font-size: 48px; margin-bottom: 10px;"">⚔️</div>
                    <h1 style=""color: {GoldPrimary}; font-size: 28px; margin: 0; font-weight: 700;"">
                        Bienvenue, {Encode(pseudo)} !
                    </h1>
                    <p style=""color: {TextMuted}; margin-top: 8px; font-size: 16px;"">
                        Votre aventure commence maintenant
                    </p>
                </div>

                <div style=""background: linear-gradient(135deg, {CardBorder} 0%, transparent 100%); padding: 1px; border-radius: 12px; margin-bottom: 25px;"">
                    <div style=""background: {CardBg}; border-radius: 12px; padding: 25px;"">
                        <p style=""color: {TextLight}; margin: 0 0 20px 0; font-size: 16px; line-height: 1.7;"">
                            Merci d'avoir rejoint la guilde des aventuriers de <strong style=""color: {GoldPrimary};"">FantasyRealm Online</strong>.
                            Un monde de magie et d'aventures vous attend !
                        </p>

                        <div style=""border-left: 3px solid {GoldPrimary}; padding-left: 20px; margin: 20px 0;"">
                            <p style=""color: {GoldLight}; margin: 0 0 15px 0; font-weight: 600; font-size: 15px;"">
                                🎮 Vous pouvez maintenant :
                            </p>
                            <ul style=""color: {TextLight}; margin: 0; padding-left: 20px; list-style: none;"">
                                <li style=""margin: 10px 0; padding-left: 5px;"">
                                    <span style=""color: {GoldPrimary}; margin-right: 10px;"">✦</span>
                                    Créer et personnaliser vos personnages
                                </li>
                                <li style=""margin: 10px 0; padding-left: 5px;"">
                                    <span style=""color: {GoldPrimary}; margin-right: 10px;"">✦</span>
                                    Les équiper d'armes, armures et accessoires légendaires
                                </li>
                                <li style=""margin: 10px 0; padding-left: 5px;"">
                                    <span style=""color: {GoldPrimary}; margin-right: 10px;"">✦</span>
                                    Partager vos créations avec la communauté
                                </li>
                                <li style=""margin: 10px 0; padding-left: 5px;"">
                                    <span style=""color: {GoldPrimary}; margin-right: 10px;"">✦</span>
                                    Découvrir les héros des autres joueurs
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div style=""text-align: center; margin: 30px 0;"">
                    {GetPrimaryButton("Créer mon premier personnage", $"{baseUrl}/characters/create", "🛡️")}
                </div>

                <p style=""color: {TextMuted}; text-align: center; font-size: 14px; margin-top: 25px;"">
                    Que la fortune guide vos pas, aventurier !
                </p>
            ");
        }

        /// <summary>
        /// Generates a password reset email template.
        /// </summary>
        /// <param name="pseudo">The user's display name.</param>
        /// <param name="resetToken">The password reset token.</param>
        /// <param name="baseUrl">The base URL for links in the email.</param>
        /// <returns>The HTML email body.</returns>
        public static string GetPasswordResetTemplate(string pseudo, string resetToken, string baseUrl)
        {
            var resetUrl = $"{baseUrl}/reset-password?token={Uri.EscapeDataString(resetToken)}";
            return WrapInLayout(
                "Réinitialisation de mot de passe",
                $@"
                <div style=""text-align: center; margin-bottom: 30px;"">
                    <div style=""font-size: 48px; margin-bottom: 10px;"">🔐</div>
                    <h1 style=""color: {GoldPrimary}; font-size: 24px; margin: 0; font-weight: 700;"">
                        Réinitialisation de mot de passe
                    </h1>
                </div>

                <div style=""background: {CardBg}; border: 1px solid {CardBorder}; border-radius: 12px; padding: 25px; margin-bottom: 25px;"">
                    <p style=""color: {TextLight}; margin: 0 0 15px 0; font-size: 16px;"">
                        Bonjour <strong style=""color: {GoldPrimary};"">{Encode(pseudo)}</strong>,
                    </p>
                    <p style=""color: {TextLight}; margin: 0 0 20px 0; font-size: 16px; line-height: 1.7;"">
                        Nous avons reçu une demande de réinitialisation de votre mot de passe.
                        Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
                    </p>
                </div>

                <div style=""text-align: center; margin: 30px 0;"">
                    {GetPrimaryButton("Réinitialiser mon mot de passe", resetUrl, "🔑")}
                </div>

                <div style=""background: rgba(212, 175, 55, 0.1); border: 1px solid {GoldDark}; border-radius: 8px; padding: 15px; margin-top: 25px;"">
                    <p style=""color: {TextMuted}; margin: 0; font-size: 13px; line-height: 1.6;"">
                        ⏱️ Ce lien expirera dans <strong>24 heures</strong>.<br>
                        🛡️ Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.
                    </p>
                </div>
            ");
        }

        /// <summary>
        /// Generates a temporary password email template.
        /// </summary>
        /// <param name="pseudo">The user's display name.</param>
        /// <param name="temporaryPassword">The generated temporary password.</param>
        /// <param name="baseUrl">The base URL for links in the email.</param>
        /// <returns>The HTML email body.</returns>
        public static string GetTemporaryPasswordTemplate(string pseudo, string temporaryPassword, string baseUrl)
        {
            return WrapInLayout(
                "Nouveau mot de passe temporaire",
                $@"
                <div style=""text-align: center; margin-bottom: 30px;"">
                    <div style=""font-size: 48px; margin-bottom: 10px;"">🔐</div>
                    <h1 style=""color: {GoldPrimary}; font-size: 24px; margin: 0; font-weight: 700;"">
                        Nouveau mot de passe temporaire
                    </h1>
                </div>

                <div style=""background: {CardBg}; border: 1px solid {CardBorder}; border-radius: 12px; padding: 25px; margin-bottom: 25px;"">
                    <p style=""color: {TextLight}; margin: 0 0 15px 0; font-size: 16px;"">
                        Bonjour <strong style=""color: {GoldPrimary};"">{Encode(pseudo)}</strong>,
                    </p>
                    <p style=""color: {TextLight}; margin: 0 0 20px 0; font-size: 16px; line-height: 1.7;"">
                        Suite à votre demande, voici votre nouveau mot de passe temporaire :
                    </p>
                </div>

                <div style=""background: rgba(212, 175, 55, 0.15); border: 2px solid {GoldPrimary}; border-radius: 12px; padding: 20px; margin-bottom: 25px; text-align: center;"">
                    <p style=""color: {TextMuted}; margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;"">
                        Votre mot de passe temporaire
                    </p>
                    <p style=""color: {GoldLight}; margin: 0; font-size: 24px; font-family: monospace; font-weight: 700; letter-spacing: 2px;"">
                        {Encode(temporaryPassword)}
                    </p>
                </div>

                <div style=""background: rgba(239, 68, 68, 0.1); border: 1px solid #7F1D1D; border-radius: 8px; padding: 20px; margin-bottom: 25px;"">
                    <p style=""color: #FCA5A5; margin: 0 0 8px 0; font-weight: 600; font-size: 14px;"">
                        ⚠️ Important
                    </p>
                    <p style=""color: {TextLight}; margin: 0; font-size: 14px; line-height: 1.6;"">
                        Vous devrez <strong>changer ce mot de passe</strong> lors de votre prochaine connexion.
                        Ce mot de passe est temporaire et ne devrait pas être réutilisé.
                    </p>
                </div>

                <div style=""text-align: center; margin: 30px 0;"">
                    {GetPrimaryButton("Se connecter", $"{baseUrl}/login", "🔑")}
                </div>

                <div style=""background: rgba(212, 175, 55, 0.1); border: 1px solid {GoldDark}; border-radius: 8px; padding: 15px; margin-top: 25px;"">
                    <p style=""color: {TextMuted}; margin: 0; font-size: 13px; line-height: 1.6;"">
                        🛡️ Si vous n'êtes pas à l'origine de cette demande, veuillez contacter notre support immédiatement.
                    </p>
                </div>
            ");
        }

        /// <summary>
        /// Generates a character approved email template.
        /// </summary>
        /// <param name="pseudo">The user's display name.</param>
        /// <param name="characterName">The approved character's name.</param>
        /// <param name="baseUrl">The base URL for links in the email.</param>
        /// <returns>The HTML email body.</returns>
        public static string GetCharacterApprovedTemplate(string pseudo, string characterName, string baseUrl)
        {
            return WrapInLayout(
                "Personnage approuvé !",
                $@"
                <div style=""text-align: center; margin-bottom: 30px;"">
                    <div style=""font-size: 48px; margin-bottom: 10px;"">🎉</div>
                    <h1 style=""color: {GoldPrimary}; font-size: 24px; margin: 0; font-weight: 700;"">
                        Personnage approuvé !
                    </h1>
                </div>

                <div style=""background: {CardBg}; border: 1px solid {CardBorder}; border-radius: 12px; padding: 25px; margin-bottom: 25px;"">
                    <p style=""color: {TextLight}; margin: 0 0 15px 0; font-size: 16px;"">
                        Excellente nouvelle, <strong style=""color: {GoldPrimary};"">{Encode(pseudo)}</strong> !
                    </p>
                    <p style=""color: {TextLight}; margin: 0; font-size: 16px; line-height: 1.7;"">
                        Votre personnage <strong style=""color: {GoldLight};"">{Encode(characterName)}</strong> a été examiné
                        et approuvé par notre équipe de modération.
                    </p>
                </div>

                <div style=""background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%); border-radius: 12px; padding: 20px; margin-bottom: 25px;"">
                    <p style=""color: {TextLight}; margin: 0; font-size: 15px; text-align: center;"">
                        ✨ Votre personnage est maintenant visible par toute la communauté FantasyRealm !
                    </p>
                </div>

                <div style=""text-align: center; margin: 30px 0;"">
                    {GetPrimaryButton("Voir mes personnages", $"{baseUrl}/characters", "👥")}
                </div>
            ");
        }

        /// <summary>
        /// Generates a character rejected email template.
        /// </summary>
        /// <param name="pseudo">The user's display name.</param>
        /// <param name="characterName">The rejected character's name.</param>
        /// <param name="reason">The rejection reason.</param>
        /// <param name="baseUrl">The base URL for links in the email.</param>
        /// <returns>The HTML email body.</returns>
        public static string GetCharacterRejectedTemplate(string pseudo, string characterName, string reason, string baseUrl)
        {
            return WrapInLayout(
                "Personnage non approuvé",
                $@"
                <div style=""text-align: center; margin-bottom: 30px;"">
                    <div style=""font-size: 48px; margin-bottom: 10px;"">📝</div>
                    <h1 style=""color: {GoldPrimary}; font-size: 24px; margin: 0; font-weight: 700;"">
                        Personnage non approuvé
                    </h1>
                </div>

                <div style=""background: {CardBg}; border: 1px solid {CardBorder}; border-radius: 12px; padding: 25px; margin-bottom: 25px;"">
                    <p style=""color: {TextLight}; margin: 0 0 15px 0; font-size: 16px;"">
                        Bonjour <strong style=""color: {GoldPrimary};"">{Encode(pseudo)}</strong>,
                    </p>
                    <p style=""color: {TextLight}; margin: 0; font-size: 16px; line-height: 1.7;"">
                        Malheureusement, votre personnage <strong style=""color: {GoldLight};"">{Encode(characterName)}</strong>
                        n'a pas été approuvé pour l'affichage public.
                    </p>
                </div>

                <div style=""background: rgba(239, 68, 68, 0.1); border: 1px solid #7F1D1D; border-radius: 8px; padding: 20px; margin-bottom: 25px;"">
                    <p style=""color: #FCA5A5; margin: 0 0 8px 0; font-weight: 600; font-size: 14px;"">
                        ⚠️ Raison du refus :
                    </p>
                    <p style=""color: {TextLight}; margin: 0; font-size: 15px;"">
                        {Encode(reason)}
                    </p>
                </div>

                <p style=""color: {TextMuted}; font-size: 14px; line-height: 1.6; margin-bottom: 25px;"">
                    Vous pouvez modifier votre personnage et le soumettre à nouveau pour examen.
                </p>

                <div style=""text-align: center; margin: 30px 0;"">
                    {GetPrimaryButton("Modifier mon personnage", $"{baseUrl}/characters", "✏️")}
                </div>
            ");
        }

        /// <summary>
        /// Generates a comment approved email template.
        /// </summary>
        /// <param name="pseudo">The user's display name.</param>
        /// <param name="characterName">The character's name that was commented on.</param>
        /// <param name="baseUrl">The base URL for links in the email.</param>
        /// <returns>The HTML email body.</returns>
        public static string GetCommentApprovedTemplate(string pseudo, string characterName, string baseUrl)
        {
            return WrapInLayout(
                "Commentaire publié !",
                $@"
                <div style=""text-align: center; margin-bottom: 30px;"">
                    <div style=""font-size: 48px; margin-bottom: 10px;"">💬</div>
                    <h1 style=""color: {GoldPrimary}; font-size: 24px; margin: 0; font-weight: 700;"">
                        Commentaire publié !
                    </h1>
                </div>

                <div style=""background: {CardBg}; border: 1px solid {CardBorder}; border-radius: 12px; padding: 25px; margin-bottom: 25px;"">
                    <p style=""color: {TextLight}; margin: 0 0 15px 0; font-size: 16px;"">
                        Bonjour <strong style=""color: {GoldPrimary};"">{Encode(pseudo)}</strong>,
                    </p>
                    <p style=""color: {TextLight}; margin: 0; font-size: 16px; line-height: 1.7;"">
                        Votre commentaire sur le personnage <strong style=""color: {GoldLight};"">{Encode(characterName)}</strong>
                        a été approuvé et est maintenant visible par la communauté.
                    </p>
                </div>

                <p style=""color: {TextMuted}; text-align: center; font-size: 15px; margin-bottom: 25px;"">
                    🙏 Merci de contribuer à la communauté FantasyRealm !
                </p>

                <div style=""text-align: center; margin: 30px 0;"">
                    {GetPrimaryButton("Explorer la galerie", $"{baseUrl}/gallery", "🖼️")}
                </div>
            ");
        }

        /// <summary>
        /// Generates a comment rejected email template.
        /// </summary>
        /// <param name="pseudo">The user's display name.</param>
        /// <param name="characterName">The character's name that was commented on.</param>
        /// <param name="reason">The rejection reason.</param>
        /// <returns>The HTML email body.</returns>
        public static string GetCommentRejectedTemplate(string pseudo, string characterName, string reason)
        {
            return WrapInLayout(
                "Commentaire non approuvé",
                $@"
                <div style=""text-align: center; margin-bottom: 30px;"">
                    <div style=""font-size: 48px; margin-bottom: 10px;"">💬</div>
                    <h1 style=""color: {GoldPrimary}; font-size: 24px; margin: 0; font-weight: 700;"">
                        Commentaire non approuvé
                    </h1>
                </div>

                <div style=""background: {CardBg}; border: 1px solid {CardBorder}; border-radius: 12px; padding: 25px; margin-bottom: 25px;"">
                    <p style=""color: {TextLight}; margin: 0 0 15px 0; font-size: 16px;"">
                        Bonjour <strong style=""color: {GoldPrimary};"">{Encode(pseudo)}</strong>,
                    </p>
                    <p style=""color: {TextLight}; margin: 0; font-size: 16px; line-height: 1.7;"">
                        Votre commentaire sur le personnage <strong style=""color: {GoldLight};"">{Encode(characterName)}</strong>
                        n'a pas été approuvé pour publication.
                    </p>
                </div>

                <div style=""background: rgba(239, 68, 68, 0.1); border: 1px solid #7F1D1D; border-radius: 8px; padding: 20px; margin-bottom: 25px;"">
                    <p style=""color: #FCA5A5; margin: 0 0 8px 0; font-weight: 600; font-size: 14px;"">
                        ⚠️ Raison du refus :
                    </p>
                    <p style=""color: {TextLight}; margin: 0; font-size: 15px;"">
                        {Encode(reason)}
                    </p>
                </div>

                <p style=""color: {TextMuted}; font-size: 14px; line-height: 1.6;"">
                    Veuillez consulter nos règles de communauté. Vous pouvez soumettre un nouveau commentaire respectant ces règles.
                </p>
            ");
        }

        /// <summary>
        /// Generates an account suspended email template.
        /// </summary>
        /// <param name="pseudo">The user's display name.</param>
        /// <param name="reason">The suspension reason.</param>
        /// <returns>The HTML email body.</returns>
        public static string GetAccountSuspendedTemplate(string pseudo, string reason)
        {
            return WrapInLayout(
                "Compte suspendu",
                $@"
                <div style=""text-align: center; margin-bottom: 30px;"">
                    <div style=""font-size: 48px; margin-bottom: 10px;"">🚫</div>
                    <h1 style=""color: #EF4444; font-size: 24px; margin: 0; font-weight: 700;"">
                        Compte suspendu
                    </h1>
                </div>

                <div style=""background: {CardBg}; border: 1px solid {CardBorder}; border-radius: 12px; padding: 25px; margin-bottom: 25px;"">
                    <p style=""color: {TextLight}; margin: 0 0 15px 0; font-size: 16px;"">
                        Bonjour <strong style=""color: {GoldPrimary};"">{Encode(pseudo)}</strong>,
                    </p>
                    <p style=""color: {TextLight}; margin: 0; font-size: 16px; line-height: 1.7;"">
                        Votre compte FantasyRealm a été suspendu en raison d'une violation de nos conditions d'utilisation.
                    </p>
                </div>

                <div style=""background: rgba(239, 68, 68, 0.1); border: 1px solid #7F1D1D; border-radius: 8px; padding: 20px; margin-bottom: 25px;"">
                    <p style=""color: #FCA5A5; margin: 0 0 8px 0; font-weight: 600; font-size: 14px;"">
                        ⚠️ Raison de la suspension :
                    </p>
                    <p style=""color: {TextLight}; margin: 0; font-size: 15px;"">
                        {Encode(reason)}
                    </p>
                </div>

                <div style=""background: rgba(212, 175, 55, 0.1); border: 1px solid {GoldDark}; border-radius: 8px; padding: 15px;"">
                    <p style=""color: {TextMuted}; margin: 0; font-size: 13px; line-height: 1.6;"">
                        📧 Si vous pensez qu'il s'agit d'une erreur, veuillez contacter notre équipe de support.<br>
                        🔒 Vous ne pourrez pas accéder à votre compte ni à vos personnages tant que cette situation n'aura pas été résolue.
                    </p>
                </div>
            ");
        }

        /// <summary>
        /// Generates a contact form notification email template for the administrator.
        /// </summary>
        /// <param name="fromEmail">The sender's email address.</param>
        /// <param name="pseudo">The sender's display name.</param>
        /// <param name="message">The contact message content.</param>
        /// <returns>The HTML email body.</returns>
        public static string GetContactNotificationTemplate(string fromEmail, string pseudo, string message)
        {
            return WrapInLayout(
                "Nouveau message de contact",
                $@"
                <div style=""text-align: center; margin-bottom: 30px;"">
                    <div style=""font-size: 48px; margin-bottom: 10px;"">📩</div>
                    <h1 style=""color: {GoldPrimary}; font-size: 24px; margin: 0; font-weight: 700;"">
                        Nouveau message de contact
                    </h1>
                </div>

                <div style=""background: {CardBg}; border: 1px solid {CardBorder}; border-radius: 12px; padding: 25px; margin-bottom: 25px;"">
                    <p style=""color: {TextMuted}; margin: 0 0 5px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;"">
                        Expéditeur
                    </p>
                    <p style=""color: {TextLight}; margin: 0 0 15px 0; font-size: 16px;"">
                        <strong style=""color: {GoldPrimary};"">{Encode(pseudo)}</strong>
                        &lt;{Encode(fromEmail)}&gt;
                    </p>

                    <div style=""border-top: 1px solid {CardBorder}; padding-top: 15px; margin-top: 15px;"">
                        <p style=""color: {TextMuted}; margin: 0 0 5px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;"">
                            Message
                        </p>
                        <p style=""color: {TextLight}; margin: 0; font-size: 15px; line-height: 1.7; white-space: pre-wrap;"">
                            {Encode(message)}
                        </p>
                    </div>
                </div>

                <div style=""background: rgba(212, 175, 55, 0.1); border: 1px solid {GoldDark}; border-radius: 8px; padding: 15px;"">
                    <p style=""color: {TextMuted}; margin: 0; font-size: 13px; line-height: 1.6;"">
                        📧 Vous pouvez répondre directement à <strong style=""color: {GoldLight};"">{Encode(fromEmail)}</strong>
                    </p>
                </div>
            ");
        }

        private static string Encode(string value)
        {
            return WebUtility.HtmlEncode(value);
        }

        private static string GetPrimaryButton(string text, string url, string icon = "")
        {
            var iconHtml = string.IsNullOrEmpty(icon) ? "" : $"{icon} ";
            return $@"
                <a href=""{url}""
                   style=""display: inline-block;
                          background: linear-gradient(135deg, {GoldPrimary} 0%, {GoldDark} 100%);
                          color: {DarkBg} !important;
                          text-decoration: none;
                          padding: 14px 32px;
                          border-radius: 8px;
                          font-weight: 700;
                          font-size: 15px;
                          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
                          border: 1px solid {GoldLight};"">
                    {iconHtml}{text}
                </a>";
        }

        private static string WrapInLayout(string title, string content)
        {
            return $@"
                <!DOCTYPE html>
                <html lang=""fr"">
                <head>
                    <meta charset=""UTF-8"">
                    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
                    <title>{Encode(title)} - FantasyRealm</title>
                    <!--[if mso]>
                    <noscript>
                        <xml>
                            <o:OfficeDocumentSettings>
                                <o:PixelsPerInch>96</o:PixelsPerInch>
                            </o:OfficeDocumentSettings>
                        </xml>
                    </noscript>
                    <![endif]-->
                </head>
                <body style=""margin: 0; padding: 0; background-color: {DarkBg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;"">

                    <!-- Wrapper table for full-width background -->
                    <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""background-color: {DarkBg};"">
                        <tr>
                            <td align=""center"" style=""padding: 40px 20px;"">

                                <!-- Main container -->
                                <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" width=""600"" style=""max-width: 600px; width: 100%;"">

                                    <!-- Header -->
                                    <tr>
                                        <td>
                                            <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" width=""100%"">
                                                <tr>
                                                    <td align=""center"" style=""padding: 25px 30px; background: linear-gradient(135deg, {CardBg} 0%, #16162A 100%); border: 1px solid {CardBorder}; border-radius: 16px 16px 0 0; border-bottom: 3px solid {GoldPrimary};"">
                                                        <table role=""presentation"" cellpadding=""0"" cellspacing=""0"">
                                                            <tr>
                                                                <td style=""font-size: 32px; padding-right: 12px;"">🏰</td>
                                                                <td>
                                                                    <span style=""font-size: 28px; font-weight: 800; color: {GoldPrimary}; letter-spacing: 1px;"">
                                                                        FANTASYREALM
                                                                    </span>
                                                                    <br>
                                                                    <span style=""font-size: 11px; color: {TextMuted}; letter-spacing: 3px; text-transform: uppercase;"">
                                                                        Character Manager
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>

                                    <!-- Content -->
                                    <tr>
                                        <td style=""background: linear-gradient(180deg, {CardBg} 0%, #12121F 100%); border: 1px solid {CardBorder}; border-radius: 0 0 16px 16px; padding: 40px 35px;"">
                                            {content}
                                        </td>
                                    </tr>

                                    <!-- Footer -->
                                    <tr>
                                        <td style=""padding-top: 30px;"">
                                            <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" width=""100%"">
                                                <tr>
                                                    <td align=""center"">
                                                        <!-- Decorative divider -->
                                                        <div style=""width: 60px; height: 2px; background: linear-gradient(90deg, transparent 0%, {GoldPrimary} 50%, transparent 100%); margin: 0 auto 20px auto;""></div>

                                                        <p style=""color: {TextMuted}; font-size: 12px; margin: 0 0 8px 0;"">
                                                            © {DateTime.UtcNow.Year} FantasyRealm par PixelVerse Studios
                                                        </p>
                                                        <p style=""color: #6B7280; font-size: 11px; margin: 0;"">
                                                            Ceci est un message automatique. Merci de ne pas répondre à cet email.
                                                        </p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>

                                </table>

                            </td>
                        </tr>
                    </table>

                </body>
                </html>";
        }
    }
}
