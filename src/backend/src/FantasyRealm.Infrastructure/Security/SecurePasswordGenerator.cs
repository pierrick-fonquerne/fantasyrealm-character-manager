using System.Security.Cryptography;
using FantasyRealm.Application.Interfaces;

namespace FantasyRealm.Infrastructure.Security
{
    /// <summary>
    /// Generates cryptographically secure passwords meeting CNIL requirements.
    /// </summary>
    public sealed class SecurePasswordGenerator : IPasswordGenerator
    {
        private const string UppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        private const string LowercaseChars = "abcdefghijklmnopqrstuvwxyz";
        private const string DigitChars = "0123456789";
        private const string SpecialChars = "@#$%^&*!?-_+=";
        private const string AllChars = UppercaseChars + LowercaseChars + DigitChars + SpecialChars;
        private const int MinimumLength = 12;

        /// <inheritdoc />
        public string GenerateSecurePassword(int length = 16)
        {
            if (length < MinimumLength)
            {
                length = MinimumLength;
            }

            var password = new char[length];
            var remainingPositions = Enumerable.Range(0, length).ToList();

            password[TakeRandomPosition(remainingPositions)] = GetRandomChar(UppercaseChars);
            password[TakeRandomPosition(remainingPositions)] = GetRandomChar(LowercaseChars);
            password[TakeRandomPosition(remainingPositions)] = GetRandomChar(DigitChars);
            password[TakeRandomPosition(remainingPositions)] = GetRandomChar(SpecialChars);

            foreach (var position in remainingPositions)
            {
                password[position] = GetRandomChar(AllChars);
            }

            return new string(password);
        }

        private static char GetRandomChar(string characterSet)
        {
            return characterSet[RandomNumberGenerator.GetInt32(characterSet.Length)];
        }

        private static int TakeRandomPosition(List<int> positions)
        {
            var index = RandomNumberGenerator.GetInt32(positions.Count);
            var position = positions[index];
            positions.RemoveAt(index);
            return position;
        }
    }
}
