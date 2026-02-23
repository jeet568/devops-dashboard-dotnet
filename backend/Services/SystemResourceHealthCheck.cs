using Microsoft.Extensions.Diagnostics.HealthChecks;
using DevOpsDashboard.API.Services;

namespace DevOpsDashboard.API.Services;

public class SystemResourceHealthCheck : IHealthCheck
{
    private readonly ISystemMonitorService _systemMonitorService;
    private readonly ILogger<SystemResourceHealthCheck> _logger;

    // Industry-standard thresholds — tune these for your environment
    private const double CpuDegradedThreshold  = 70.0;  // % — warn above this
    private const double CpuUnhealthyThreshold = 90.0;  // % — fail above this
    private const double MemDegradedThreshold  = 80.0;  // % — warn above this
    private const double MemUnhealthyThreshold = 95.0;  // % — fail above this

    public SystemResourceHealthCheck(
        ISystemMonitorService systemMonitorService,
        ILogger<SystemResourceHealthCheck> logger)
    {
        _systemMonitorService = systemMonitorService;
        _logger               = logger;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var status = await _systemMonitorService.GetSystemStatusAsync();

            var data = new Dictionary<string, object>
            {
                ["cpuUsagePercent"]    = status.CpuUsagePercent,
                ["memoryUsedPercent"]  = status.Memory.UsedPercent,
                ["memoryTotalMB"]      = status.Memory.TotalMB,
                ["memoryUsedMB"]       = status.Memory.UsedMB,
                ["systemUptime"]       = status.Uptime.Formatted,
                ["machineName"]        = status.MachineName,
                ["operatingSystem"]    = status.OperatingSystem
            };

            // Unhealthy — system is critically overloaded
            if (status.CpuUsagePercent >= CpuUnhealthyThreshold)
                return HealthCheckResult.Unhealthy(
                    $"CPU critically high: {status.CpuUsagePercent}%", data: data);

            if (status.Memory.UsedPercent >= MemUnhealthyThreshold)
                return HealthCheckResult.Unhealthy(
                    $"Memory critically high: {status.Memory.UsedPercent}%", data: data);

            // Degraded — system is under pressure but still operational
            if (status.CpuUsagePercent >= CpuDegradedThreshold)
                return HealthCheckResult.Degraded(
                    $"CPU usage elevated: {status.CpuUsagePercent}%", data: data);

            if (status.Memory.UsedPercent >= MemDegradedThreshold)
                return HealthCheckResult.Degraded(
                    $"Memory usage elevated: {status.Memory.UsedPercent}%", data: data);

            // Healthy
            return HealthCheckResult.Healthy("All system resources within normal thresholds", data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Health check threw an unexpected exception");
            return HealthCheckResult.Unhealthy("Health check failed with an exception", ex);
        }
    }
}