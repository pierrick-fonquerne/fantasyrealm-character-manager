using FantasyRealm.Infrastructure.Security;
using FluentAssertions;

namespace FantasyRealm.Tests.Unit.Security
{
    public class Argon2PasswordHasherTests
    {
        private readonly Argon2PasswordHasher _hasher = new();

        [Fact]
        public void Given_Password_When_Hash_Should_ReturnNonEmptyString()
        {
            // Arrange
            var password = "TestPassword123!";

            // Act
            var hash = _hasher.Hash(password);

            // Assert
            hash.Should().NotBeNullOrEmpty();
        }

        [Fact]
        public void Given_SamePassword_When_HashTwice_Should_ReturnDifferentHashes()
        {
            // Arrange
            var password = "TestPassword123!";

            // Act
            var hash1 = _hasher.Hash(password);
            var hash2 = _hasher.Hash(password);

            // Assert
            hash1.Should().NotBe(hash2);
        }

        [Fact]
        public void Given_CorrectPassword_When_Verify_Should_ReturnTrue()
        {
            // Arrange
            var password = "TestPassword123!";
            var hash = _hasher.Hash(password);

            // Act
            var result = _hasher.Verify(password, hash);

            // Assert
            result.Should().BeTrue();
        }

        [Fact]
        public void Given_IncorrectPassword_When_Verify_Should_ReturnFalse()
        {
            // Arrange
            var correctPassword = "CorrectPassword123!";
            var wrongPassword = "WrongPassword123!";
            var hash = _hasher.Hash(correctPassword);

            // Act
            var result = _hasher.Verify(wrongPassword, hash);

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public void Given_InvalidHash_When_Verify_Should_ReturnFalse()
        {
            // Arrange
            var password = "TestPassword";
            var invalidHash = "invalid-hash";

            // Act
            var result = _hasher.Verify(password, invalidHash);

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public void Given_EmptyHash_When_Verify_Should_ReturnFalse()
        {
            // Arrange
            var password = "TestPassword";
            var emptyHash = string.Empty;

            // Act
            var result = _hasher.Verify(password, emptyHash);

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public void Given_TruncatedHash_When_Verify_Should_ReturnFalse()
        {
            // Arrange
            var password = "TestPassword123!";
            var hash = _hasher.Hash(password);
            var truncatedHash = hash[..10];

            // Act
            var result = _hasher.Verify(password, truncatedHash);

            // Assert
            result.Should().BeFalse();
        }

        [Theory]
        [InlineData("simple")]
        [InlineData("Complex@Password123!")]
        [InlineData("Ü니코드Password日本語")]
        [InlineData("   spaces   ")]
        public void Given_VariousPasswords_When_HashAndVerify_Should_ReturnTrue(string password)
        {
            // Arrange
            var hash = _hasher.Hash(password);

            // Act
            var result = _hasher.Verify(password, hash);

            // Assert
            result.Should().BeTrue();
        }
    }
}
