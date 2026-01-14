using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace FantasyRealm.Infrastructure.Persistence.Converters
{
    /// <summary>
    /// Converts DateTime values to and from UTC for PostgreSQL compatibility.
    /// PostgreSQL with Npgsql requires DateTime values to have Kind=Utc for timestamp with time zone columns.
    /// </summary>
    public sealed class UtcDateTimeConverter : ValueConverter<DateTime, DateTime>
    {
        public UtcDateTimeConverter()
            : base(
                v => v.Kind == DateTimeKind.Unspecified
                    ? DateTime.SpecifyKind(v, DateTimeKind.Utc)
                    : v.ToUniversalTime(),
                v => DateTime.SpecifyKind(v, DateTimeKind.Utc))
        {
        }
    }
}
