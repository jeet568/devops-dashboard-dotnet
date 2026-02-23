using System.ComponentModel.DataAnnotations;

namespace DevOpsDashboard.API.Models;

public class CreateDeploymentRequest
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string ApplicationName { get; set; } = string.Empty;

    [Required]
    [StringLength(50, MinimumLength = 1)]
    public string Version { get; set; } = string.Empty;

    [Required]
    public string Environment { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string DeployedBy { get; set; } = string.Empty;

    public string Branch { get; set; } = "main";

    [StringLength(40)]
    public string CommitHash { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Notes { get; set; }

    public List<string> Tags { get; set; } = new();
}

public class UpdateDeploymentStatusRequest
{
    [Required]
    public string Status { get; set; } = string.Empty;

    public string? Notes { get; set; }
}

public class DeploymentSummary
{
    public int Total { get; set; }
    public int Successful { get; set; }
    public int Failed { get; set; }
    public int RolledBack { get; set; }
    public int Pending { get; set; }
    public int Running { get; set; }
    public double SuccessRatePercent { get; set; }
    public DeploymentModel? LastDeployment { get; set; }
    public DeploymentModel? LastSuccessfulDeployment { get; set; }
    public Dictionary<string, int> ByEnvironment { get; set; } = new();
}