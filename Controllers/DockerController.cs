using DevOpsDashboard.API.Models;
using DevOpsDashboard.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace DevOpsDashboard.API.Controllers;

public class DockerController : BaseController
{
    private readonly IDockerMonitorService _dockerMonitorService;
    private readonly ILogger<DockerController> _logger;

    public DockerController(
        IDockerMonitorService dockerMonitorService,
        ILogger<DockerController> logger)
    {
        _dockerMonitorService = dockerMonitorService;
        _logger               = logger;
    }

    /// <summary>
    /// Returns a full Docker summary: version, container counts,
    /// and the full container list with state and uptime.
    /// Returns DockerAvailable: false with an error message if Docker is not running.
    /// </summary>
    [HttpGet("summary")]
    [ProducesResponseType(typeof(ApiResponse<DockerSummary>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSummary()
    {
        _logger.LogInformation("Docker summary requested at {Time}", DateTime.UtcNow);
        var summary = await _dockerMonitorService.GetSummaryAsync();
        return Ok(ApiResponse<DockerSummary>.Ok(summary,
            summary.DockerAvailable
                ? $"{summary.TotalContainers} container(s) found"
                : "Docker is not available"));
    }

    /// <summary>
    /// Lists all running containers. Pass includeAll=true to include stopped containers.
    /// </summary>
    [HttpGet("containers")]
    [ProducesResponseType(typeof(ApiResponse<List<DockerContainerModel>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> GetContainers([FromQuery] bool includeAll = false)
    {
        try
        {
            var available = await _dockerMonitorService.IsDockerAvailableAsync();
            if (!available)
                return StatusCode(503, ApiResponse<object>.Fail(
                    "Docker is not available. Ensure Docker is running."));

            var containers = await _dockerMonitorService.GetContainersAsync(includeAll);
            return Ok(ApiResponse<List<DockerContainerModel>>.Ok(containers,
                $"{containers.Count} container(s) returned"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve container list");
            return StatusCode(503, ApiResponse<object>.Fail(
                "Failed to communicate with Docker. Is Docker running?"));
        }
    }

    /// <summary>
    /// Returns details for a single container.
    /// Accepts full ID, short ID (12 chars), or container name.
    /// </summary>
    [HttpGet("containers/{containerId}")]
    [ProducesResponseType(typeof(ApiResponse<DockerContainerModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> GetContainerById(string containerId)
    {
        try
        {
            var available = await _dockerMonitorService.IsDockerAvailableAsync();
            if (!available)
                return StatusCode(503, ApiResponse<object>.Fail(
                    "Docker is not available. Ensure Docker is running."));

            var container = await _dockerMonitorService.GetContainerByIdAsync(containerId);
            if (container is null)
                return NotFound(ApiResponse<object>.Fail(
                    $"Container '{containerId}' not found."));

            return Ok(ApiResponse<DockerContainerModel>.Ok(container));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve container {Id}", containerId);
            return StatusCode(503, ApiResponse<object>.Fail(
                "Failed to communicate with Docker."));
        }
    }

    /// <summary>
    /// Quick availability check — returns whether Docker is reachable from this API.
    /// </summary>
    [HttpGet("ping")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> Ping()
    {
        var available = await _dockerMonitorService.IsDockerAvailableAsync();
        return available
            ? Ok(new { dockerAvailable = true, timestamp = DateTime.UtcNow })
            : StatusCode(503, new { dockerAvailable = false, timestamp = DateTime.UtcNow });
    }
}