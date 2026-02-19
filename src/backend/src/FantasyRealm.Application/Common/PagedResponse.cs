namespace FantasyRealm.Application.Common
{
    /// <summary>
    /// Represents a paginated response containing a subset of items and pagination metadata.
    /// </summary>
    /// <typeparam name="T">The type of items in the response.</typeparam>
    public sealed record PagedResponse<T>(
        IReadOnlyList<T> Items,
        int Page,
        int PageSize,
        int TotalCount,
        int TotalPages);
}
