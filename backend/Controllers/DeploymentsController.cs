using DevOpsDashboard.API.Models;
using DevOpsDashboard.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace DevOpsDashboard.API.Controllers;

public class DeploymentsController : BaseController
{
    private readonly IDeploymentService _deploymentService;
    private readonly ILogger<DeploymentsController> _logger;

    public DeploymentsController(
        IDeploymentService deploymentService,
        ILogger<DeploymentsController> logger)
    {
        _deploymentService = deploymentService;
        _logger            = logger;
    }

    /// <summary>
    /// Returns all deployment records. Supports filtering by environment, status, and app name.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<DeploymentModel>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? environment = null,
        [FromQuery] string? status      = null,
        [FromQuery] string? appName     = null)
    {
        var deployments = await _deploymentService.GetAllAsync(environment, status, appName);
        return Ok(ApiResponse<List<DeploymentModel>>.Ok(deployments,
            $"{deployments.Count} deployment(s) found"));
    }

    /// <summary>
    /// Returns a deployment summary with counts, success rate, and last deployment info.
    /// </summary>
    [HttpGet("summary")]
    [ProducesResponseType(typeof(ApiResponse<DeploymentSummary>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSummary()
    {
        var summary = await _deploymentService.GetSummaryAsync();
        return Ok(ApiResponse<DeploymentSummary>.Ok(summary));
    }

    /// <summary>
    /// Returns a single deployment record by its ID.
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<DeploymentModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(string id)
    {
        var deployment = await _deploymentService.GetByIdAsync(id);
        if (deployment is null)
            return NotFound(ApiResponse<object>.Fail($"Deployment '{id}' not found."));

        return Ok(ApiResponse<DeploymentModel>.Ok(deployment));
    }

    /// <summary>
    /// Creates a new deployment record. Status defaults to Pending.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<DeploymentModel>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateDeploymentRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<object>.Fail("Invalid request data."));

        try
        {
            var deployment = await _deploymentService.CreateAsync(request);
            return CreatedAtAction(
                nameof(GetById),
                new { id = deployment.Id },
                ApiResponse<DeploymentModel>.Ok(deployment, "Deployment created successfully"));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<object>.Fail(ex.Message));
        }
    }

    /// <summary>
    /// Updates the status of an existing deployment. Automatically sets CompletedAt
    /// and DurationSeconds when status is Success, Failed, or RolledBack.
    /// </summary>
    [HttpPatch("{id}/status")]
    [ProducesResponseType(typeof(ApiResponse<DeploymentModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateStatus(
        string id,
        [FromBody] UpdateDeploymentStatusRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<object>.Fail("Invalid request data."));

        try
        {
            var deployment = await _deploymentService.UpdateStatusAsync(id, request);
            if (deployment is null)
                return NotFound(ApiResponse<object>.Fail($"Deployment '{id}' not found."));

            return Ok(ApiResponse<DeploymentModel>.Ok(deployment,
                $"Deployment status updated to '{deployment.Status}'"));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<object>.Fail(ex.Message));
        }
    }

    /// <summary>
    /// Permanently deletes a deployment record.
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(string id)
    {
        var deleted = await _deploymentService.DeleteAsync(id);
        if (!deleted)
            return NotFound(ApiResponse<object>.Fail($"Deployment '{id}' not found."));

        return Ok(ApiResponse<object>.Ok(
            new { id, deletedAt = DateTime.UtcNow },
            "Deployment deleted successfully"));
    }
}