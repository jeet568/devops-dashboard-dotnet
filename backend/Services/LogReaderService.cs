using System.Text.RegularExpressions;
using DevOpsDashboard.API.Configurations;
using DevOpsDashboard.API.Helpers;
using DevOpsDashboard.API.Models;
using Microsoft.Extensions.Options;

namespace DevOpsDashboard.API.Services;

public class LogReaderService : ILogReaderService
{
    private readonly AppSettings _settings;
    private readonly ILogger<LogReaderService> _logger;

    // Matches our LogHelper format: [2025-01-01 12:00:00] [INFO] Message here
    private static readonly Regex LogLineRegex = new(
        @"^\[(?<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] \[(?<level>\w+)\] (?<message>.+)$",
        RegexOptions.Compiled);

    private static readonly HashSet<string> ValidLevels =
        new(StringComparer.OrdinalIgnoreCase)
        {
            "INFO", "WARN", "WARNING", "ERROR", "DEBUG", "FATAL", "TRACE"
        };

    public LogReaderService(
        IOptions<AppSettings> settings,
        ILogger<LogReaderService> logger)
    {
        _settings = settings.Value;
        _logger   = logger;

        // Ensure the log file exists when the service is first used
        LogHelper.EnsureLogFileExists(_settings.LogFilePath);
    }

    // ── Read & Parse ────────────────────────────────────────────────────────
    public async Task<LogQueryResult> GetLogsAsync(
        int lines             = 50,
        string? levelFilter   = null,
        string? keywordFilter = null)
    {
        try
        {
            var allLines = await ReadTailLinesAsync(_settings.LogFilePath, lines);

            var entries = allLines
                .Select((line, index) => ParseLogLine(line, index + 1))
                .ToList();

            // Apply level filter (case-insensitive)
            if (!string.IsNullOrWhiteSpace(levelFilter))
                entries = entries
                    .Where(e => e.Level.Equals(levelFilter.Trim(),
                        StringComparison.OrdinalIgnoreCase))
                    .ToList();

            // Apply keyword filter (searches message and raw line)
            if (!string.IsNullOrWhiteSpace(keywordFilter))
                entries = entries
                    .Where(e =>
                        e.Message.Contains(keywordFilter, StringComparison.OrdinalIgnoreCase) ||
                        e.Raw.Contains(keywordFilter, StringComparison.OrdinalIgnoreCase))
                    .ToList();

            return new LogQueryResult
            {
                LogFilePath        = _settings.LogFilePath,
                TotalLinesRead     = allLines.Count,
                TotalLinesReturned = entries.Count,
                FilterLevel        = levelFilter,
                FilterKeyword      = keywordFilter,
                QueriedAt          = DateTime.UtcNow,
                Entries            = entries
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to read log file at {Path}", _settings.LogFilePath);
            throw;
        }
    }

    // ── Write ───────────────────────────────────────────────────────────────
    public Task WriteLogAsync(string level, string message)
    {
        var normalizedLevel = ValidLevels.Contains(level.ToUpper())
            ? level.ToUpper()
            : "INFO";

        LogHelper.WriteLog(_settings.LogFilePath, normalizedLevel, message);
        return Task.CompletedTask;
    }

    // ── List Available Log Files ────────────────────────────────────────────
    public Task<List<string>> GetAvailableLogFilesAsync()
    {
        var logDirectory = Path.GetDirectoryName(_settings.LogFilePath) ?? "Logs";

        if (!Directory.Exists(logDirectory))
            return Task.FromResult(new List<string>());

        var files = Directory
            .GetFiles(logDirectory, "*.log")
            .Select(Path.GetFileName)
            .Where(f => f is not null)
            .Cast<string>()
            .OrderByDescending(f => f)
            .ToList();

        return Task.FromResult(files);
    }

    // ── Private Helpers ─────────────────────────────────────────────────────

    // Reads only the last N lines — efficient for large files.
    // We don't load the entire file into memory.
    private static async Task<List<string>> ReadTailLinesAsync(string filePath, int lineCount)
    {
        if (!File.Exists(filePath))
            return new List<string>();

        // Use FileShare.ReadWrite so we can read while the app is writing
        await using var stream = new FileStream(
            filePath,
            FileMode.Open,
            FileAccess.Read,
            FileShare.ReadWrite);

        using var reader = new StreamReader(stream);
        var allLines     = new List<string>();

        while (await reader.ReadLineAsync() is { } line)
            allLines.Add(line);

        // Return only the last N non-empty lines
        return allLines
            .Where(l => !string.IsNullOrWhiteSpace(l))
            .TakeLast(lineCount)
            .ToList();
    }

    // Parses a raw log line into a structured LogEntryModel
    private static LogEntryModel ParseLogLine(string raw, int lineNumber)
    {
        var entry = new LogEntryModel
        {
            LineNumber = lineNumber,
            Raw        = raw
        };

        var match = LogLineRegex.Match(raw);
        if (!match.Success)
        {
            entry.Message  = raw;
            entry.Level    = "UNKNOWN";
            entry.IsParsed = false;
            return entry;
        }

        entry.IsParsed = true;
        entry.Level    = match.Groups["level"].Value.ToUpper();
        entry.Message  = match.Groups["message"].Value;

        if (DateTime.TryParse(match.Groups["timestamp"].Value, out var ts))
            entry.Timestamp = ts;

        return entry;
    }
}