using DevOpsDashboard.API.Configurations;
using DevOpsDashboard.API.Helpers;
using DevOpsDashboard.API.Models;
using Microsoft.Extensions.Options;

namespace DevOpsDashboard.API.Services;

public class DeploymentService : IDeploymentService
{
    private readonly AppSettings _settings;
    private readonly ILogger<DeploymentService> _logger;
    private readonly ILogReaderService _logReaderService;

    // SemaphoreSlim prevents two requests writing the JSON file simultaneously
    private static readonly SemaphoreSlim FileLock = new(1, 1);

    public DeploymentService(
        IOptions<AppSettings> settings,
        ILogger<DeploymentService> logger,
        ILogReaderService logReaderService)
    {
        _settings          = settings.Value;
        _logger            = logger;
        _logReaderService  = logReaderService;

        EnsureDataFileExists();
    }

    // ── Read All ────────────────────────────────────────────────────────────
    public async Task<List<DeploymentModel>> GetAllAsync(
        string? environment = null,
        string? status      = null,
        string? appName     = null)
    {
        var deployments = await ReadDeploymentsAsync();

        if (!string.IsNullOrWhiteSpace(environment))
            deployments = deployments
                .Where(d => d.Environment.Equals(environment,
                    StringComparison.OrdinalIgnoreCase))
                .ToList();

        if (!string.IsNullOrWhiteSpace(status))
            deployments = deployments
                .Where(d => d.Status.Equals(status,
                    StringComparison.OrdinalIgnoreCase))
                .ToList();

        if (!string.IsNullOrWhiteSpace(appName))
            deployments = deployments
                .Where(d => d.ApplicationName.Contains(appName,
                    StringComparison.OrdinalIgnoreCase))
                .ToList();

        // Most recent first
        return deployments.OrderByDescending(d => d.StartedAt).ToList();
    }

    // ── Read One ────────────────────────────────────────────────────────────
    public async Task<DeploymentModel?> GetByIdAsync(string id)
    {
        var deployments = await ReadDeploymentsAsync();
        return deployments.FirstOrDefault(d =>
            d.Id.Equals(id, StringComparison.OrdinalIgnoreCase));
    }

    // ── Create ──────────────────────────────────────────────────────────────
    public async Task<DeploymentModel> CreateAsync(CreateDeploymentRequest request)
    {
        if (!DeploymentEnvironment.All.Contains(request.Environment,
                StringComparer.OrdinalIgnoreCase))
            throw new ArgumentException(
                $"Invalid environment. Valid values: {string.Join(", ", DeploymentEnvironment.All)}");

        var deployment = new DeploymentModel
        {
            Id              = $"dep-{Guid.NewGuid().ToString()[..8]}",
            ApplicationName = request.ApplicationName.Trim(),
            Version         = request.Version.Trim(),
            Environment     = request.Environment.Trim(),
            Status          = DeploymentStatus.Pending,
            DeployedBy      = request.DeployedBy.Trim(),
            Branch          = request.Branch.Trim(),
            CommitHash      = request.CommitHash.Trim(),
            Notes           = request.Notes?.Trim(),
            StartedAt       = DateTime.UtcNow,
            Tags            = request.Tags
        };

        await FileLock.WaitAsync();
        try
        {
            var deployments = await ReadDeploymentsAsync();
            deployments.Add(deployment);
            await WriteDeploymentsAsync(deployments);
        }
        finally
        {
            FileLock.Release();
        }

        await _logReaderService.WriteLogAsync("INFO",
            $"New deployment created: {deployment.ApplicationName} " +
            $"{deployment.Version} → {deployment.Environment} by {deployment.DeployedBy}");

        _logger.LogInformation(
            "Deployment {Id} created for {App} {Version}",
            deployment.Id, deployment.ApplicationName, deployment.Version);

        return deployment;
    }

