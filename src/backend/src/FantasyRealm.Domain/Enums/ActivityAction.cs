namespace FantasyRealm.Domain.Enums
{
    /// <summary>
    /// Represents the type of action logged in the activity log (MongoDB).
    /// </summary>
    public enum ActivityAction
    {
        CharacterApproved,
        CharacterRejected,
        CommentApproved,
        CommentRejected,
        ArticleCreated,
        ArticleUpdated,
        ArticleDeleted,
        UserSuspended,
        UserDeleted,
        EmployeeCreated,
        EmployeeSuspended,
        EmployeeDeleted
    }
}
