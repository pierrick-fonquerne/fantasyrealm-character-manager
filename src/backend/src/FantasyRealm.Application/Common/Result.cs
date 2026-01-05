namespace FantasyRealm.Application.Common
{
    /// <summary>
    /// Represents the result of an operation that can either succeed with a value or fail with an error.
    /// </summary>
    /// <typeparam name="T">The type of the value returned on success.</typeparam>
    public sealed class Result<T>
    {
        private Result(T? value, string? error, int? errorCode, bool isSuccess)
        {
            Value = value;
            Error = error;
            ErrorCode = errorCode;
            IsSuccess = isSuccess;
        }

        public bool IsSuccess { get; }

        public bool IsFailure => !IsSuccess;

        public T? Value { get; }

        public string? Error { get; }

        public int? ErrorCode { get; }

        /// <summary>
        /// Creates a successful result with the specified value.
        /// </summary>
        public static Result<T> Success(T value)
        {
            return new Result<T>(value, null, null, true);
        }

        /// <summary>
        /// Creates a failed result with the specified error message and HTTP status code.
        /// </summary>
        public static Result<T> Failure(string error, int errorCode = 400)
        {
            return new Result<T>(default, error, errorCode, false);
        }
    }
}
