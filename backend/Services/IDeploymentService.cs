using DevOpsDashboard.API.Models;

namespace DevOpsDashboard.API.Services;

public interface IDeploymentService
{
    Task<List<DeploymentModel>> GetAllAsync(
        string? environment = null,
        string? status      = null,
        string? appName     = null);

    Task<DeploymentModel?> GetByIdAsync(string id);
    Task<DeploymentModel> CreateAsync(CreateDeploymentRequest request);
    Task<DeploymentModel?> UpdateStatusAsync(string id, UpdateDeploymentStatusRequest request);
    Task<bool> DeleteAsync(string id);
    Task<DeploymentSummary> GetSummaryAsync();
}