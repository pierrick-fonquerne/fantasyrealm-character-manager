using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;

namespace FantasyRealm.Application.Interfaces
{
    /// <summary>
    /// Defines the contract for contact form operations.
    /// </summary>
    public interface IContactService
    {
        /// <summary>
        /// Processes a contact form submission and sends a notification email.
        /// </summary>
        /// <param name="request">The contact request containing email, pseudo and message.</param>
        /// <param name="cancellationToken">A cancellation token.</param>
        /// <returns>A result indicating success or an error.</returns>
        Task<Result<Unit>> SendContactMessageAsync(ContactRequest request, CancellationToken cancellationToken = default);
    }
}
