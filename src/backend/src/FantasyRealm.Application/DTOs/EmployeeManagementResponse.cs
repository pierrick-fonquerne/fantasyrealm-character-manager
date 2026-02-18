namespace FantasyRealm.Application.DTOs
{
    /// <summary>
    /// Represents an employee in the admin employee management list.
    /// </summary>
    public sealed record EmployeeManagementResponse(
        int Id,
        string Pseudo,
        string Email,
        bool IsSuspended,
        DateTime CreatedAt);
}
