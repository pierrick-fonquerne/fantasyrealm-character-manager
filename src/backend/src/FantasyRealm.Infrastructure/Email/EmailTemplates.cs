using System.Web;

namespace FantasyRealm.Infrastructure.Email
{
    /// <summary>
    /// Provides HTML email templates for various notification types.
    /// </summary>
    public static class EmailTemplates
    {
        private const string BaseUrl = "https://fantasy-realm.com";

        /// <summary>
        /// Generates a welcome email template for new users.
        /// </summary>
        /// <param name="pseudo">The user's display name.</param>
        /// <returns>The HTML email body.</returns>
        public static string GetWelcomeTemplate(string pseudo)
        {
            return WrapInLayout($@"
                <h1>Welcome to FantasyRealm, {Encode(pseudo)}!</h1>
                <p>Thank you for joining our community of adventurers.</p>
                <p>You can now:</p>
                <ul>
                    <li>Create and customize your characters</li>
                    <li>Equip them with weapons, armor, and accessories</li>
                    <li>Share your creations with the community</li>
                    <li>Comment and rate other players' characters</li>
                </ul>
                <p>Start your adventure now!</p>
                <a href=""{BaseUrl}/characters/create"" class=""button"">Create Your First Character</a>
            ");
        }

        /// <summary>
        /// Generates a password reset email template.
        /// </summary>
        /// <param name="pseudo">The user's display name.</param>
        /// <param name="resetToken">The password reset token.</param>
        /// <returns>The HTML email body.</returns>
        public static string GetPasswordResetTemplate(string pseudo, string resetToken)
        {
            var resetUrl = $"{BaseUrl}/reset-password?token={Uri.EscapeDataString(resetToken)}";
            return WrapInLayout($@"
                <h1>Password Reset Request</h1>
                <p>Hello {Encode(pseudo)},</p>
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                <a href=""{resetUrl}"" class=""button"">Reset Password</a>
                <p class=""note"">This link will expire in 24 hours.</p>
                <p class=""note"">If you didn't request this password reset, you can safely ignore this email.</p>
            ");
        }

        /// <summary>
        /// Generates a character approved email template.
        /// </summary>
        /// <param name="pseudo">The user's display name.</param>
        /// <param name="characterName">The approved character's name.</param>
        /// <returns>The HTML email body.</returns>
        public static string GetCharacterApprovedTemplate(string pseudo, string characterName)
        {
            return WrapInLayout($@"
                <h1>Character Approved!</h1>
                <p>Great news, {Encode(pseudo)}!</p>
                <p>Your character <strong>{Encode(characterName)}</strong> has been reviewed and approved by our moderation team.</p>
                <p>Your character is now visible to the entire FantasyRealm community. Other players can view, comment, and rate your creation.</p>
                <a href=""{BaseUrl}/characters"" class=""button"">View Your Characters</a>
            ");
        }

        /// <summary>
        /// Generates a character rejected email template.
        /// </summary>
        /// <param name="pseudo">The user's display name.</param>
        /// <param name="characterName">The rejected character's name.</param>
        /// <param name="reason">The rejection reason.</param>
        /// <returns>The HTML email body.</returns>
        public static string GetCharacterRejectedTemplate(string pseudo, string characterName, string reason)
        {
            return WrapInLayout($@"
                <h1>Character Not Approved</h1>
                <p>Hello {Encode(pseudo)},</p>
                <p>Unfortunately, your character <strong>{Encode(characterName)}</strong> was not approved for public display.</p>
                <p><strong>Reason:</strong> {Encode(reason)}</p>
                <p>You can modify your character and submit it again for review.</p>
                <a href=""{BaseUrl}/characters"" class=""button"">Edit Your Character</a>
            ");
        }

        /// <summary>
        /// Generates a comment approved email template.
        /// </summary>
        /// <param name="pseudo">The user's display name.</param>
        /// <param name="characterName">The character's name that was commented on.</param>
        /// <returns>The HTML email body.</returns>
        public static string GetCommentApprovedTemplate(string pseudo, string characterName)
        {
            return WrapInLayout($@"
                <h1>Comment Published!</h1>
                <p>Hello {Encode(pseudo)},</p>
                <p>Your comment on the character <strong>{Encode(characterName)}</strong> has been approved and is now visible to the community.</p>
                <p>Thank you for contributing to the FantasyRealm community!</p>
                <a href=""{BaseUrl}/gallery"" class=""button"">Browse the Gallery</a>
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
            return WrapInLayout($@"
                <h1>Comment Not Approved</h1>
                <p>Hello {Encode(pseudo)},</p>
                <p>Your comment on the character <strong>{Encode(characterName)}</strong> was not approved for publication.</p>
                <p><strong>Reason:</strong> {Encode(reason)}</p>
                <p>Please review our community guidelines and feel free to submit a new comment.</p>
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
            return WrapInLayout($@"
                <h1>Account Suspended</h1>
                <p>Hello {Encode(pseudo)},</p>
                <p>Your FantasyRealm account has been suspended due to a violation of our terms of service.</p>
                <p><strong>Reason:</strong> {Encode(reason)}</p>
                <p>If you believe this is an error, please contact our support team.</p>
                <p class=""note"">You will not be able to access your account or characters until this matter is resolved.</p>
            ");
        }

        private static string Encode(string value)
        {
            return HttpUtility.HtmlEncode(value);
        }

        private static string WrapInLayout(string content)
        {
            return $@"
<!DOCTYPE html>
<html lang=""en"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>FantasyRealm</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }}
        .container {{
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }}
        .header {{
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #7c3aed;
        }}
        .header img {{
            max-width: 150px;
        }}
        .header h2 {{
            color: #7c3aed;
            margin: 10px 0 0 0;
        }}
        h1 {{
            color: #7c3aed;
            margin-top: 0;
        }}
        .button {{
            display: inline-block;
            background-color: #7c3aed;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
        }}
        .button:hover {{
            background-color: #6d28d9;
        }}
        .note {{
            color: #666;
            font-size: 0.9em;
            font-style: italic;
        }}
        .footer {{
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #888;
            font-size: 0.85em;
        }}
        ul {{
            padding-left: 20px;
        }}
        li {{
            margin: 8px 0;
        }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h2>FantasyRealm</h2>
        </div>
        {content}
        <div class=""footer"">
            <p>&copy; {DateTime.UtcNow.Year} FantasyRealm by PixelVerse Studios. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>";
        }
    }
}
