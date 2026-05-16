.PHONY: help build up down logs logs-backend logs-frontend restart clean rebuild shell-backend shell-frontend

help:
	@echo "RepaySignal Docker Commands"
	@echo ""
	@echo "  make build              - Build Docker images"
	@echo "  make up                 - Start all services"
	@echo "  make up-d               - Start services in detached mode"
	@echo "  make down               - Stop all services"
	@echo "  make down-v             - Stop services and remove volumes"
	@echo "  make logs               - View logs from all services"
	@echo "  make logs-backend       - View backend logs"
	@echo "  make logs-frontend      - View frontend logs"
	@echo "  make restart            - Restart all services"
	@echo "  make restart-backend    - Restart backend service"
	@echo "  make restart-frontend   - Restart frontend service"
	@echo "  make rebuild            - Rebuild images and start services"
	@echo "  make clean              - Remove containers, networks, and volumes"
	@echo "  make shell-backend      - Access backend container shell"
	@echo "  make shell-frontend     - Access frontend container shell"
	@echo "  make status             - Show running container status"
	@echo "  make ps                 - List running containers"

build:
	docker-compose build

up:
	docker-compose up

up-d:
	docker-compose up -d

down:
	docker-compose down

down-v:
	docker-compose down -v

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

restart:
	docker-compose restart

restart-backend:
	docker-compose restart backend

restart-frontend:
	docker-compose restart frontend

rebuild:
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d

clean:
	docker-compose down -v
	docker system prune -f

shell-backend:
	docker-compose exec backend bash

shell-frontend:
	docker-compose exec frontend sh

status:
	docker-compose ps

ps:
	docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
