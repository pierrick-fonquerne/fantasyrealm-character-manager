using FantasyRealm.Domain.Exceptions;

namespace FantasyRealm.Domain.Entities
{
    /// <summary>
    /// Represents a registered user of the application.
    /// </summary>
    public class User
    {
        public int Id { get; set; }

        public string Pseudo { get; internal set; } = string.Empty;

        public string Email { get; internal set; } = string.Empty;

        public string PasswordHash { get; internal set; } = string.Empty;

        public bool IsSuspended { get; internal set; }

        public bool MustChangePassword { get; internal set; }

        public DateTime CreatedAt { get; internal set; }

        public DateTime UpdatedAt { get; internal set; }

        public int RoleId { get; internal set; }

        public Role Role { get; internal set; } = null!;

        public ICollection<Character> Characters { get; set; } = [];

        public ICollection<Comment> Comments { get; set; } = [];

        /// <summary>
        /// Creates a new user account with the "User" role.
        /// </summary>
        /// <param name="email">The normalized email address.</param>
        /// <param name="pseudo">The display name.</param>
        /// <param name="passwordHash">The hashed password.</param>
        /// <param name="role">The user role entity.</param>
        public static User CreateUser(string email, string pseudo, string passwordHash, Role role)
        {
            return new User
            {
                Email = email,
                Pseudo = pseudo,
                PasswordHash = passwordHash,
                RoleId = role.Id,
                Role = role,
                IsSuspended = false,
                MustChangePassword = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }

        /// <summary>
        /// Creates a new employee account.
        /// </summary>
        /// <param name="email">The normalized email address.</param>
        /// <param name="pseudo">The display name derived from email.</param>
        /// <param name="passwordHash">The hashed password.</param>
        /// <param name="role">The employee role entity.</param>
        public static User CreateEmployee(string email, string pseudo, string passwordHash, Role role)
        {
            return new User
            {
                Email = email,
                Pseudo = pseudo,
                PasswordHash = passwordHash,
                RoleId = role.Id,
                Role = role,
                IsSuspended = false,
                MustChangePassword = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }

        /// <summary>
        /// Suspends the user account.
        /// </summary>
        /// <exception cref="DomainException">Thrown when the account is already suspended.</exception>
        public void Suspend()
        {
            if (IsSuspended)
                throw new DomainException("Ce compte est déjà suspendu.");

            IsSuspended = true;
            UpdatedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Reactivates a suspended user account.
        /// </summary>
        /// <exception cref="DomainException">Thrown when the account is not suspended.</exception>
        public void Reactivate()
        {
            if (!IsSuspended)
                throw new DomainException("Ce compte n'est pas suspendu.");

            IsSuspended = false;
            UpdatedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Sets a temporary password and marks the account for mandatory password change.
        /// </summary>
        /// <param name="passwordHash">The hashed temporary password.</param>
        public void SetTemporaryPassword(string passwordHash)
        {
            PasswordHash = passwordHash;
            MustChangePassword = true;
            UpdatedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Changes the password and clears the mandatory password change flag.
        /// </summary>
        /// <param name="passwordHash">The hashed new password.</param>
        public void ChangePassword(string passwordHash)
        {
            PasswordHash = passwordHash;
            MustChangePassword = false;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
