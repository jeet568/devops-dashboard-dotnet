using DevOpsDashboard.API.Models;

namespace DevOpsDashboard.API.Services;

public interface ILogReaderService
{
    Task<LogQueryResult> GetLogsAsync(
        int lines          = 50,
        string? levelFilter   = null,
        string? keywordFilter = null);

    Task WriteLogAsync(string level, string message);
    Task<List<string>> GetAvailableLogFilesAsync();
}