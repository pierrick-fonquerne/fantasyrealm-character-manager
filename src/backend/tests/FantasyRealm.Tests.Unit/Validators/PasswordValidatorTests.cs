using FantasyRealm.Application.Validators;
using FluentAssertions;

namespace FantasyRealm.Tests.Unit.Validators
{
    public class PasswordValidatorTests
    {
        [Fact]
        public void Given_ValidPassword_When_Validate_Should_ReturnSuccess()
        {
            // Arrange
            var password = "MySecure@Pass123";

            // Act
            var result = PasswordValidator.Validate(password);

            // Assert
            result.IsValid.Should().BeTrue();
            result.Errors.Should().BeEmpty();
            result.Score.Should().BeGreaterThanOrEqualTo(4);
        }

        [Fact]
        public void Given_EmptyPassword_When_Validate_Should_ReturnError()
        {
            // Arrange
            var password = string.Empty;

            // Act
            var result = PasswordValidator.Validate(password);

            // Assert
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain("Le mot de passe est requis.");
        }

        [Fact]
        public void Given_NullPassword_When_Validate_Should_ReturnError()
        {
            // Arrange
            string? password = null;

            // Act
            var result = PasswordValidator.Validate(password!);

            // Assert
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain("Le mot de passe est requis.");
        }

        [Fact]
        public void Given_PasswordLessThan12Chars_When_Validate_Should_ReturnLengthError()
        {
            // Arrange
            var password = "Short@1Ab";

            // Act
            var result = PasswordValidator.Validate(password);

            // Assert
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain("Le mot de passe doit contenir au moins 12 caractères.");
        }

        [Fact]
        public void Given_PasswordWithoutUppercase_When_Validate_Should_ReturnUppercaseError()
        {
            // Arrange
            var password = "mysecure@pass123";

            // Act
            var result = PasswordValidator.Validate(password);

            // Assert
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain("Le mot de passe doit contenir au moins une majuscule.");
        }

        [Fact]
        public void Given_PasswordWithoutLowercase_When_Validate_Should_ReturnLowercaseError()
        {
            // Arrange
            var password = "MYSECURE@PASS123";

            // Act
            var result = PasswordValidator.Validate(password);

            // Assert
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain("Le mot de passe doit contenir au moins une minuscule.");
        }

        [Fact]
        public void Given_PasswordWithoutDigit_When_Validate_Should_ReturnDigitError()
        {
            // Arrange
            var password = "MySecure@Password";

            // Act
            var result = PasswordValidator.Validate(password);

            // Assert
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain("Le mot de passe doit contenir au moins un chiffre.");
        }

        [Fact]
        public void Given_PasswordWithoutSpecialChar_When_Validate_Should_ReturnSpecialCharError()
        {
            // Arrange
            var password = "MySecurePass1234";

            // Act
            var result = PasswordValidator.Validate(password);

            // Assert
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain("Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*()_+-=[]{}|;:',.<>?/).");
        }

        [Theory]
        [InlineData("ValidPass@123!", true)]
        [InlineData("Another$ecure1", true)]
        [InlineData("Test_Password1!", true)]
        [InlineData("short@1A", false)]
        [InlineData("nouppercase@123", false)]
        [InlineData("NOLOWERCASE@123", false)]
        [InlineData("NoDigits@Here!", false)]
        [InlineData("NoSpecialChar123", false)]
        public void Given_VariousPasswords_When_Validate_Should_ReturnExpectedResult(string password, bool expectedValid)
        {
            // Arrange & Act
            var result = PasswordValidator.Validate(password);

            // Assert
            result.IsValid.Should().Be(expectedValid);
        }

        [Fact]
        public void Given_PasswordWith16PlusChars_When_Validate_Should_HaveHigherScore()
        {
            // Arrange
            var shortPassword = "MySecure@Pass1";
            var longPassword = "MyVeryLongAndSecure@Password123";

            // Act
            var shortResult = PasswordValidator.Validate(shortPassword);
            var longResult = PasswordValidator.Validate(longPassword);

            // Assert
            longResult.Score.Should().BeGreaterThan(shortResult.Score);
        }

        [Fact]
        public void Given_Score1_When_GetStrength_Should_ReturnFaible()
        {
            // Arrange
            var result = new PasswordValidationResult(false, 1, []);

            // Act
            var strength = result.Strength;

            // Assert
            strength.Should().Be("Faible");
        }

        [Fact]
        public void Given_Score2_When_GetStrength_Should_ReturnMoyen()
        {
            // Arrange
            var result = new PasswordValidationResult(false, 2, []);

            // Act
            var strength = result.Strength;

            // Assert
            strength.Should().Be("Moyen");
        }

        [Fact]
        public void Given_Score3_When_GetStrength_Should_ReturnFort()
        {
            // Arrange
            var result = new PasswordValidationResult(true, 3, []);

            // Act
            var strength = result.Strength;

            // Assert
            strength.Should().Be("Fort");
        }

        [Fact]
        public void Given_Score5_When_GetStrength_Should_ReturnTresFort()
        {
            // Arrange
            var result = new PasswordValidationResult(true, 5, []);

            // Act
            var strength = result.Strength;

            // Assert
            strength.Should().Be("Très fort");
        }
    }
}
