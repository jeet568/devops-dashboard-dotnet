using DevOpsDashboard.API.Models;

namespace DevOpsDashboard.API.Services;

public interface ISystemMonitorService
{
    Task<SystemStatusModel> GetSystemStatusAsync();
}