using DevOpsDashboard.API.Models;
using DevOpsDashboard.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace DevOpsDashboard.API.Controllers;

public class LogsController : BaseController
{
    private readonly ILogReaderService _logReaderService;
    private readonly ILogger<LogsController> _logger;

    public LogsController(
        ILogReaderService logReaderService,
        ILogger<LogsController> logger)
    {
        _logReaderService = logReaderService;
        _logger           = logger;
    }

    /// <summary>
    /// Fetches the latest log entries. Supports filtering by level and keyword.
    /// </summary>
    /// <param name="lines">Number of lines to read from the end of the file (default: 50, max: 500)</param>
    /// <param name="level">Filter by log level: INFO, WARN, ERROR, DEBUG, FATAL</param>
    /// <param name="keyword">Filter entries containing this keyword (case-insensitive)</param>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<LogQueryResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetLogs(
        [FromQuery] int     lines   = 50,
        [FromQuery] string? level   = null,
        [FromQuery] string? keyword = null)
    {
        if (lines < 1 || lines > 500)
            return BadRequest(ApiResponse<object>.Fail(
                "Lines must be between 1 and 500."));

        try
        {
            _logger.LogInformation(
                "Log query requested — lines: {Lines}, level: {Level}, keyword: {Keyword}",
                lines, level ?? "any", keyword ?? "none");

            var result = await _logReaderService.GetLogsAsync(lines, level, keyword);
            return Ok(ApiResponse<LogQueryResult>.Ok(result,
                $"{result.TotalLinesReturned} log entries returned"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reading log file");
            return StatusCode(500, ApiResponse<object>.Fail("Failed to read log file."));
        }
    }

    /// <summary>
    /// Writes a new entry to the application log file.
    /// Useful for testing the log pipeline or injecting manual audit entries.
    /// </summary>
    [HttpPost("write")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> WriteLog(
        [FromQuery] string level   = "INFO",
        [FromQuery] string message = "")
    {
        if (string.IsNullOrWhiteSpace(message))
            return BadRequest(ApiResponse<object>.Fail("Message cannot be empty."));

        var validLevels = new[] { "INFO", "WARN", "ERROR", "DEBUG", "FATAL" };
        if (!validLevels.Contains(level.ToUpper()))
            return BadRequest(ApiResponse<object>.Fail(
                $"Invalid level. Valid values: {string.Join(", ", validLevels)}"));

        await _logReaderService.WriteLogAsync(level, message);

        return Ok(ApiResponse<object>.Ok(
            new { level = level.ToUpper(), message, writtenAt = DateTime.UtcNow },
            "Log entry written successfully"));
    }

    /// <summary>
    /// Lists all available .log files in the Logs directory.
    /// </summary>
    [HttpGet("files")]
    [ProducesResponseType(typeof(ApiResponse<List<string>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLogFiles()
    {
        var files = await _logReaderService.GetAvailableLogFilesAsync();
        return Ok(ApiResponse<List<string>>.Ok(files,
            $"{files.Count} log file(s) found"));
    }
}