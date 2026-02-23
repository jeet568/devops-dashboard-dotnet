# DevOps Dashboard — Makefile
# Usage: make <target>
# Run `make help` to see all available commands.

IMAGE_NAME = devops-dashboard
VERSION    = 1.0.0
COMPOSE    = docker-compose

.PHONY: help build run stop restart logs shell clean ps

help: ## Show this help message
	@echo "DevOps Dashboard — Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Build the Docker image
	$(COMPOSE) build --no-cache

run: ## Build and start all services
	$(COMPOSE) up --build -d
	@echo ""
	@echo "✅ DevOps Dashboard is running!"
	@echo "   Swagger UI  → http://localhost:8080"
	@echo "   Health      → http://localhost:8080/health"
	@echo ""

stop: ## Stop all running containers
	$(COMPOSE) down

restart: ## Restart all containers
	$(COMPOSE) restart

logs: ## Tail container logs (Ctrl+C to exit)
	$(COMPOSE) logs -f devops-dashboard

shell: ## Open a shell inside the running container
	docker exec -it devops-dashboard /bin/sh

clean: ## Stop containers and remove volumes (destructive!)
	$(COMPOSE) down -v --remove-orphans

ps: ## Show running container status
	$(COMPOSE) ps

health: ## Check container health status
	@curl -s http://localhost:8080/health | python3 -m json.tool || \
	 curl -s http://localhost:8080/health