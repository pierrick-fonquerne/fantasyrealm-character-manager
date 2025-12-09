using MailKit.Net.Smtp;

namespace FantasyRealm.Infrastructure.Email
{
    /// <summary>
    /// Default factory implementation that creates real SMTP client instances.
    /// </summary>
    public class SmtpClientFactory : ISmtpClientFactory
    {
        /// <inheritdoc />
        public ISmtpClient Create()
        {
            return new SmtpClient();
        }
    }
}
