using DevOpsDashboard.API.Services;  
using Microsoft.OpenApi.Models;
using DevOpsDashboard.API.Configurations;
using DevOpsDashboard.API.Helpers;
using Microsoft.Extensions.Diagnostics.HealthChecks;


var builder = WebApplication.CreateBuilder(args);

// ── Configuration ──────────────────────────────────────────────
builder.Services.Configure<AppSettings>(
    builder.Configuration.GetSection("AppSettings"));

// ── Core Services ──────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddScoped<ISystemMonitorService, SystemMonitorService>();
builder.Services.AddScoped<ILogReaderService, LogReaderService>();
builder.Services.AddScoped<IDeploymentService, DeploymentService>();

// ── Health Checks ──────────────────────────────────────────────
// Each named check appears individually in /api/health/details
builder.Services.AddHealthChecks()
    .AddCheck<SystemResourceHealthCheck>(
        name: "system_resources",
        failureStatus: HealthStatus.Degraded,
        tags: ["system", "resources"]);

// ── Swagger ────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title       = "DevOps Dashboard API",
        Version     = "v1",
        Description = "A production-grade DevOps monitoring backend built with ASP.NET Core 8",
        Contact     = new OpenApiContact
        {
            Name = "DevOps Dashboard",
            Url  = new Uri("https://github.com")
        }
    });
});

// ── CORS (useful when a frontend is added later) ───────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

// ── Ensure required files/folders exist on startup ────────────
var appSettings = builder.Configuration
    .GetSection("AppSettings").Get<AppSettings>() ?? new AppSettings();

LogHelper.EnsureLogFileExists(appSettings.LogFilePath);

// ── Seed startup log entries ───────────────────────────────────
LogHelper.WriteLog(appSettings.LogFilePath, "INFO",  "DevOps Dashboard API starting up");
LogHelper.WriteLog(appSettings.LogFilePath, "INFO",  $"Environment: {app.Environment.EnvironmentName}");
LogHelper.WriteLog(appSettings.LogFilePath, "INFO",  $"Machine: {Environment.MachineName}");
LogHelper.WriteLog(appSettings.LogFilePath, "INFO",  $"Runtime: {System.Runtime.InteropServices.RuntimeInformation.FrameworkDescription}");
LogHelper.WriteLog(appSettings.LogFilePath, "DEBUG", "Dependency injection container configured");
LogHelper.WriteLog(appSettings.LogFilePath, "DEBUG", "Swagger UI enabled");
LogHelper.WriteLog(appSettings.LogFilePath, "INFO",  "Health check endpoints registered");
LogHelper.WriteLog(appSettings.LogFilePath, "INFO",  "DevOps Dashboard API is ready to serve requests");

if (!Directory.Exists("Data"))
    Directory.CreateDirectory("Data");

// ── Middleware Pipeline ────────────────────────────────────────
if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "DevOps Dashboard API v1");
        options.RoutePrefix = string.Empty; // Swagger at root URL
    });
}

app.UseCors("AllowAll");
app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();

// Orchestrator-friendly endpoint — returns JSON with overall status
app.MapHealthChecks("/health", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var result = System.Text.Json.JsonSerializer.Serialize(new
        {
            status    = report.Status.ToString(),
            timestamp = DateTime.UtcNow
        });
        await context.Response.WriteAsync(result);
    }
});

app.Run();