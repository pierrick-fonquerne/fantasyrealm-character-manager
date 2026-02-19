using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FantasyRealm.Application.Interfaces;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace FantasyRealm.Infrastructure.Security
{
    /// <summary>
    /// Service implementation for JWT token generation.
    /// </summary>
    public sealed class JwtService : IJwtService
    {
        private readonly JwtSettings _settings;

        public JwtService(IOptions<JwtSettings> settings)
        {
            _settings = settings.Value;
        }

        /// <inheritdoc />
        public string GenerateToken(int userId, string email, string pseudo, string role)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Secret));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, email),
                new Claim("pseudo", pseudo),
                new Claim(ClaimTypes.Role, role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _settings.Issuer,
                audience: _settings.Audience,
                claims: claims,
                expires: GetExpirationDate(),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        /// <inheritdoc />
        public DateTime GetExpirationDate()
        {
            return DateTime.UtcNow.AddHours(_settings.ExpirationHours);
        }
    }
}
