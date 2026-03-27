.PHONY: help setup dev prod logs stop clean

help:
	@echo "╔═══════════════════════════════════════════════════════════════╗"
	@echo "║          Site Personnel - Commandes de Développement          ║"
	@echo "╚═══════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "📋 Commandes disponibles:"
	@echo "  make setup              Setup initial du projet"
	@echo "  make dev                Lancer en mode développement"
	@echo "  make prod               Lancer en mode production"
	@echo "  make build              Builder les images Docker"
	@echo "  make logs               Voir les logs"
	@echo "  make logs-backend       Voir les logs du backend"
	@echo "  make logs-frontend      Voir les logs du frontend"
	@echo "  make logs-db            Voir les logs de la base de données"
	@echo "  make stop               Arrêter les conteneurs"
	@echo "  make restart            Redémarrer les conteneurs"
	@echo "  make clean              Nettoyer tout (conteneurs + volumes)"
	@echo "  make shell-backend      Accéder au shell du backend"
	@echo "  make shell-mongodb      Accéder au shell MongoDB"
	@echo "  make install-deps       Installer les dépendances npm"
	@echo ""

setup:
	@echo "🔧 Setup initial du projet..."
	@cp .env.example .env
	@echo "✓ Copie .env créée"
	@cp backend/.env.example backend/.env 2>/dev/null || true
	@cp frontend/.env.example frontend/.env 2>/dev/null || true
	@cd backend && npm install
	@cd frontend && npm install
	@echo "✅ Setup terminé!"
	@echo ""
	@echo "⚠️  N'oublie pas de configurer tes variables dans .env"
	@echo "   Notamment: JWT_SECRET, MONGO_ROOT_PASSWORD"

dev:
	@echo "🚀 Lancement en mode développement..."
	docker-compose -f docker-compose.yml up -d
	@echo ""
	@echo "✅ Services lancés!"
	@echo "   📱 Frontend: http://localhost:4200"
	@echo "   🔌 Backend:  http://localhost:3000"
	@echo "   🗄️  MongoDB:  mongodb://localhost:27017"

prod:
	@echo "🚀 Lancement en mode production..."
	docker-compose -f docker-compose.yml up -d --build
	@echo ""
	@echo "✅ Services lancés en production!"
	@echo "   🌐 Application: http://localhost"

build:
	@echo "🔨 Construction des images Docker..."
	docker-compose build --no-cache
	@echo "✅ Build terminé!"

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-db:
	docker-compose logs -f mongodb

stop:
	@echo "⛔ Arrêt des services..."
	docker-compose down
	@echo "✅ Services arrêtés!"

restart:
	@echo "🔄 Redémarrage des services..."
	docker-compose restart
	@echo "✅ Services redémarrés!"

clean:
	@echo "🧹 Nettoyage complet..."
	docker-compose down -v
	@echo "✅ Conteneurs et volumes supprimés!"

shell-backend:
	docker-compose exec backend /bin/sh

shell-mongodb:
	docker-compose exec mongodb mongosh -u admin -p admin

install-deps:
	@echo "📦 Installation des dépendances..."
	cd backend && npm install
	cd ../frontend && npm install
	@echo "✅ Dépendances installées!"
