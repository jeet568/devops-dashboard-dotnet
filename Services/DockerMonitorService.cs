using System.Net.Sockets;
using System.Runtime.InteropServices;
using System.Text.Json;
using DevOpsDashboard.API.Helpers;
using DevOpsDashboard.API.Models;

namespace DevOpsDashboard.API.Services;

public class DockerMonitorService : IDockerMonitorService
{
    private readonly ILogger<DockerMonitorService> _logger;
    private readonly ILogReaderService _logReaderService;
    private readonly HttpClient _httpClient;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public DockerMonitorService(
        ILogger<DockerMonitorService> logger,
        ILogReaderService logReaderService,
        IHttpClientFactory httpClientFactory)
    {
        _logger              = logger;
        _logReaderService    = logReaderService;
        _httpClient          = httpClientFactory.CreateClient("docker");
    }

    // ── Availability Check ──────────────────────────────────────────────────
    public async Task<bool> IsDockerAvailableAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync("http://localhost/version");
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    // ── Summary ─────────────────────────────────────────────────────────────
    public async Task<DockerSummary> GetSummaryAsync()
    {
        var summary = new DockerSummary { CapturedAt = DateTime.UtcNow };

        try
        {
            var version    = await GetDockerVersionAsync();
            var containers = await GetContainersAsync(includeAll: true);

            summary.DockerAvailable    = true;
            summary.DockerVersion      = version;
            summary.Containers         = containers;
            summary.TotalContainers    = containers.Count;
            summary.RunningContainers  = containers.Count(c =>
                c.State.Equals("running", StringComparison.OrdinalIgnoreCase));
            summary.StoppedContainers  = containers.Count(c =>
                c.State.Equals("exited", StringComparison.OrdinalIgnoreCase));
            summary.PausedContainers   = containers.Count(c =>
                c.State.Equals("paused", StringComparison.OrdinalIgnoreCase));
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Docker is unavailable or unreachable");
            summary.DockerAvailable = false;
            summary.ErrorMessage    =
                "Docker is not available. Ensure Docker is running and the socket is accessible.";
        }

        return summary;
    }

    // ── List Containers ─────────────────────────────────────────────────────
    public async Task<List<DockerContainerModel>> GetContainersAsync(bool includeAll = false)
    {
        var endpoint = $"http://localhost/containers/json{(includeAll ? "?all=true" : "")}";
        var json     = await _httpClient.GetStringAsync(endpoint);
        var dtos     = JsonSerializer.Deserialize<List<DockerContainerDto>>(json, JsonOptions)
                       ?? new List<DockerContainerDto>();

        var containers = new List<DockerContainerModel>();

        foreach (var dto in dtos)
        {
            // Fetch detailed inspect for each container to get StartedAt and RestartPolicy
            DockerContainerInspectDto? inspect = null;
            try
            {
                inspect = await InspectContainerAsync(dto.Id);
            }
            catch
            {
                // Inspect failed — continue with partial data
            }

            containers.Add(MapToModel(dto, inspect));
        }

        return containers;
    }

    // ── Get Single Container ────────────────────────────────────────────────
    public async Task<DockerContainerModel?> GetContainerByIdAsync(string containerId)
    {
        try
        {
            // First find in list (supports partial ID / name lookup)
            var allContainers = await GetContainersAsync(includeAll: true);
            var match = allContainers.FirstOrDefault(c =>
                c.Id.StartsWith(containerId, StringComparison.OrdinalIgnoreCase)     ||
                c.ShortId.Equals(containerId, StringComparison.OrdinalIgnoreCase)    ||
                c.Names.Any(n => n.TrimStart('/').Equals(containerId,
                    StringComparison.OrdinalIgnoreCase)));

            return match;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve container {Id}", containerId);
            return null;
        }
    }

    // ── Private Helpers ─────────────────────────────────────────────────────

    private async Task<DockerContainerInspectDto?> InspectContainerAsync(string id)
    {
        var json = await _httpClient.GetStringAsync($"http://localhost/containers/{id}/json");
        return JsonSerializer.Deserialize<DockerContainerInspectDto>(json, JsonOptions);
    }

    private async Task<string> GetDockerVersionAsync()
    {
        var json    = await _httpClient.GetStringAsync("http://localhost/version");
        var version = JsonSerializer.Deserialize<DockerVersionDto>(json, JsonOptions);
        return version is not null
            ? $"Docker {version.Version} (API {version.ApiVersion}) on {version.Os}/{version.Arch}"
            : "Unknown";
    }

    private static DockerContainerModel MapToModel(
        DockerContainerDto dto,
        DockerContainerInspectDto? inspect)
    {
        // Parse StartedAt from inspect if available
        DateTime? startedAt = null;
        long uptimeSeconds  = 0;
        string uptimeFmt    = "N/A";
        string restartPolicy = string.Empty;

        if (inspect is not null)
        {
            if (DateTime.TryParse(inspect.State.StartedAt, out var parsed)
                && parsed.Year > 1)
            {
                startedAt      = parsed.ToUniversalTime();
                var uptime     = DateTime.UtcNow - startedAt.Value;
                uptimeSeconds  = (long)uptime.TotalSeconds;
                uptimeFmt      = FormatUptime(uptime);
            }

            restartPolicy = inspect.HostConfig.RestartPolicy.Name;
        }

        return new DockerContainerModel
        {
            Id              = dto.Id,
            ShortId         = dto.Id.Length >= 12 ? dto.Id[..12] : dto.Id,
            Names           = dto.Names.Select(n => n.TrimStart('/')).ToList(),
            Image           = dto.Image,
            ImageId         = dto.ImageId.Replace("sha256:", "")[..Math.Min(12, dto.ImageId.Length - 7)],
            Status          = dto.Status,
            State           = dto.State,
            StartedAt       = startedAt,
            UptimeSeconds   = uptimeSeconds,
            UptimeFormatted = uptimeFmt,
            Ports           = dto.Ports.Select(p => new PortMapping
            {
                IpAddress   = p.IP ?? "0.0.0.0",
                PrivatePort = p.PrivatePort,
                PublicPort  = p.PublicPort,
                Type        = p.Type
            }).ToList(),
            Labels          = dto.Labels,
            RestartPolicy   = restartPolicy
        };
    }

    private static string FormatUptime(TimeSpan uptime)
    {
        if (uptime.TotalDays >= 1)
            return $"{(int)uptime.TotalDays}d {uptime.Hours}h {uptime.Minutes}m";
        if (uptime.TotalHours >= 1)
            return $"{(int)uptime.TotalHours}h {uptime.Minutes}m";
        if (uptime.TotalMinutes >= 1)
            return $"{uptime.Minutes}m {uptime.Seconds}s";
        return $"{uptime.Seconds}s";
    }
}