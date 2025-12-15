FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY FantasyRealm.sln .
COPY src/FantasyRealm.Api/*.csproj src/FantasyRealm.Api/
COPY src/FantasyRealm.Application/*.csproj src/FantasyRealm.Application/
COPY src/FantasyRealm.Domain/*.csproj src/FantasyRealm.Domain/
COPY src/FantasyRealm.Infrastructure/*.csproj src/FantasyRealm.Infrastructure/
COPY tests/FantasyRealm.Tests.Unit/*.csproj tests/FantasyRealm.Tests.Unit/
COPY tests/FantasyRealm.Tests.Integration/*.csproj tests/FantasyRealm.Tests.Integration/

# Restore dependencies
RUN dotnet restore

# Copy source code
COPY . .

# Build
RUN dotnet build -c Release --no-restore

# Publish
RUN dotnet publish src/FantasyRealm.Api/FantasyRealm.Api.csproj -c Release -o /app/publish --no-build

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "FantasyRealm.Api.dll"]
