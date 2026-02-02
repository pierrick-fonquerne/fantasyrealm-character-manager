namespace FantasyRealm.Application.Interfaces
{
    /// <summary>
    /// Defines the contract for email sending operations.
    /// </summary>
    public interface IEmailService
    {
        /// <summary>
        /// Sends a welcome email to a newly registered user.
        /// </summary>
        /// <param name="toEmail">The recipient's email address.</param>
        /// <param name="pseudo">The user's display name.</param>
        /// <param name="cancellationToken">A cancellation token.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task SendWelcomeEmailAsync(string toEmail, string pseudo, CancellationToken cancellationToken = default);

        /// <summary>
        /// Sends a password reset email with a reset link.
        /// </summary>
        /// <param name="toEmail">The recipient's email address.</param>
        /// <param name="pseudo">The user's display name.</param>
        /// <param name="resetToken">The password reset token.</param>
        /// <param name="cancellationToken">A cancellation token.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task SendPasswordResetEmailAsync(string toEmail, string pseudo, string resetToken, CancellationToken cancellationToken = default);

        /// <summary>
        /// Sends an email containing a temporary password.
        /// </summary>
        /// <param name="toEmail">The recipient's email address.</param>
        /// <param name="pseudo">The user's display name.</param>
        /// <param name="temporaryPassword">The generated temporary password.</param>
        /// <param name="cancellationToken">A cancellation token.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task SendTemporaryPasswordEmailAsync(string toEmail, string pseudo, string temporaryPassword, CancellationToken cancellationToken = default);

        /// <summary>
        /// Sends a notification when a character has been approved by an employee.
        /// </summary>
        /// <param name="toEmail">The recipient's email address.</param>
        /// <param name="pseudo">The user's display name.</param>
        /// <param name="characterName">The name of the approved character.</param>
        /// <param name="cancellationToken">A cancellation token.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task SendCharacterApprovedEmailAsync(string toEmail, string pseudo, string characterName, CancellationToken cancellationToken = default);

        /// <summary>
        /// Sends a notification when a character has been rejected by an employee.
        /// </summary>
        /// <param name="toEmail">The recipient's email address.</param>
        /// <param name="pseudo">The user's display name.</param>
        /// <param name="characterName">The name of the rejected character.</param>
        /// <param name="reason">The reason for rejection.</param>
        /// <param name="cancellationToken">A cancellation token.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task SendCharacterRejectedEmailAsync(string toEmail, string pseudo, string characterName, string reason, CancellationToken cancellationToken = default);

        /// <summary>
        /// Sends a notification when a comment has been approved.
        /// </summary>
        /// <param name="toEmail">The recipient's email address.</param>
        /// <param name="pseudo">The user's display name.</param>
        /// <param name="characterName">The name of the character that was commented on.</param>
        /// <param name="cancellationToken">A cancellation token.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task SendCommentApprovedEmailAsync(string toEmail, string pseudo, string characterName, CancellationToken cancellationToken = default);

        /// <summary>
        /// Sends a notification when a comment has been rejected.
        /// </summary>
        /// <param name="toEmail">The recipient's email address.</param>
        /// <param name="pseudo">The user's display name.</param>
        /// <param name="characterName">The name of the character that was commented on.</param>
        /// <param name="reason">The reason for rejection.</param>
        /// <param name="cancellationToken">A cancellation token.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task SendCommentRejectedEmailAsync(string toEmail, string pseudo, string characterName, string reason, CancellationToken cancellationToken = default);

        /// <summary>
        /// Sends a notification when the user's account has been suspended.
        /// </summary>
        /// <param name="toEmail">The recipient's email address.</param>
        /// <param name="pseudo">The user's display name.</param>
        /// <param name="reason">The reason for suspension.</param>
        /// <param name="cancellationToken">A cancellation token.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task SendAccountSuspendedEmailAsync(string toEmail, string pseudo, string reason, CancellationToken cancellationToken = default);

        /// <summary>
        /// Sends a contact form notification email to the site administrator.
        /// </summary>
        /// <param name="fromEmail">The sender's email address.</param>
        /// <param name="pseudo">The sender's display name.</param>
        /// <param name="message">The contact message content.</param>
        /// <param name="cancellationToken">A cancellation token.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task SendContactNotificationEmailAsync(string fromEmail, string pseudo, string message, CancellationToken cancellationToken = default);
    }
}
