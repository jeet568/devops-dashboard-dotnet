namespace DevOpsDashboard.API.Configurations;

public class AppSettings
{
    public string ApplicationName { get; set; } = "DevOps Dashboard";
    public string Version { get; set; } = "1.0.0";
    public string LogFilePath { get; set; } = "Logs/app.log";
    public string DeploymentDataPath { get; set; } = "Data/deployments.json";
    public int LogTailLines { get; set; } = 50;
}