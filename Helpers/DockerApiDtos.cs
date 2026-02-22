using System.Text.Json.Serialization;

namespace DevOpsDashboard.API.Helpers;

// Maps to GET /containers/json response
internal class DockerContainerDto
{
    [JsonPropertyName("Id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("Names")]
    public List<string> Names { get; set; } = new();

    [JsonPropertyName("Image")]
    public string Image { get; set; } = string.Empty;

    [JsonPropertyName("ImageID")]
    public string ImageId { get; set; } = string.Empty;

    [JsonPropertyName("Status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("State")]
    public string State { get; set; } = string.Empty;

    [JsonPropertyName("Created")]
    public long Created { get; set; }                   // Unix timestamp

    [JsonPropertyName("Ports")]
    public List<DockerPortDto> Ports { get; set; } = new();

    [JsonPropertyName("Labels")]
    public Dictionary<string, string> Labels { get; set; } = new();
}

internal class DockerPortDto
{
    [JsonPropertyName("IP")]
    public string? IP { get; set; }

    [JsonPropertyName("PrivatePort")]
    public int PrivatePort { get; set; }

    [JsonPropertyName("PublicPort")]
    public int? PublicPort { get; set; }

    [JsonPropertyName("Type")]
    public string Type { get; set; } = string.Empty;
}

// Maps to GET /containers/{id}/json response
internal class DockerContainerInspectDto
{
    [JsonPropertyName("Id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("State")]
    public DockerContainerStateDto State { get; set; } = new();

    [JsonPropertyName("HostConfig")]
    public DockerHostConfigDto HostConfig { get; set; } = new();
}

internal class DockerContainerStateDto
{
    [JsonPropertyName("Status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("StartedAt")]
    public string StartedAt { get; set; } = string.Empty;

    [JsonPropertyName("FinishedAt")]
    public string FinishedAt { get; set; } = string.Empty;
}

internal class DockerHostConfigDto
{
    [JsonPropertyName("RestartPolicy")]
    public DockerRestartPolicyDto RestartPolicy { get; set; } = new();
}

internal class DockerRestartPolicyDto
{
    [JsonPropertyName("Name")]
    public string Name { get; set; } = string.Empty;
}

// Maps to GET /version response
internal class DockerVersionDto
{
    [JsonPropertyName("Version")]
    public string Version { get; set; } = string.Empty;

    [JsonPropertyName("ApiVersion")]
    public string ApiVersion { get; set; } = string.Empty;

    [JsonPropertyName("Os")]
    public string Os { get; set; } = string.Empty;

    [JsonPropertyName("Arch")]
    public string Arch { get; set; } = string.Empty;
}