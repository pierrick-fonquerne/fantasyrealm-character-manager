namespace FantasyRealm.Domain.Enums
{
    /// <summary>
    /// Represents the moderation status of a character in the approval workflow.
    /// </summary>
    public enum CharacterStatus
    {
        /// <summary>Character is being created or edited by the owner.</summary>
        Draft,

        /// <summary>Character has been submitted and awaits moderation review.</summary>
        Pending,

        /// <summary>Character has been approved by a moderator.</summary>
        Approved,

        /// <summary>Character has been rejected by a moderator and can be edited and resubmitted.</summary>
        Rejected
    }
}
