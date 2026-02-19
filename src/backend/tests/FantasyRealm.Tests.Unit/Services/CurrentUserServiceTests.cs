using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using FantasyRealm.Infrastructure.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Moq;

namespace FantasyRealm.Tests.Unit.Services
{
    /// <summary>
    /// Unit tests for <see cref="CurrentUserService"/>.
    /// </summary>
    [Trait("Category", "Unit")]
    [Trait("Category", "CurrentUser")]
    public class CurrentUserServiceTests
    {
        private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock = new();

        private CurrentUserService CreateSut() => new(_httpContextAccessorMock.Object);

        private void SetupClaims(params Claim[] claims)
        {
            var identity = new ClaimsIdentity(claims, "TestAuth");
            var principal = new ClaimsPrincipal(identity);
            var httpContext = new DefaultHttpContext { User = principal };
            _httpContextAccessorMock.Setup(x => x.HttpContext).Returns(httpContext);
        }

        [Fact]
        public void UserId_WithValidSubClaim_ReturnsUserId()
        {
            SetupClaims(new Claim(JwtRegisteredClaimNames.Sub, "42"));

            var sut = CreateSut();

            sut.UserId.Should().Be(42);
        }

        [Fact]
        public void UserId_WithNameIdentifierClaim_ReturnsUserId()
        {
            SetupClaims(new Claim(ClaimTypes.NameIdentifier, "99"));

            var sut = CreateSut();

            sut.UserId.Should().Be(99);
        }

        [Fact]
        public void UserId_WithNoSubClaim_ThrowsUnauthorized()
        {
            SetupClaims(new Claim("pseudo", "admin"));

            var sut = CreateSut();

            var act = () => sut.UserId;
            act.Should().Throw<UnauthorizedAccessException>();
        }

        [Fact]
        public void UserId_WithInvalidSubClaim_ThrowsUnauthorized()
        {
            SetupClaims(new Claim(JwtRegisteredClaimNames.Sub, "not-a-number"));

            var sut = CreateSut();

            var act = () => sut.UserId;
            act.Should().Throw<UnauthorizedAccessException>();
        }

        [Fact]
        public void Pseudo_WithValidClaim_ReturnsPseudo()
        {
            SetupClaims(new Claim("pseudo", "AdminOne"));

            var sut = CreateSut();

            sut.Pseudo.Should().Be("AdminOne");
        }

        [Fact]
        public void Pseudo_WithNoClaim_ThrowsUnauthorized()
        {
            SetupClaims(new Claim(JwtRegisteredClaimNames.Sub, "1"));

            var sut = CreateSut();

            var act = () => sut.Pseudo;
            act.Should().Throw<UnauthorizedAccessException>();
        }

        [Fact]
        public void Pseudo_WithEmptyClaim_ThrowsUnauthorized()
        {
            SetupClaims(new Claim("pseudo", "  "));

            var sut = CreateSut();

            var act = () => sut.Pseudo;
            act.Should().Throw<UnauthorizedAccessException>();
        }
    }
}
