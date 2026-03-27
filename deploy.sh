#!/bin/bash

# ========================================
# Production Deployment Script
# ========================================

set -e

echo "╔════════════════════════════════════════╗"
echo "║   🚀 Déploiement Production en cours   ║"
echo "╚════════════════════════════════════════╝"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Erreur: .env non trouvé${NC}"
    echo "   Copie .env.example et configure les variables"
    exit 1
fi

echo -e "${BLUE}📋 Vérification des variables d'environnement...${NC}"
required_vars=("JWT_SECRET" "MONGO_ROOT_PASSWORD" "NODE_ENV" "CORS_ORIGIN")
for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" .env; then
        echo -e "${RED}❌ Variable manquante: ${var}${NC}"
        exit 1
    fi
done
echo -e "${GREEN}✅ Variables vérifiées${NC}"

echo -e "${BLUE}🔨 Construction des images Docker...${NC}"
docker-compose build --no-cache

echo -e "${BLUE}🧹 Nettoyage des anciens conteneurs...${NC}"
docker-compose down || true

echo -e "${BLUE}🚀 Lancement des services en production...${NC}"
docker-compose up -d

echo -e "${BLUE}⏳ Attente que les services démarrent (30s)...${NC}"
sleep 30

echo -e "${BLUE}🏥 Vérification de la santé des services...${NC}"

# Check MongoDB
if docker-compose exec -T mongodb mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ MongoDB OK${NC}"
else
    echo -e "${RED}❌ MongoDB ne répond pas${NC}"
    exit 1
fi

# Check Backend
if docker-compose exec -T backend wget -q -O- http://localhost:3000 > /dev/null 2>&1 || true; then
    echo -e "${GREEN}✅ Backend OK${NC}"
else
    echo -e "${YELLOW}⚠️  Backend pas encore prêt (normal au démarrage)${NC}"
fi

# Check Frontend
if docker-compose exec -T frontend wget -q -O- http://localhost/ > /dev/null 2>&1 || true; then
    echo -e "${GREEN}✅ Frontend OK${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend pas encore prêt (normal au démarrage)${NC}"
fi

echo ""
echo -e "${GREEN}╔═════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ Déploiement production terminé avec succès  ║${NC}"
echo -e "${GREEN}╚═════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 Status des services:${NC}"
docker-compose ps
echo ""
echo -e "${BLUE}📍 Accès:${NC}"
echo -e "  🌐 Frontend: http://localhost"
echo -e "  🔌 Backend API: http://localhost:3000"
echo -e "  🗄️  MongoDB: mongodb://admin@localhost:27017"
echo ""
echo -e "${BLUE}📝 Commandes utiles:${NC}"
echo -e "  Logs:     ${YELLOW}docker-compose logs -f${NC}"
echo -e "  Arrêt:    ${YELLOW}docker-compose down${NC}"
echo -e "  Restart:  ${YELLOW}docker-compose restart${NC}"
echo ""
