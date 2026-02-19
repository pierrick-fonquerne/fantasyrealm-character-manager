using FantasyRealm.Api;
using FantasyRealm.Application.Interfaces;
using FantasyRealm.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Npgsql;
using Testcontainers.PostgreSql;

namespace FantasyRealm.Tests.Integration
{
    /// <summary>
    /// Custom WebApplicationFactory for integration testing with Testcontainers.
    /// Executes real SQL scripts from database/sql/ for production parity.
    /// </summary>
    public class FantasyRealmWebApplicationFactory : WebApplicationFactory<Program>, IAsyncLifetime
    {
        private readonly PostgreSqlContainer _postgresContainer = new PostgreSqlBuilder()
            .WithImage("postgres:16-alpine")
            .WithDatabase("fantasyrealm_test")
            .WithUsername("test")
            .WithPassword("test")
            .Build();

        public Mock<IEmailService> EmailServiceMock { get; } = new();

        public async Task InitializeAsync()
        {
            await _postgresContainer.StartAsync();
            await ExecuteSqlScriptsAsync();
        }

        private async Task ExecuteSqlScriptsAsync()
        {
            var sqlDirectory = FindSqlDirectory();
            var sqlFiles = Directory.GetFiles(sqlDirectory, "*.sql")
                .Where(f => !Path.GetFileName(f).Contains("seed", StringComparison.OrdinalIgnoreCase))
                .OrderBy(f => f)
                .ToList();

            await using var connection = new NpgsqlConnection(_postgresContainer.GetConnectionString());
            await connection.OpenAsync();

            foreach (var sqlFile in sqlFiles)
            {
                var sql = await File.ReadAllTextAsync(sqlFile);
                await using var command = new NpgsqlCommand(sql, connection);
                await command.ExecuteNonQueryAsync();
            }
        }

        private static string FindSqlDirectory()
        {
            var currentDir = Directory.GetCurrentDirectory();
            var searchDir = currentDir;

            while (searchDir != null)
            {
                var sqlPath = Path.Combine(searchDir, "database", "sql");
                if (Directory.Exists(sqlPath))
                {
                    return sqlPath;
                }

                var parentSqlPath = Path.Combine(searchDir, "..", "..", "..", "..", "..", "database", "sql");
                if (Directory.Exists(parentSqlPath))
                {
                    return Path.GetFullPath(parentSqlPath);
                }

                searchDir = Directory.GetParent(searchDir)?.FullName;
            }

            throw new DirectoryNotFoundException(
                $"Could not find database/sql directory. Current directory: {currentDir}");
        }

        public new async Task DisposeAsync()
        {
            await _postgresContainer.DisposeAsync();
            await base.DisposeAsync();
        }

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureTestServices(services =>
            {
                var dbDescriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<FantasyRealmDbContext>));

                if (dbDescriptor != null)
                {
                    services.Remove(dbDescriptor);
                }

                services.AddDbContext<FantasyRealmDbContext>(options =>
                    options.UseNpgsql(_postgresContainer.GetConnectionString()));

                var emailDescriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(IEmailService));

                if (emailDescriptor != null)
                {
                    services.Remove(emailDescriptor);
                }

                services.AddScoped(_ => EmailServiceMock.Object);
            });
        }
    }
}
