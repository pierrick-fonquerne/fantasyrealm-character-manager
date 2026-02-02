using FantasyRealm.Application.Interfaces;
using FantasyRealm.Application.Services;
using FantasyRealm.Infrastructure.Email;
using FantasyRealm.Infrastructure.Persistence;
using FantasyRealm.Infrastructure.Repositories;
using FantasyRealm.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;

namespace FantasyRealm.Infrastructure
{
    /// <summary>
    /// Extension methods for registering infrastructure services.
    /// </summary>
    public static class DependencyInjection
    {
        /// <summary>
        /// Adds infrastructure services to the dependency injection container.
        /// </summary>
        /// <param name="services">The service collection.</param>
        /// <param name="configuration">The application configuration.</param>
        /// <returns>The service collection for chaining.</returns>
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            var postgreSqlConnectionString = configuration.GetConnectionString("PostgreSQL");
            var mongoDbConnectionString = configuration.GetConnectionString("MongoDB");
            var mongoDbDatabaseName = configuration["MongoDB:DatabaseName"] ?? "fantasyrealm";

            if (!string.IsNullOrEmpty(postgreSqlConnectionString))
            {
                services.AddDbContext<FantasyRealmDbContext>(options =>
                    options.UseNpgsql(postgreSqlConnectionString));
            }

            if (!string.IsNullOrEmpty(mongoDbConnectionString))
            {
                services.AddSingleton<IMongoClient>(_ => new MongoClient(mongoDbConnectionString));
                services.AddSingleton(sp =>
                {
                    var client = sp.GetRequiredService<IMongoClient>();
                    return new MongoDbContext(client, mongoDbDatabaseName);
                });
            }

            services.Configure<BrevoSettings>(configuration.GetSection(BrevoSettings.SectionName));
            services.AddHttpClient<IEmailService, BrevoEmailService>();

            services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));
            services.AddSingleton<IJwtService, JwtService>();

            services.AddScoped<IUserRepository, UserRepository>();
            services.AddSingleton<IPasswordHasher, Argon2PasswordHasher>();
            services.AddSingleton<IPasswordGenerator, SecurePasswordGenerator>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IContactService, ContactService>();
            services.AddScoped<IReferenceDataRepository, ReferenceDataRepository>();
            services.AddScoped<IReferenceDataService, ReferenceDataService>();

            return services;
        }
    }
}
