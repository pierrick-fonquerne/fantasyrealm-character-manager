namespace FantasyRealm.Domain.Entities
{
    /// <summary>
    /// Represents a user role for authorization (user, employee, admin).
    /// </summary>
    public class Role
    {
        public int Id { get; set; }

        public string Label { get; set; } = string.Empty;

        public ICollection<User> Users { get; set; } = [];
    }
}
