#!/bin/bash

# ========================================
# Getting Started Script
# ========================================

echo "╔════════════════════════════════════════╗"
echo "║    🎉 Bienvenue dans Site Personnel!    ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    echo "   Installe Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé"
    echo "   Installe Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker et Docker Compose trouvés"
echo ""

# Copy .env files if not exist
if [ ! -f .env ]; then
    echo "📝 Création du fichier .env..."
    cp .env.example .env
    echo "   ⚠️  N'oublie pas de configurer les variables sensibles dans .env"
fi

if [ ! -f backend/.env ]; then
    echo "📝 Création du fichier backend/.env..."
    cp backend/.env.example backend/.env
fi

if [ ! -f frontend/.env ]; then
    echo "📝 Création du fichier frontend/.env..."
    cp frontend/.env.example frontend/.env
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║             🚀 Prêt pour le développement!                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📖 Commandes utiles:"
echo ""
echo "   make help           Voir toutes les commandes"
echo "   make setup          Setup complet du projet"
echo "   make dev            Lancer en développement"
echo "   make prod           Lancer en production"
echo ""
echo "   npm run dev         Alternative: lancer avec npm"
echo ""
echo "📍 Accès après lancement:"
echo "   Frontend:    http://localhost:4200"
echo "   Backend:     http://localhost:3000"
echo "   MongoDB:     mongodb://localhost:27017"
echo ""
echo "📚 Documentation:"
echo "   Lire:     README.md"
echo "   Déployer: DEPLOYMENT.md"
echo "   Contribuer: CONTRIBUTING.md"
echo ""
echo "🚀 Prêt? Lance: make dev"
echo ""
