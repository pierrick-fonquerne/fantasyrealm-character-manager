using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;

namespace FantasyRealm.Application.Services
{
    /// <summary>
    /// Handles contact form submissions.
    /// </summary>
    public sealed class ContactService(
        IUserRepository userRepository,
        IEmailService emailService) : IContactService
    {
        /// <inheritdoc />
        public async Task<Result<Unit>> SendContactMessageAsync(ContactRequest request, CancellationToken cancellationToken = default)
        {
            var pseudoExists = await userRepository.ExistsByPseudoAsync(request.Pseudo, cancellationToken);

            if (!pseudoExists)
            {
                return Result<Unit>.Failure("Aucun compte n'est associé à ce pseudo.", 400);
            }

            await emailService.SendContactNotificationEmailAsync(request.Email, request.Pseudo, request.Message, cancellationToken);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
