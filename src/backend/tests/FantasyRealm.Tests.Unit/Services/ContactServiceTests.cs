using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using FantasyRealm.Application.Services;
using FluentAssertions;
using Moq;

namespace FantasyRealm.Tests.Unit.Services
{
    public class ContactServiceTests
    {
        private readonly Mock<IUserRepository> _userRepositoryMock;
        private readonly Mock<IEmailService> _emailServiceMock;
        private readonly ContactService _contactService;

        public ContactServiceTests()
        {
            _userRepositoryMock = new Mock<IUserRepository>();
            _emailServiceMock = new Mock<IEmailService>();
            _contactService = new ContactService(_userRepositoryMock.Object, _emailServiceMock.Object);
        }

        [Fact]
        public async Task Given_ValidRequest_When_SendContactMessage_Should_ReturnSuccess()
        {
            // Arrange
            var request = new ContactRequest(
                "user@example.com",
                "HeroPlayer",
                "Bonjour, je souhaite en savoir plus sur le jeu FantasyRealm.");

            _userRepositoryMock.Setup(r => r.ExistsByPseudoAsync("HeroPlayer", It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);
            _emailServiceMock.Setup(e => e.SendContactNotificationEmailAsync(
                    It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _contactService.SendContactMessageAsync(request);

            // Assert
            result.IsSuccess.Should().BeTrue();
        }

        [Fact]
        public async Task Given_UnknownPseudo_When_SendContactMessage_Should_ReturnFailure()
        {
            // Arrange
            var request = new ContactRequest(
                "user@example.com",
                "UnknownPlayer",
                "Bonjour, je souhaite en savoir plus sur le jeu FantasyRealm.");

            _userRepositoryMock.Setup(r => r.ExistsByPseudoAsync("UnknownPlayer", It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            // Act
            var result = await _contactService.SendContactMessageAsync(request);

            // Assert
            result.IsFailure.Should().BeTrue();
            result.Error.Should().Be("Aucun compte n'est associé à ce pseudo.");
            result.ErrorCode.Should().Be(400);
        }

        [Fact]
        public async Task Given_ValidRequest_When_SendContactMessage_Should_CallEmailServiceWithCorrectParameters()
        {
            // Arrange
            var request = new ContactRequest(
                "user@example.com",
                "HeroPlayer",
                "Bonjour, je souhaite en savoir plus sur le jeu FantasyRealm.");

            _userRepositoryMock.Setup(r => r.ExistsByPseudoAsync("HeroPlayer", It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);
            _emailServiceMock.Setup(e => e.SendContactNotificationEmailAsync(
                    It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);

            // Act
            await _contactService.SendContactMessageAsync(request);

            // Assert
            _emailServiceMock.Verify(
                e => e.SendContactNotificationEmailAsync(
                    "user@example.com",
                    "HeroPlayer",
                    "Bonjour, je souhaite en savoir plus sur le jeu FantasyRealm.",
                    It.IsAny<CancellationToken>()),
                Times.Once);
        }

        [Fact]
        public async Task Given_UnknownPseudo_When_SendContactMessage_Should_NotCallEmailService()
        {
            // Arrange
            var request = new ContactRequest(
                "user@example.com",
                "UnknownPlayer",
                "Bonjour, je souhaite en savoir plus sur le jeu FantasyRealm.");

            _userRepositoryMock.Setup(r => r.ExistsByPseudoAsync("UnknownPlayer", It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            // Act
            await _contactService.SendContactMessageAsync(request);

            // Assert
            _emailServiceMock.Verify(
                e => e.SendContactNotificationEmailAsync(
                    It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()),
                Times.Never);
        }

        [Fact]
        public async Task Given_EmailServiceThrows_When_SendContactMessage_Should_PropagateException()
        {
            // Arrange
            var request = new ContactRequest(
                "user@example.com",
                "HeroPlayer",
                "Bonjour, je souhaite en savoir plus sur le jeu FantasyRealm.");

            _userRepositoryMock.Setup(r => r.ExistsByPseudoAsync("HeroPlayer", It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);
            _emailServiceMock.Setup(e => e.SendContactNotificationEmailAsync(
                    It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new HttpRequestException("Brevo API error"));

            // Act
            var act = () => _contactService.SendContactMessageAsync(request);

            // Assert
            await act.Should().ThrowAsync<HttpRequestException>()
                .WithMessage("Brevo API error");
        }
    }
}
