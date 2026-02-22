# 🚀 DevOps Dashboard

A production-grade DevOps monitoring backend built with **ASP.NET Core 9**, containerized with **Docker**, and shipped via **GitHub Actions CI/CD**.

[![CI/CD Pipeline](https://github.com/jeet568/devops-dashboard-dotnet/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/jeet568/devops-dashboard-dotnet/actions/workflows/ci-cd.yml)
[![Security Scan](https://github.com/jeet568/devops-dashboard-dotnet/actions/workflows/security.yml/badge.svg)](https://github.com/jeet568/devops-dashboard-dotnet/actions/workflows/security.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ Features

- 📊 **System Monitoring** — Real-time CPU, RAM, and disk metrics
- 🐳 **Docker Monitoring** — Live container list, inspect, start/stop via Unix socket
- 📋 **Deployment Tracking** — Full CRUD for deployment records with JSON persistence
- ❤️ **Health Checks** — Liveness, readiness, and detailed health endpoints
- 📖 **Swagger UI** — Interactive API documentation at root URL
- 🔒 **Security Scanning** — Automated Trivy vulnerability scans via GitHub Actions
- 🏗️ **Multi-stage Docker Build** — Lean 120MB runtime image (vs 850MB SDK image)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | ASP.NET Core 9 |
| Language | C# 13 |
| Containerization | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Registry | GitHub Container Registry (GHCR) |
| API Docs | Swagger / OpenAPI |
| Security | Trivy vulnerability scanner |
| Storage | JSON file (swappable via DI) |

---

## 🏃 Quick Start

### Prerequisites
- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Run Locally
```bash
git clone https://github.com/jeet568/devops-dashboard-dotnet.git
cd devops-dashboard-dotnet
dotnet run
```
Open: http://localhost:5000

### Run with Docker
```bash
docker build -t devops-dashboard:latest .
docker run -d --name devops-dashboard -p 8080:8080 devops-dashboard:latest
```
Open: http://localhost:8080

### Run with Docker Compose
```bash
docker-compose up --build -d
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Swagger UI |
| GET | `/health` | Health check |
| GET | `/api/health/live` | Liveness probe |
| GET | `/api/health/ready` | Readiness probe |
| GET | `/api/system/status` | CPU, RAM, disk metrics |
| GET | `/api/docker/containers` | List all containers |
| GET | `/api/docker/containers/{id}` | Inspect container |
| POST | `/api/docker/containers/{id}/stop` | Stop container |
| GET | `/api/deployments` | List deployments |
| POST | `/api/deployments` | Create deployment |
| PUT | `/api/deployments/{id}` | Update deployment |
| DELETE | `/api/deployments/{id}` | Delete deployment |

---

## 🏗️ Project Structure

```
devops-dashboard-dotnet/
├── Controllers/          # API controllers
├── Services/             # Business logic (ISystemMonitorService, etc.)
├── Models/               # Request/Response models
├── Configurations/       # AppSettings binding
├── Helpers/              # Utility classes
├── Docker/               # Docker health check scripts
├── Data/                 # JSON storage
├── Logs/                 # Application logs
├── .github/workflows/    # CI/CD pipeline definitions
├── Dockerfile            # Multi-stage Docker build
├── docker-compose.yml    # Local orchestration
└── Program.cs            # Application entry point
```

---

## 💡 Design Decisions

**Why JSON storage instead of a database?**
The `IDeploymentService` interface hides the storage backend completely. Swapping JSON for PostgreSQL or MongoDB requires changing exactly one line in `Program.cs`. JSON storage makes the project runnable with zero external dependencies — ideal for a portfolio project.

**Why Unix socket for Docker monitoring?**
The Docker Engine API is exposed locally via `/var/run/docker.sock`. Talking to it directly with a custom `SocketsHttpHandler` avoids adding a Docker SDK dependency and mirrors how tools like Portainer work internally.

**Why multi-stage Docker builds?**
The SDK image is ~850MB. The runtime image is ~120MB. Multi-stage builds compile in the first stage and copy only the output to the second stage — no build tools, no source code, smaller attack surface.

**Why SemaphoreSlim in DeploymentService?**
JSON file storage has no built-in concurrency protection. Two simultaneous POST requests could overwrite each other. `SemaphoreSlim(1,1)` serializes writes at the application level — the simplest correct solution for this storage tier.

**Why three health endpoints?**
Kubernetes needs a simple 200/503 signal. Developers need context — which check failed, what the metrics were, how long it took. Splitting them serves both without compromise.

---

## 🗺️ Roadmap

- [ ] Add xUnit test project with service unit tests
- [ ] Add PostgreSQL support via second `IDeploymentService` implementation
- [ ] Add JWT authentication
- [ ] Build a React frontend dashboard
- [ ] Add Prometheus metrics endpoint (`/metrics`)
- [ ] Kubernetes deployment manifests (`k8s/`)
- [ ] Webhook notifications on deployment status change

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## 👤 Author

Built by **jeet568** as a DevOps portfolio project demonstrating:

- ASP.NET Core 9 Clean Architecture
- Docker multi-stage builds and container monitoring
- GitHub Actions CI/CD pipeline design
- REST API design with Swagger documentation
- Production-ready patterns: health checks, structured logging, graceful degradation

---

> *"Good DevOps is invisible — things just work. This dashboard makes the invisible visible."*
👤 Author
Built by Jeet as a DevOps portfolio project demonstrating: