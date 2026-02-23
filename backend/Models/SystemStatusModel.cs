namespace DevOpsDashboard.API.Models;

public class SystemStatusModel
{
    public double CpuUsagePercent { get; set; }
    public MemoryInfo Memory { get; set; } = new();
    public UptimeInfo Uptime { get; set; } = new();
    public string OperatingSystem { get; set; } = string.Empty;
    public string MachineName { get; set; } = string.Empty;
    public string RuntimeVersion { get; set; } = string.Empty;
    public DateTime CapturedAt { get; set; } = DateTime.UtcNow;
}

public class MemoryInfo
{
    public long TotalMB { get; set; }
    public long UsedMB { get; set; }
    public long FreeMB { get; set; }
    public double UsedPercent { get; set; }
}

public class UptimeInfo
{
    public long TotalSeconds { get; set; }
    public string Formatted { get; set; } = string.Empty; // e.g. "3d 4h 12m"
}