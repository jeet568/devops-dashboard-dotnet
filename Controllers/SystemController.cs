using DevOpsDashboard.API.Models;
using DevOpsDashboard.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace DevOpsDashboard.API.Controllers;

public class SystemController : BaseController
{
    private readonly ISystemMonitorService _systemMonitorService;
    private readonly ILogger<SystemController> _logger;

    public SystemController(
        ISystemMonitorService systemMonitorService,
        ILogger<SystemController> logger)
    {
        _systemMonitorService = systemMonitorService;
        _logger               = logger;
    }

    /// <summary>
    /// Returns current CPU usage, memory stats, and system uptime.
    /// </summary>
    [HttpGet("status")]
    [ProducesResponseType(typeof(ApiResponse<SystemStatusModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetSystemStatus()
    {
        try
        {
            _logger.LogInformation("System status requested at {Time}", DateTime.UtcNow);
            var status = await _systemMonitorService.GetSystemStatusAsync();
            return Ok(ApiResponse<SystemStatusModel>.Ok(status));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving system status");
            return StatusCode(500, ApiResponse<object>.Fail("Failed to retrieve system status."));
        }
    }
}