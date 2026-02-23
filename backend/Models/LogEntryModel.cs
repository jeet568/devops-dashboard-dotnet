namespace DevOpsDashboard.API.Models;

public class LogEntryModel
{
    public int LineNumber { get; set; }
    public DateTime? Timestamp { get; set; }
    public string Level { get; set; } = string.Empty;     // INFO | WARN | ERROR | DEBUG
    public string Message { get; set; } = string.Empty;
    public string Raw { get; set; } = string.Empty;       // Original unmodified line
    public bool IsParsed { get; set; }                    // false = raw line, couldn't parse
}

public class LogQueryResult
{
    public string LogFilePath { get; set; } = string.Empty;
    public int TotalLinesRead { get; set; }
    public int TotalLinesReturned { get; set; }
    public string? FilterLevel { get; set; }
    public string? FilterKeyword { get; set; }
    public DateTime QueriedAt { get; set; } = DateTime.UtcNow;
    public List<LogEntryModel> Entries { get; set; } = new();
}