    // ── Update Status ───────────────────────────────────────────────────────
    public async Task<DeploymentModel?> UpdateStatusAsync(
        string id,
        UpdateDeploymentStatusRequest request)
    {
        if (!DeploymentStatus.All.Contains(request.Status, StringComparer.OrdinalIgnoreCase))
            throw new ArgumentException(
                $"Invalid status. Valid values: {string.Join(", ", DeploymentStatus.All)}");

        await FileLock.WaitAsync();
        try
        {
            var deployments = await ReadDeploymentsAsync();
            var deployment  = deployments.FirstOrDefault(d =>
                d.Id.Equals(id, StringComparison.OrdinalIgnoreCase));

            if (deployment is null) return null;

            var previousStatus  = deployment.Status;
            deployment.Status   = request.Status;
            deployment.Notes    = request.Notes ?? deployment.Notes;

            // Auto-set CompletedAt and DurationSeconds for terminal states
            var terminalStatuses = new[]
            {
                DeploymentStatus.Success,
                DeploymentStatus.Failed,
                DeploymentStatus.RolledBack
            };

            if (terminalStatuses.Contains(request.Status, StringComparer.OrdinalIgnoreCase)
                && deployment.CompletedAt is null)
            {
                deployment.CompletedAt     = DateTime.UtcNow;
                deployment.DurationSeconds = (long)(DateTime.UtcNow - deployment.StartedAt)
                    .TotalSeconds;
            }

            await WriteDeploymentsAsync(deployments);

            await _logReaderService.WriteLogAsync(
                request.Status.Equals(DeploymentStatus.Failed, StringComparison.OrdinalIgnoreCase)
                    ? "ERROR" : "INFO",
                $"Deployment {id} status changed: {previousStatus} → {request.Status}");

            return deployment;
        }
        finally
        {
            FileLock.Release();
        }
    }

    // ── Delete ──────────────────────────────────────────────────────────────
    public async Task<bool> DeleteAsync(string id)
    {
        await FileLock.WaitAsync();
        try
        {
            var deployments = await ReadDeploymentsAsync();
            var existing    = deployments.FirstOrDefault(d =>
                d.Id.Equals(id, StringComparison.OrdinalIgnoreCase));

            if (existing is null) return false;

            deployments.Remove(existing);
            await WriteDeploymentsAsync(deployments);

            await _logReaderService.WriteLogAsync("WARN",
                $"Deployment record deleted: {id} " +
                $"({existing.ApplicationName} {existing.Version})");

            return true;
        }
        finally
        {
            FileLock.Release();
        }
    }

    // ── Summary ─────────────────────────────────────────────────────────────
    public async Task<DeploymentSummary> GetSummaryAsync()
    {
        var deployments = await ReadDeploymentsAsync();

        var completed = deployments
            .Where(d => d.Status == DeploymentStatus.Success ||
                        d.Status == DeploymentStatus.Failed  ||
                        d.Status == DeploymentStatus.RolledBack)
            .ToList();

        var successCount = deployments.Count(d => d.Status == DeploymentStatus.Success);

        return new DeploymentSummary
        {
            Total          = deployments.Count,
            Successful     = successCount,
            Failed         = deployments.Count(d => d.Status == DeploymentStatus.Failed),
            RolledBack     = deployments.Count(d => d.Status == DeploymentStatus.RolledBack),
            Pending        = deployments.Count(d => d.Status == DeploymentStatus.Pending),
            Running        = deployments.Count(d => d.Status == DeploymentStatus.Running),
            SuccessRatePercent = completed.Count > 0
                ? Math.Round((double)successCount / completed.Count * 100, 1)
                : 0,
            LastDeployment = deployments
                .OrderByDescending(d => d.StartedAt)
                .FirstOrDefault(),
            LastSuccessfulDeployment = deployments
                .Where(d => d.Status == DeploymentStatus.Success)
                .OrderByDescending(d => d.StartedAt)
                .FirstOrDefault(),
            ByEnvironment = deployments
                .GroupBy(d => d.Environment)
                .ToDictionary(g => g.Key, g => g.Count())
        };
    }

    // ── Private Helpers ─────────────────────────────────────────────────────
    private async Task<List<DeploymentModel>> ReadDeploymentsAsync()
    {
        return await Task.Run(() =>
            DataHelper.ReadJson<List<DeploymentModel>>(_settings.DeploymentDataPath)
            ?? new List<DeploymentModel>());
    }

    private async Task WriteDeploymentsAsync(List<DeploymentModel> deployments)
    {
        await Task.Run(() =>
            DataHelper.WriteJson(_settings.DeploymentDataPath, deployments));
    }

    private void EnsureDataFileExists()
    {
        if (!File.Exists(_settings.DeploymentDataPath))
        {
            _logger.LogInformation(
                "Deployment data file not found — creating empty store at {Path}",
                _settings.DeploymentDataPath);
            DataHelper.WriteJson(_settings.DeploymentDataPath, new List<DeploymentModel>());
        }
    }
}