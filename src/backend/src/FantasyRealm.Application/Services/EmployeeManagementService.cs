using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using FantasyRealm.Application.Mapping;
using FantasyRealm.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace FantasyRealm.Application.Services
{
    /// <summary>
    /// Handles employee management operations performed by administrators.
    /// </summary>
    public sealed class EmployeeManagementService(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IEmailService emailService,
        ILogger<EmployeeManagementService> logger) : IEmployeeManagementService
    {
        private const string EmployeeRoleLabel = "Employee";

        /// <inheritdoc />
        public async Task<Result<PagedResponse<EmployeeManagementResponse>>> GetEmployeesAsync(
            int page,
            int pageSize,
            string? search,
            bool? isSuspended,
            CancellationToken cancellationToken)
        {
            if (page < 1)
                return Result<PagedResponse<EmployeeManagementResponse>>.Failure("Le numéro de page doit être supérieur à 0.");

            if (page > 1000)
                return Result<PagedResponse<EmployeeManagementResponse>>.Failure("Le numéro de page ne peut pas dépasser 1000.");

            pageSize = Math.Clamp(pageSize, 1, 50);

            var (items, totalCount) = await userRepository.GetEmployeesAsync(page, pageSize, search, isSuspended, cancellationToken);

            var responses = items.Select(UserMapper.ToEmployeeResponse).ToList();
            var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

            return Result<PagedResponse<EmployeeManagementResponse>>.Success(
                new PagedResponse<EmployeeManagementResponse>(responses, page, pageSize, totalCount, totalPages));
        }

        /// <inheritdoc />
        public async Task<Result<int>> CountEmployeesAsync(CancellationToken cancellationToken)
        {
            var count = await userRepository.CountByRoleAsync(EmployeeRoleLabel, cancellationToken);
            return Result<int>.Success(count);
        }

        /// <inheritdoc />
        public async Task<Result<EmployeeManagementResponse>> CreateAsync(
            CreateEmployeeRequest request,
            int adminId,
            CancellationToken cancellationToken)
        {
            var normalizedEmail = request.Email.ToLowerInvariant().Trim();
            var derivedPseudo = normalizedEmail.Split('@')[0];

            if (await userRepository.ExistsByEmailAsync(normalizedEmail, cancellationToken))
                return Result<EmployeeManagementResponse>.Failure("Cette adresse email est déjà utilisée.", 409);

            if (await userRepository.ExistsByPseudoAsync(derivedPseudo, cancellationToken))
                return Result<EmployeeManagementResponse>.Failure("Le pseudo dérivé de cet email est déjà utilisé. Veuillez utiliser une adresse email différente.", 409);

            var role = await userRepository.GetRoleByLabelAsync(EmployeeRoleLabel, cancellationToken);
            if (role is null)
                return Result<EmployeeManagementResponse>.Failure("Le rôle Employee est introuvable.", 500);

            var hashedPassword = passwordHasher.Hash(request.Password);

            var employee = new User
            {
                Email = normalizedEmail,
                Pseudo = derivedPseudo,
                PasswordHash = hashedPassword,
                MustChangePassword = false,
                IsSuspended = false,
                RoleId = role.Id,
                Role = role,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var created = await userRepository.CreateAsync(employee, cancellationToken);

            logger.LogInformation("Employee {EmployeeId} created by admin {AdminId}", created.Id, adminId);

            return Result<EmployeeManagementResponse>.Success(UserMapper.ToEmployeeResponse(created));
        }

        /// <inheritdoc />
        public async Task<Result<EmployeeManagementResponse>> SuspendAsync(
            int employeeId,
            string reason,
            int adminId,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(reason))
                return Result<EmployeeManagementResponse>.Failure("Le motif de suspension est obligatoire.", 400);

            if (reason.Trim().Length < 10)
                return Result<EmployeeManagementResponse>.Failure("Le motif de suspension doit contenir au moins 10 caractères.", 400);

            if (reason.Trim().Length > 500)
                return Result<EmployeeManagementResponse>.Failure("Le motif de suspension ne peut pas dépasser 500 caractères.", 400);

            var employee = await userRepository.GetByIdWithRoleAsync(employeeId, cancellationToken);

            if (employee is null)
                return Result<EmployeeManagementResponse>.Failure("Employé introuvable.", 404);

            if (employee.Role.Label != EmployeeRoleLabel)
                return Result<EmployeeManagementResponse>.Failure("Seuls les comptes employés peuvent être suspendus depuis cet espace.", 403);

            if (employee.IsSuspended)
                return Result<EmployeeManagementResponse>.Failure("Ce compte est déjà suspendu.", 400);

            employee.IsSuspended = true;
            var updated = await userRepository.UpdateAsync(employee, cancellationToken);

            logger.LogInformation("Employee {EmployeeId} suspended by admin {AdminId}", employeeId, adminId);

            try
            {
                await emailService.SendAccountSuspendedEmailAsync(
                    updated.Email, updated.Pseudo, reason.Trim(), cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to send suspension email for employee {EmployeeId}", employeeId);
            }

            return Result<EmployeeManagementResponse>.Success(UserMapper.ToEmployeeResponse(updated));
        }

        /// <inheritdoc />
        public async Task<Result<EmployeeManagementResponse>> ReactivateAsync(
            int employeeId,
            int adminId,
            CancellationToken cancellationToken)
        {
            var employee = await userRepository.GetByIdWithRoleAsync(employeeId, cancellationToken);

            if (employee is null)
                return Result<EmployeeManagementResponse>.Failure("Employé introuvable.", 404);

            if (employee.Role.Label != EmployeeRoleLabel)
                return Result<EmployeeManagementResponse>.Failure("Seuls les comptes employés peuvent être réactivés depuis cet espace.", 403);

            if (!employee.IsSuspended)
                return Result<EmployeeManagementResponse>.Failure("Ce compte n'est pas suspendu.", 400);

            employee.IsSuspended = false;
            var updated = await userRepository.UpdateAsync(employee, cancellationToken);

            logger.LogInformation("Employee {EmployeeId} reactivated by admin {AdminId}", employeeId, adminId);

            try
            {
                await emailService.SendAccountReactivatedEmailAsync(
                    updated.Email, updated.Pseudo, cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to send reactivation email for employee {EmployeeId}", employeeId);
            }

            return Result<EmployeeManagementResponse>.Success(UserMapper.ToEmployeeResponse(updated));
        }

        /// <inheritdoc />
        public async Task<Result<Unit>> DeleteAsync(
            int employeeId,
            int adminId,
            CancellationToken cancellationToken)
        {
            var employee = await userRepository.GetByIdWithRoleAsync(employeeId, cancellationToken);

            if (employee is null)
                return Result<Unit>.Failure("Employé introuvable.", 404);

            if (employee.Role.Label != EmployeeRoleLabel)
                return Result<Unit>.Failure("Seuls les comptes employés peuvent être supprimés depuis cet espace.", 403);

            try
            {
                await emailService.SendAccountDeletedEmailAsync(
                    employee.Email, employee.Pseudo, cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to send deletion email for employee {EmployeeId}", employeeId);
            }

            await userRepository.DeleteAsync(employee, cancellationToken);

            logger.LogInformation("Employee {EmployeeId} deleted by admin {AdminId}", employeeId, adminId);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
