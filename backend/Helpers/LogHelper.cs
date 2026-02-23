namespace DevOpsDashboard.API.Helpers;

public static class LogHelper
{
    public static void EnsureLogFileExists(string logFilePath)
    {
        var directory = Path.GetDirectoryName(logFilePath);
        if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
            Directory.CreateDirectory(directory);

        if (!File.Exists(logFilePath))
        {
            File.WriteAllText(logFilePath,
                $"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}] [INFO] DevOps Dashboard initialized.{Environment.NewLine}");
        }
    }

    public static void WriteLog(string logFilePath, string level, string message)
    {
        var entry = $"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}] [{level.ToUpper()}] {message}{Environment.NewLine}";
        File.AppendAllText(logFilePath, entry);
    }
}