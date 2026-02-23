using System.Diagnostics;
using DevOpsDashboard.API.Configurations;
using DevOpsDashboard.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;

namespace DevOpsDashboard.API.Controllers;

public class HealthController : BaseController
{
    private readonly HealthCheckService _healthCheckService;
    private readonly IOptions<AppSettings> _appSettings;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<HealthController> _logger;

    public HealthController(
        HealthCheckService healthCheckService,
        IOptions<AppSettings> appSettings,
        IWebHostEnvironment environment,
        ILogger<HealthController> logger)
    {
        _healthCheckService = healthCheckService;
        _appSettings        = appSettings;
        _environment        = environment;
        _logger             = logger;
    }

    /// <summary>
    /// Returns a detailed health report including all registered health checks,
    /// resource usage, and response time. Intended for dashboards and developers.
    /// </summary>
    [HttpGet("details")]
    [ProducesResponseType(typeof(ApiResponse<HealthStatusModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<HealthStatusModel>), StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> GetDetailedHealth()
    {
        _logger.LogInformation("Detailed health check requested at {Time}", DateTime.UtcNow);

        var stopwatch = Stopwatch.StartNew();
        var report    = await _healthCheckService.CheckHealthAsync();
        stopwatch.Stop();

        var healthModel = new HealthStatusModel
        {
            Status         = report.Status.ToString(),
            Application    = _appSettings.Value.ApplicationName,
            Version        = _appSettings.Value.Version,
            Environment    = _environment.EnvironmentName,
            CheckedAt      = DateTime.UtcNow,
            ResponseTimeMs = stopwatch.ElapsedMilliseconds,
            Checks         = report.Entries.Select(entry => new HealthCheckEntry
            {
                Name        = entry.Key,
                Status      = entry.Value.Status.ToString(),
                Description = entry.Value.Description ?? string.Empty,
                DurationMs  = (long)entry.Value.Duration.TotalMilliseconds,
                Data        = entry.Value.Data
                                   .ToDictionary(k => k.Key, v => v.Value)
            }).ToList()
        };

        var response = ApiResponse<HealthStatusModel>.Ok(
            healthModel,
            $"Health status: {report.Status}");

        // Return 503 if unhealthy — this is what load balancers look for
        return report.Status == HealthStatus.Unhealthy
            ? StatusCode(StatusCodes.Status503ServiceUnavailable, response)
            : Ok(response);
    }

    /// <summary>
    /// Lightweight liveness probe. Returns 200 OK if the app process is running.
    /// Use this for Docker HEALTHCHECK and Kubernetes livenessProbe.
    /// </summary>
    [HttpGet("live")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult Liveness()
    {
        return Ok(new { status = "Alive", timestamp = DateTime.UtcNow });
    }

    /// <summary>
    /// Readiness probe. Returns 200 only when the app is fully ready to handle requests.
    /// Use this for Kubernetes readinessProbe.
    /// </summary>
    [HttpGet("ready")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> Readiness()
    {
        var report = await _healthCheckService.CheckHealthAsync();

        if (report.Status == HealthStatus.Unhealthy)
            return StatusCode(503, new { status = "Not Ready", timestamp = DateTime.UtcNow });

        return Ok(new { status = "Ready", timestamp = DateTime.UtcNow });
    }
}