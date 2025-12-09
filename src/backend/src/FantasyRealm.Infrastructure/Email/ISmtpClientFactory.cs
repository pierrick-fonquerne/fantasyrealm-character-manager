using MailKit.Net.Smtp;

namespace FantasyRealm.Infrastructure.Email
{
    /// <summary>
    /// Factory interface for creating SMTP client instances.
    /// Enables dependency injection and unit testing.
    /// </summary>
    public interface ISmtpClientFactory
    {
        /// <summary>
        /// Creates a new SMTP client instance.
        /// </summary>
        /// <returns>A new <see cref="ISmtpClient"/> instance.</returns>
        ISmtpClient Create();
    }
}
