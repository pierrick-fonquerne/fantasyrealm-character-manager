namespace FantasyRealm.Application.Common
{
    /// <summary>
    /// Represents a void type, since void is not a valid type in C# for generics.
    /// Used as the result type for operations that complete without returning a value.
    /// </summary>
    public readonly struct Unit : IEquatable<Unit>
    {
        /// <summary>
        /// Gets the single instance of Unit.
        /// </summary>
        public static readonly Unit Value = new();

        public bool Equals(Unit other) => true;

        public override bool Equals(object? obj) => obj is Unit;

        public override int GetHashCode() => 0;

        public static bool operator ==(Unit left, Unit right) => true;

        public static bool operator !=(Unit left, Unit right) => false;

        public override string ToString() => "()";
    }
}
