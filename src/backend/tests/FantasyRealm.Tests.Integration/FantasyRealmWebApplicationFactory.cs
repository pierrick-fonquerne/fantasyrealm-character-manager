using FantasyRealm.Api;
using FantasyRealm.Application.Interfaces;
using FantasyRealm.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Testcontainers.PostgreSql;

namespace FantasyRealm.Tests.Integration
{
    /// <summary>
    /// Custom WebApplicationFactory for integration testing with Testcontainers.
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

                var sp = services.BuildServiceProvider();
                using var scope = sp.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<FantasyRealmDbContext>();
                db.Database.EnsureCreated();
                SeedDatabase(db);
            });
        }

        private static void SeedDatabase(FantasyRealmDbContext context)
        {
            if (!context.Roles.Any())
            {
                context.Roles.AddRange(
                    new Domain.Entities.Role { Id = 1, Label = "User" },
                    new Domain.Entities.Role { Id = 2, Label = "Employee" },
                    new Domain.Entities.Role { Id = 3, Label = "Admin" }
                );
                context.SaveChanges();
            }
        }
    }
}
