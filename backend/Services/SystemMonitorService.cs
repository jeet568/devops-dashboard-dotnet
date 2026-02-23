using System.Diagnostics;
using System.Runtime.InteropServices;
using DevOpsDashboard.API.Models;

namespace DevOpsDashboard.API.Services;

public class SystemMonitorService : ISystemMonitorService
{
    private readonly ILogger<SystemMonitorService> _logger;

    public SystemMonitorService(ILogger<SystemMonitorService> logger)
    {
        _logger = logger;
    }

    public async Task<SystemStatusModel> GetSystemStatusAsync()
    {
        try
        {
            var cpuUsage  = await GetCpuUsageAsync();
            var memory    = GetMemoryInfo();
            var uptime    = GetUptimeInfo();

            return new SystemStatusModel
            {
                CpuUsagePercent = cpuUsage,
                Memory          = memory,
                Uptime          = uptime,
                OperatingSystem = RuntimeInformation.OSDescription,
                MachineName     = Environment.MachineName,
                RuntimeVersion  = RuntimeInformation.FrameworkDescription,
                CapturedAt      = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve system status");
            throw;
        }
    }

    // ── CPU ────────────────────────────────────────────────────────────────
    // We take two samples 500ms apart and calculate the delta.
    // This is the standard approach because a single snapshot gives no useful data.
    private static async Task<double> GetCpuUsageAsync()
    {
        var startTime    = DateTime.UtcNow;
        var startCpuTime = Process.GetCurrentProcess().TotalProcessorTime;

        await Task.Delay(500);

        var endTime    = DateTime.UtcNow;
        var endCpuTime = Process.GetCurrentProcess().TotalProcessorTime;

        var cpuUsedMs   = (endCpuTime - startCpuTime).TotalMilliseconds;
        var totalMsPast = (endTime - startTime).TotalMilliseconds;
        var cpuCores    = Environment.ProcessorCount;

        var cpuUsage = cpuUsedMs / (totalMsPast * cpuCores) * 100.0;
        return Math.Round(Math.Min(cpuUsage, 100.0), 2);
    }

    // ── Memory ─────────────────────────────────────────────────────────────
    // GC.GetGCMemoryInfo() is the recommended cross-platform API in .NET 8.
    private static MemoryInfo GetMemoryInfo()
    {
        var gcInfo  = GC.GetGCMemoryInfo();
        var totalMB = gcInfo.TotalAvailableMemoryBytes / 1024 / 1024;
        var usedMB  = GC.GetTotalMemory(false) / 1024 / 1024;
        var freeMB  = totalMB - usedMB;

        return new MemoryInfo
        {
            TotalMB     = totalMB,
            UsedMB      = usedMB,
            FreeMB      = freeMB > 0 ? freeMB : 0,
            UsedPercent = totalMB > 0
                ? Math.Round((double)usedMB / totalMB * 100, 2)
                : 0
        };
    }

    // ── Uptime ─────────────────────────────────────────────────────────────
    // Environment.TickCount64 gives milliseconds since OS boot — no P/Invoke needed.
    private static UptimeInfo GetUptimeInfo()
    {
        var uptimeMs      = Environment.TickCount64;
        var uptimeSeconds = uptimeMs / 1000;
        var uptime        = TimeSpan.FromMilliseconds(uptimeMs);

        var formatted = $"{(int)uptime.TotalDays}d " +
                        $"{uptime.Hours}h "          +
                        $"{uptime.Minutes}m "        +
                        $"{uptime.Seconds}s";

        return new UptimeInfo
        {
            TotalSeconds = uptimeSeconds,
            Formatted    = formatted
        };
    }
}