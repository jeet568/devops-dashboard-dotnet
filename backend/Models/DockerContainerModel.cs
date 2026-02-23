namespace DevOpsDashboard.API.Models;

public class DockerContainerModel
{
    public string Id { get; set; } = string.Empty;              // Full 64-char ID
    public string ShortId { get; set; } = string.Empty;         // First 12 chars
    public List<string> Names { get; set; } = new();
    public string Image { get; set; } = string.Empty;
    public string ImageId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;          // e.g. "Up 3 hours"
    public string State { get; set; } = string.Empty;           // running | exited | paused
    public DateTime? StartedAt { get; set; }
    public long UptimeSeconds { get; set; }
    public string UptimeFormatted { get; set; } = string.Empty; // "3h 12m"
    public List<PortMapping> Ports { get; set; } = new();
    public Dictionary<string, string> Labels { get; set; } = new();
    public long MemoryUsageMB { get; set; }
    public string RestartPolicy { get; set; } = string.Empty;
}

public class PortMapping
{
    public string IpAddress { get; set; } = string.Empty;
    public int PrivatePort { get; set; }
    public int? PublicPort { get; set; }
    public string Type { get; set; } = string.Empty;            // tcp | udp
}

public class DockerSummary
{
    public bool DockerAvailable { get; set; }
    public string? DockerVersion { get; set; }
    public int TotalContainers { get; set; }
    public int RunningContainers { get; set; }
    public int StoppedContainers { get; set; }
    public int PausedContainers { get; set; }
    public List<DockerContainerModel> Containers { get; set; } = new();
    public DateTime CapturedAt { get; set; } = DateTime.UtcNow;
    public string? ErrorMessage { get; set; }                   // Set if Docker unavailable
}