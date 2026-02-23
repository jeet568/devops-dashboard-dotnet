# ============================================================
# STAGE 1: Build
# Use the full .NET SDK to restore, build, and publish
# ============================================================
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy only the project file first and restore dependencies.
# Docker caches this layer — if .csproj hasn't changed,
# dotnet restore won't re-run on the next build. Huge time saver.
COPY ["DevOpsDashboard.csproj", "./"]
RUN dotnet restore "DevOpsDashboard.csproj"

# Now copy the full source and publish in Release mode.
# --no-restore skips a redundant restore since we just did it above.
COPY . .
RUN dotnet publish "DevOpsDashboard.csproj" \
    --configuration Release \
    --no-restore \
    --output /app/publish \
    /p:UseAppHost=false

# ============================================================
# STAGE 2: Runtime
# Use only the ASP.NET runtime — no SDK, no build tools
# This is the image that actually runs in production
# ============================================================
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Create a non-root user for security.
# Running as root inside a container is a real risk —
# if the container is compromised, root access is easier to escalate.
RUN addgroup --system --gid 1001 appgroup && \
    adduser  --system --uid 1001 --ingroup appgroup --no-create-home appuser

# Create runtime directories and set ownership
RUN mkdir -p /app/Logs /app/Data && \
    chown -R appuser:appgroup /app

# Copy the published output from the build stage
COPY --from=build --chown=appuser:appgroup /app/publish .

# Switch to the non-root user
USER appuser

# Expose the HTTP port the app listens on
EXPOSE 8080

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
ENV DOTNET_RUNNING_IN_CONTAINER=true

# Container-native health check.
# Docker will call this every 30s and mark the container
# unhealthy if it fails 3 times in a row.
HEALTHCHECK --interval=30s \
            --timeout=10s  \
            --start-period=15s \
            --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Entry point — runs the compiled application
ENTRYPOINT ["dotnet", "DevOpsDashboard.dll"]