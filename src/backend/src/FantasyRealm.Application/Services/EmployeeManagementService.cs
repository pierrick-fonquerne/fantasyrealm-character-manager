using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using FantasyRealm.Application.Mapping;
using FantasyRealm.Domain.Entities;
using FantasyRealm.Domain.Enums;
using FantasyRealm.Domain.Exceptions;
using Microsoft.Extensions.Logging;

namespace FantasyRealm.Application.Services
{
    /// <summary>
    /// Handles employee management operations performed by administrators.
    /// </summary>
    public sealed class EmployeeManagementService(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IPasswordGenerator passwordGenerator,
        IEmailService emailService,
        IActivityLogService activityLogService,
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
            var employee = User.CreateEmployee(normalizedEmail, derivedPseudo, hashedPassword, role);

            var created = await userRepository.CreateAsync(employee, cancellationToken);

            logger.LogInformation("Employee {EmployeeId} created by admin {AdminId}", created.Id, adminId);

            try
            {
                await activityLogService.LogAsync(
                    ActivityAction.EmployeeCreated, "User", created.Id, created.Pseudo, null, cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to log activity for employee creation {EmployeeId}", created.Id);
            }

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

            try
            {
                employee.Suspend();
            }
            catch (DomainException ex)
            {
                return Result<EmployeeManagementResponse>.Failure(ex.Message, ex.StatusCode);
            }

            var updated = await userRepository.UpdateAsync(employee, cancellationToken);

            logger.LogInformation("Employee {EmployeeId} suspended by admin {AdminId}", employeeId, adminId);

            try
            {
                await activityLogService.LogAsync(
                    ActivityAction.EmployeeSuspended, "User", employeeId, employee.Pseudo, reason.Trim(), cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to log activity for employee suspension {EmployeeId}", employeeId);
            }

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

            try
            {
                employee.Reactivate();
            }
            catch (DomainException ex)
            {
                return Result<EmployeeManagementResponse>.Failure(ex.Message, ex.StatusCode);
            }

            var updated = await userRepository.UpdateAsync(employee, cancellationToken);

            logger.LogInformation("Employee {EmployeeId} reactivated by admin {AdminId}", employeeId, adminId);

            try
            {
                await activityLogService.LogAsync(
                    ActivityAction.EmployeeReactivated, "User", employeeId, employee.Pseudo, null, cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to log activity for employee reactivation {EmployeeId}", employeeId);
            }

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
        public async Task<Result<Unit>> ResetPasswordAsync(
            int employeeId,
            int adminId,
            CancellationToken cancellationToken)
        {
            var employee = await userRepository.GetByIdWithRoleAsync(employeeId, cancellationToken);

            if (employee is null)
                return Result<Unit>.Failure("Employé introuvable.", 404);

            if (employee.Role.Label != EmployeeRoleLabel)
                return Result<Unit>.Failure("Seuls les mots de passe des comptes employés peuvent être réinitialisés depuis cet espace.", 403);

            var temporaryPassword = passwordGenerator.GenerateSecurePassword();
            employee.SetTemporaryPassword(passwordHasher.Hash(temporaryPassword));

            await userRepository.UpdateAsync(employee, cancellationToken);

            logger.LogInformation("Employee {EmployeeId} password reset by admin {AdminId}", employeeId, adminId);

            try
            {
                await activityLogService.LogAsync(
                    ActivityAction.EmployeePasswordReset, "User", employeeId, employee.Pseudo, null, cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to log activity for employee password reset {EmployeeId}", employeeId);
            }

            try
            {
                await emailService.SendTemporaryPasswordEmailAsync(
                    employee.Email, employee.Pseudo, temporaryPassword, cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to send temporary password email for employee {EmployeeId}", employeeId);
            }

            return Result<Unit>.Success(Unit.Value);
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

            try
            {
                await activityLogService.LogAsync(
                    ActivityAction.EmployeeDeleted, "User", employeeId, employee.Pseudo, null, cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to log activity for employee deletion {EmployeeId}", employeeId);
            }

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
