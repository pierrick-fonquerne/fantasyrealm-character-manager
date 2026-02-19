using FantasyRealm.Application.Common;
using FantasyRealm.Application.DTOs;
using FantasyRealm.Application.Interfaces;
using FantasyRealm.Application.Mapping;
using FantasyRealm.Domain.Enums;
using FantasyRealm.Domain.Exceptions;
using Microsoft.Extensions.Logging;

namespace FantasyRealm.Application.Services
{
    /// <summary>
    /// Handles character moderation operations performed by employees.
    /// </summary>
    public sealed class ModerationService(
        ICharacterRepository characterRepository,
        IEmailService emailService,
        IActivityLogService activityLogService,
        ILogger<ModerationService> logger) : IModerationService
    {
        /// <inheritdoc />
        public async Task<Result<PagedResponse<PendingCharacterResponse>>> GetPendingCharactersAsync(
            int page,
            int pageSize,
            CancellationToken cancellationToken)
        {
            if (page < 1)
                return Result<PagedResponse<PendingCharacterResponse>>.Failure("Le numéro de page doit être supérieur à 0.");

            if (page > 1000)
                return Result<PagedResponse<PendingCharacterResponse>>.Failure("Le numéro de page ne peut pas dépasser 1000.");

            pageSize = Math.Clamp(pageSize, 1, 50);

            var (items, totalCount) = await characterRepository.GetPendingForModerationAsync(
                page, pageSize, cancellationToken);

            var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

            return Result<PagedResponse<PendingCharacterResponse>>.Success(
                new PagedResponse<PendingCharacterResponse>(items, page, pageSize, totalCount, totalPages));
        }

        /// <inheritdoc />
        public async Task<Result<CharacterResponse>> ApproveAsync(
            int characterId,
            CancellationToken cancellationToken)
        {
            var character = await characterRepository.GetByIdWithUserAsync(characterId, cancellationToken);

            if (character is null)
                return Result<CharacterResponse>.Failure("Personnage introuvable.", 404);

            try
            {
                character.Approve();
            }
            catch (DomainException ex)
            {
                return Result<CharacterResponse>.Failure(ex.Message, ex.StatusCode);
            }

            await characterRepository.UpdateAsync(character, cancellationToken);

            try
            {
                await emailService.SendCharacterApprovedEmailAsync(
                    character.User.Email, character.User.Pseudo, character.Name, cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to send approval email for character {CharacterId}", characterId);
            }

            try
            {
                await activityLogService.LogAsync(
                    ActivityAction.CharacterApproved, "Character", characterId, character.Name, null, cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to log activity for character approval {CharacterId}", characterId);
            }

            return Result<CharacterResponse>.Success(CharacterMapper.ToResponse(character, character.Class.Name, isOwner: false));
        }

        /// <inheritdoc />
        public async Task<Result<CharacterResponse>> RejectAsync(
            int characterId,
            string reason,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(reason))
                return Result<CharacterResponse>.Failure("Le motif de rejet est obligatoire.", 400);

            var character = await characterRepository.GetByIdWithUserAsync(characterId, cancellationToken);

            if (character is null)
                return Result<CharacterResponse>.Failure("Personnage introuvable.", 404);

            try
            {
                character.Reject();
            }
            catch (DomainException ex)
            {
                return Result<CharacterResponse>.Failure(ex.Message, ex.StatusCode);
            }

            await characterRepository.UpdateAsync(character, cancellationToken);

            try
            {
                await emailService.SendCharacterRejectedEmailAsync(
                    character.User.Email, character.User.Pseudo, character.Name, reason, cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to send rejection email for character {CharacterId}", characterId);
            }

            try
            {
                await activityLogService.LogAsync(
                    ActivityAction.CharacterRejected, "Character", characterId, character.Name, reason, cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to log activity for character rejection {CharacterId}", characterId);
            }

            return Result<CharacterResponse>.Success(CharacterMapper.ToResponse(character, character.Class.Name, isOwner: false));
        }

    }
}
