using FantasyRealm.Application.DTOs;
using FantasyRealm.Domain.Entities;

namespace FantasyRealm.Application.Mapping
{
    /// <summary>
    /// Provides centralized mapping between <see cref="User"/> entities and DTOs.
    /// </summary>
    public static class UserMapper
    {
        /// <summary>
        /// Maps a <see cref="User"/> entity to a <see cref="UserManagementResponse"/> DTO.
        /// </summary>
        /// <param name="user">The user entity. Must include the <see cref="User.Characters"/> navigation property.</param>
        /// <returns>A fully populated <see cref="UserManagementResponse"/>.</returns>
        public static UserManagementResponse ToManagementResponse(User user)
        {
            return new UserManagementResponse(
                user.Id,
                user.Pseudo,
                user.Email,
                user.IsSuspended,
                user.CreatedAt,
                user.Characters.Count);
        }

        /// <summary>
        /// Maps a <see cref="User"/> entity to an <see cref="EmployeeManagementResponse"/> DTO.
        /// </summary>
        /// <param name="user">The user entity with the Employee role.</param>
        /// <returns>A fully populated <see cref="EmployeeManagementResponse"/>.</returns>
        public static EmployeeManagementResponse ToEmployeeResponse(User user)
        {
            return new EmployeeManagementResponse(
                user.Id,
                user.Pseudo,
                user.Email,
                user.IsSuspended,
                user.CreatedAt);
        }
    }
}
