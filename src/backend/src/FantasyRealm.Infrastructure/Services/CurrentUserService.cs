using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using FantasyRealm.Application.Interfaces;
using Microsoft.AspNetCore.Http;

namespace FantasyRealm.Infrastructure.Services
{
    /// <summary>
    /// Reads the current user's identity from JWT claims in the HTTP context.
    /// </summary>
    public sealed class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
    {
        /// <inheritdoc />
        public int UserId
        {
            get
            {
                var claim = httpContextAccessor.HttpContext?.User.FindFirst(JwtRegisteredClaimNames.Sub)
                    ?? httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);

                if (claim is null || !int.TryParse(claim.Value, out var userId))
                    throw new UnauthorizedAccessException("User ID claim is missing or invalid.");

                return userId;
            }
        }

        /// <inheritdoc />
        public string Pseudo
        {
            get
            {
                var claim = httpContextAccessor.HttpContext?.User.FindFirst("pseudo");

                if (claim is null || string.IsNullOrWhiteSpace(claim.Value))
                    throw new UnauthorizedAccessException("Pseudo claim is missing or invalid.");

                return claim.Value;
            }
        }
    }
}
