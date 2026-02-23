using System.Text.Json;

namespace DevOpsDashboard.API.Helpers;

public static class DataHelper
{
    private static readonly JsonSerializerOptions Options = new()
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public static T? ReadJson<T>(string filePath)
    {
        if (!File.Exists(filePath)) return default;
        var json = File.ReadAllText(filePath);
        return JsonSerializer.Deserialize<T>(json, Options);
    }

    public static void WriteJson<T>(string filePath, T data)
    {
        var directory = Path.GetDirectoryName(filePath);
        if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
            Directory.CreateDirectory(directory);

        var json = JsonSerializer.Serialize(data, Options);
        File.WriteAllText(filePath, json);
    }
}