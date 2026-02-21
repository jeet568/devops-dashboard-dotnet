using Microsoft.AspNetCore.Mvc;

namespace DevOpsDashboard.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public abstract class BaseController : ControllerBase
{
}