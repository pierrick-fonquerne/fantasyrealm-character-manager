using System.Security.Cryptography;
using System.Text;
using FantasyRealm.Application.Interfaces;
using Konscious.Security.Cryptography;

namespace FantasyRealm.Infrastructure.Security
{
    /// <summary>
    /// Argon2id password hasher implementation following OWASP recommendations.
    /// </summary>
    public sealed class Argon2PasswordHasher : IPasswordHasher
    {
        private const int SaltSize = 16;
        private const int HashSize = 32;
        private const int MemorySize = 65536;
        private const int Iterations = 3;
        private const int DegreeOfParallelism = 4;

        /// <inheritdoc />
        public string Hash(string password)
        {
            var salt = RandomNumberGenerator.GetBytes(SaltSize);
            var hash = HashPassword(password, salt);

            var result = new byte[SaltSize + HashSize];
            Buffer.BlockCopy(salt, 0, result, 0, SaltSize);
            Buffer.BlockCopy(hash, 0, result, SaltSize, HashSize);

            return Convert.ToBase64String(result);
        }

        /// <inheritdoc />
        public bool Verify(string password, string hash)
        {
            try
            {
                var hashBytes = Convert.FromBase64String(hash);

                if (hashBytes.Length != SaltSize + HashSize)
                {
                    return false;
                }

                var salt = new byte[SaltSize];
                var storedHash = new byte[HashSize];

                Buffer.BlockCopy(hashBytes, 0, salt, 0, SaltSize);
                Buffer.BlockCopy(hashBytes, SaltSize, storedHash, 0, HashSize);

                var computedHash = HashPassword(password, salt);

                return CryptographicOperations.FixedTimeEquals(computedHash, storedHash);
            }
            catch
            {
                return false;
            }
        }

        private static byte[] HashPassword(string password, byte[] salt)
        {
            using var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password))
            {
                Salt = salt,
                MemorySize = MemorySize,
                Iterations = Iterations,
                DegreeOfParallelism = DegreeOfParallelism
            };

            return argon2.GetBytes(HashSize);
        }
    }
}
