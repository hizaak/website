.PHONY: help setup dev-db prod build logs logs-backend logs-frontend logs-db stop restart clean shell-backend shell-mongodb lint test

help:
	@echo "Commandes disponibles :"
	@echo "  make setup          Installer les dépendances et créer les fichiers .env"
	@echo "  make dev-db         Lancer le MongoDB de développement (backend/docker-compose.yml)"
	@echo "  make prod           Construire et lancer la production, en attendant les healthchecks"
	@echo "  make build          Reconstruire les images Docker"
	@echo "  make logs           Voir les logs (logs-backend, logs-frontend, logs-db)"
	@echo "  make stop           Arrêter les conteneurs"
	@echo "  make restart        Redémarrer les conteneurs"
	@echo "  make clean          Supprimer conteneurs ET volumes (efface la base !)"
	@echo "  make shell-backend  Shell dans le conteneur backend"
	@echo "  make shell-mongodb  mongosh dans le conteneur MongoDB"
	@echo "  make lint           Linter le backend et le frontend"
	@echo "  make test           Lancer les tests du backend et du frontend"

setup:
	npm run setup

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
