using System.Net.Sockets;
using System.Runtime.InteropServices;

namespace DevOpsDashboard.API.Helpers;

public static class DockerSocketHandler
{
    // Returns a configured SocketsHttpHandler that connects via
    // the Docker Unix socket (Linux/macOS) or named pipe (Windows)
    public static SocketsHttpHandler Create()
    {
        var handler = new SocketsHttpHandler();

        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
        {
            // Windows: Docker named pipe
            handler.ConnectCallback = async (context, cancellationToken) =>
            {
                var socket = new Socket(
                    AddressFamily.Unix,
                    SocketType.Stream,
                    ProtocolType.Unspecified);

                var endpoint = new UnixDomainSocketEndPoint(
                    @"\\.\pipe\docker_engine");

                await socket.ConnectAsync(endpoint, cancellationToken);
                return new NetworkStream(socket, ownsSocket: true);
            };
        }
        else
        {
            // Linux / macOS: Docker Unix socket
            handler.ConnectCallback = async (context, cancellationToken) =>
            {
                var socket = new Socket(
                    AddressFamily.Unix,
                    SocketType.Stream,
                    ProtocolType.Unspecified);

                var endpoint = new UnixDomainSocketEndPoint("/var/run/docker.sock");

                await socket.ConnectAsync(endpoint, cancellationToken);
                return new NetworkStream(socket, ownsSocket: true);
            };
        }

        return handler;
    }
}   