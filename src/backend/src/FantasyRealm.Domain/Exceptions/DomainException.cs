namespace FantasyRealm.Domain.Exceptions
{
    /// <summary>
    /// Represents a violation of a domain invariant.
    /// Thrown by entity methods when a business rule is broken.
    /// </summary>
    public class DomainException : Exception
    {
        /// <summary>
        /// Gets the suggested HTTP status code for this domain error.
        /// </summary>
        public int StatusCode { get; }

        /// <summary>
        /// Initializes a new instance of the <see cref="DomainException"/> class.
        /// </summary>
        /// <param name="message">The error message describing the invariant violation.</param>
        /// <param name="statusCode">The suggested HTTP status code (default: 400).</param>
        public DomainException(string message, int statusCode = 400)
            : base(message)
        {
            StatusCode = statusCode;
        }
    }
}
