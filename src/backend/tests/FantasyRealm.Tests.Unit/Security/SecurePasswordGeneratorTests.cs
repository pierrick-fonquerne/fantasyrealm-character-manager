using FantasyRealm.Infrastructure.Security;
using FluentAssertions;

namespace FantasyRealm.Tests.Unit.Security
{
    public class SecurePasswordGeneratorTests
    {
        private readonly SecurePasswordGenerator _generator;

        public SecurePasswordGeneratorTests()
        {
            _generator = new SecurePasswordGenerator();
        }

        [Fact]
        public void Given_DefaultLength_When_GeneratePassword_Should_Return16Characters()
        {
            // Act
            var password = _generator.GenerateSecurePassword();

            // Assert
            password.Length.Should().Be(16);
        }

        [Fact]
        public void Given_CustomLength_When_GeneratePassword_Should_ReturnRequestedLength()
        {
            // Act
            var password = _generator.GenerateSecurePassword(20);

            // Assert
            password.Length.Should().Be(20);
        }

        [Fact]
        public void Given_LengthBelowMinimum_When_GeneratePassword_Should_ReturnMinimumLength()
        {
            // Act
            var password = _generator.GenerateSecurePassword(5);

            // Assert
            password.Length.Should().Be(12);
        }

        [Fact]
        public void When_GeneratePassword_Should_ContainUppercaseLetter()
        {
            // Act
            var password = _generator.GenerateSecurePassword();

            // Assert
            password.Should().MatchRegex("[A-Z]");
        }

        [Fact]
        public void When_GeneratePassword_Should_ContainLowercaseLetter()
        {
            // Act
            var password = _generator.GenerateSecurePassword();

            // Assert
            password.Should().MatchRegex("[a-z]");
        }

        [Fact]
        public void When_GeneratePassword_Should_ContainDigit()
        {
            // Act
            var password = _generator.GenerateSecurePassword();

            // Assert
            password.Should().MatchRegex("[0-9]");
        }

        [Fact]
        public void When_GeneratePassword_Should_ContainSpecialCharacter()
        {
            // Act
            var password = _generator.GenerateSecurePassword();

            // Assert
            password.Should().MatchRegex("[@#$%^&*!?\\-_+=]");
        }

        [Fact]
        public void When_GenerateMultiplePasswords_Should_BeUnique()
        {
            // Act
            var passwords = Enumerable.Range(0, 100)
                .Select(_ => _generator.GenerateSecurePassword())
                .ToList();

            // Assert
            passwords.Distinct().Count().Should().Be(100);
        }

        [Theory]
        [InlineData(12)]
        [InlineData(16)]
        [InlineData(24)]
        [InlineData(32)]
        public void Given_VariousLengths_When_GeneratePassword_Should_MeetCNILRequirements(int length)
        {
            // Act
            var password = _generator.GenerateSecurePassword(length);

            // Assert
            password.Should().MatchRegex("[A-Z]", "password should contain uppercase letter");
            password.Should().MatchRegex("[a-z]", "password should contain lowercase letter");
            password.Should().MatchRegex("[0-9]", "password should contain digit");
            password.Should().MatchRegex("[@#$%^&*!?\\-_+=]", "password should contain special character");
            password.Length.Should().BeGreaterThanOrEqualTo(12, "password should be at least 12 characters");
        }
    }
}
