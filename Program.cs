using DevOpsDashboard.API.Services;  
using Microsoft.OpenApi.Models;
using DevOpsDashboard.API.Configurations;
using DevOpsDashboard.API.Helpers;


var builder = WebApplication.CreateBuilder(args);

// ── Configuration ──────────────────────────────────────────────
builder.Services.Configure<AppSettings>(
    builder.Configuration.GetSection("AppSettings"));

// ── Core Services ──────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddHealthChecks();
builder.Services.AddScoped<ISystemMonitorService, SystemMonitorService>();

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
app.MapHealthChecks("/health");

app.Run();