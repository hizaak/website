.PHONY: help setup env dev-db prod build logs logs-backend logs-frontend logs-db stop restart clean shell-backend shell-mongodb lint test

help:
	@echo "Available commands:"
	@echo "  make setup          Install dependencies and configure the .env files"
	@echo "  make env            Configure the .env files (secrets and passwords)"
	@echo "  make dev-db         Start the development MongoDB (backend/docker-compose.yml)"
	@echo "  make prod           Build and start production, waiting for the health checks"
	@echo "  make build          Rebuild the Docker images"
	@echo "  make logs           Follow the logs (logs-backend, logs-frontend, logs-db)"
	@echo "  make stop           Stop the containers"
	@echo "  make restart        Restart the containers"
	@echo "  make clean          Remove containers AND volumes (erases the database!)"
	@echo "  make shell-backend  Shell in the backend container"
	@echo "  make shell-mongodb  mongosh in the MongoDB container"
	@echo "  make lint           Lint the backend and the frontend"
	@echo "  make test           Run the backend and frontend tests"

setup:
	bash setup.sh

env:
	bash configure-env.sh

dev-db:
	docker compose -f backend/docker-compose.yml up -d

prod:
	docker compose up -d --build --wait

build:
	docker compose build --no-cache

logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

logs-frontend:
	docker compose logs -f frontend

logs-db:
	docker compose logs -f mongodb

stop:
	docker compose down

restart:
	docker compose restart

clean:
	docker compose down -v

shell-backend:
	docker compose exec backend /bin/sh

# Credentials from the root .env.
shell-mongodb:
	docker compose exec mongodb sh -c 'mongosh -u "$$MONGO_INITDB_ROOT_USERNAME" -p "$$MONGO_INITDB_ROOT_PASSWORD"'

lint:
	npm run lint

test:
	npm test
