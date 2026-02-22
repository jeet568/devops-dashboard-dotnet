namespace DevOpsDashboard.API.Models;

public class HealthStatusModel
{
    public string Status { get; set; } = string.Empty;       // Healthy | Degraded | Unhealthy
    public string Application { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public string Environment { get; set; } = string.Empty;
    public DateTime CheckedAt { get; set; } = DateTime.UtcNow;
    public long ResponseTimeMs { get; set; }
    public List<HealthCheckEntry> Checks { get; set; } = new();
}

public class HealthCheckEntry
{
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public long DurationMs { get; set; }
    public Dictionary<string, object> Data { get; set; } = new();
}