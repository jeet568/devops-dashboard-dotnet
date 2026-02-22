namespace DevOpsDashboard.API.Models;

public class DeploymentModel
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string ApplicationName { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;           // e.g. "v1.4.2"
    public string Environment { get; set; } = string.Empty;       // Production | Staging | Dev
    public string Status { get; set; } = DeploymentStatus.Pending;
    public string DeployedBy { get; set; } = string.Empty;        // user or CI/CD agent
    public string Branch { get; set; } = string.Empty;            // git branch
    public string CommitHash { get; set; } = string.Empty;        // short SHA
    public string? Notes { get; set; }                            // optional release notes
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public long? DurationSeconds { get; set; }
    public List<string> Tags { get; set; } = new();               // e.g. ["hotfix", "breaking-change"]
}

// Strongly-typed status constants — no magic strings scattered in code
public static class DeploymentStatus
{
    public const string Pending    = "Pending";
    public const string Running    = "Running";
    public const string Success    = "Success";
    public const string Failed     = "Failed";
    public const string RolledBack = "RolledBack";

    public static readonly IReadOnlyList<string> All =
        new[] { Pending, Running, Success, Failed, RolledBack };
}

// Strongly-typed environment constants
public static class DeploymentEnvironment
{
    public const string Development = "Development";
    public const string Staging     = "Staging";
    public const string Production  = "Production";

    public static readonly IReadOnlyList<string> All =
        new[] { Development, Staging, Production };
}