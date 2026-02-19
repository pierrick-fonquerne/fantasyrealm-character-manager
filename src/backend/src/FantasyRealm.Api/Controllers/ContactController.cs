using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FantasyRealm.Api.Controllers
{
    /// <summary>
    /// Controller for contact form submissions.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public sealed class ContactController(IContactService contactService) : ControllerBase
    {
        /// <summary>
        /// Sends a contact message to the site administrator.
        /// </summary>
        /// <param name="request">The contact form data.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A success message or an error.</returns>
        /// <response code="200">Message sent successfully.</response>
        /// <response code="400">Invalid request data or unknown pseudo.</response>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> SendMessage([FromBody] ContactRequest request, CancellationToken cancellationToken)
        {
            var result = await contactService.SendContactMessageAsync(request, cancellationToken);

            if (result.IsFailure)
            {
                return StatusCode(result.ErrorCode ?? 400, new { message = result.Error });
            }

            return Ok(new { message = "Votre message a bien été envoyé." });
        }
    }
}
