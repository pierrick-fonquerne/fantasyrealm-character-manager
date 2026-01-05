namespace FantasyRealm.Domain.Entities
{
    /// <summary>
    /// Represents a registered user of the application.
    /// </summary>
    public class User
    {
        public int Id { get; set; }

        public string Pseudo { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public bool IsSuspended { get; set; }

        public bool MustChangePassword { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        public int RoleId { get; set; }

        public Role Role { get; set; } = null!;

        public ICollection<Character> Characters { get; set; } = [];

        public ICollection<Comment> Comments { get; set; } = [];
    }
}
