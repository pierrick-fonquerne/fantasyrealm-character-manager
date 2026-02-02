using System.Security.Claims;
using System.Text;
using FantasyRealm.Infrastructure;
using FantasyRealm.Infrastructure.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace FantasyRealm.Api
{
    /// <summary>
    /// Application entry point.
    /// </summary>
    public partial class Program
    {
        private static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // CORS configuration
            var corsOrigins = builder.Configuration["CorsOrigins"]?.Split(',')
                ?? new[] { "http://localhost:5173" };

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy.SetIsOriginAllowed(origin =>
                    {
                        // Check each configured origin pattern
                        foreach (var allowedOrigin in corsOrigins)
                        {
                            var pattern = allowedOrigin.Trim();

                            // Support wildcard patterns like https://*.vercel.app
                            if (pattern.Contains("*"))
                            {
                                var regex = new System.Text.RegularExpressions.Regex(
                                    "^" + System.Text.RegularExpressions.Regex.Escape(pattern).Replace("\\*", ".*") + "$");
                                if (regex.IsMatch(origin))
                                    return true;
                            }
                            // Exact match
                            else if (pattern.Equals(origin, StringComparison.OrdinalIgnoreCase))
                            {
                                return true;
                            }
                        }
                        return false;
                    })
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials();
                });
            });

            // Infrastructure services (Database, Email, Auth)
            builder.Services.AddInfrastructure(builder.Configuration);

            // JWT Authentication configuration
            var jwtSettings = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>()!;
            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.MapInboundClaims = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings.Issuer,
                    ValidAudience = jwtSettings.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
                    RoleClaimType = ClaimTypes.Role
                };
            });

            builder.Services.AddAuthorization(options =>
            {
                options.AddPolicy("RequireUser", policy =>
                    policy.RequireRole("User", "Employee", "Admin"));

                options.AddPolicy("RequireEmployee", policy =>
                    policy.RequireRole("Employee", "Admin"));

                options.AddPolicy("RequireAdmin", policy =>
                    policy.RequireRole("Admin"));
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(options =>
                {
                    options.SwaggerEndpoint("/swagger/v1/swagger.json", "FantasyRealm API v1");
                });
            }

            app.UseCors("AllowFrontend");
            app.UseHttpsRedirection();
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();

            app.Run();
        }
    }
}
