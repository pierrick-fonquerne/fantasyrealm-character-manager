using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace FantasyRealm.Infrastructure.Persistence.Conventions
{
    /// <summary>
    /// Applies snake_case naming convention to all database objects.
    /// Converts PascalCase property names to snake_case column names.
    /// </summary>
    public static partial class SnakeCaseNamingConvention
    {
        public static void ApplySnakeCaseNamingConvention(this ModelBuilder modelBuilder)
        {
            foreach (var entity in modelBuilder.Model.GetEntityTypes())
            {
                ApplySnakeCaseToEntity(entity);
            }
        }

        private static void ApplySnakeCaseToEntity(IMutableEntityType entity)
        {
            var tableName = ToSnakeCase(entity.GetTableName() ?? entity.ClrType.Name);
            entity.SetTableName(tableName);

            foreach (var property in entity.GetProperties())
            {
                var columnName = ToSnakeCase(property.Name);
                property.SetColumnName(columnName);
            }

            foreach (var key in entity.GetKeys())
            {
                var keyName = key.GetName();
                if (keyName != null)
                {
                    key.SetName(ToSnakeCase(keyName));
                }
            }

            foreach (var foreignKey in entity.GetForeignKeys())
            {
                var foreignKeyName = foreignKey.GetConstraintName();
                if (foreignKeyName != null)
                {
                    foreignKey.SetConstraintName(ToSnakeCase(foreignKeyName));
                }
            }

            foreach (var index in entity.GetIndexes())
            {
                var indexName = index.GetDatabaseName();
                if (indexName != null)
                {
                    index.SetDatabaseName(ToSnakeCase(indexName));
                }
            }
        }

        private static string ToSnakeCase(string input)
        {
            if (string.IsNullOrEmpty(input))
            {
                return input;
            }

            return SnakeCaseRegex().Replace(input, "$1_$2").ToLowerInvariant();
        }

        [GeneratedRegex("([a-z0-9])([A-Z])")]
        private static partial Regex SnakeCaseRegex();
    }
}
