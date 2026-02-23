using DevOpsDashboard.API.Models;

namespace DevOpsDashboard.API.Services;

public interface IDockerMonitorService
{
    Task<DockerSummary> GetSummaryAsync();
    Task<List<DockerContainerModel>> GetContainersAsync(bool includeAll = false);
    Task<DockerContainerModel?> GetContainerByIdAsync(string containerId);
    Task<bool> IsDockerAvailableAsync();
}