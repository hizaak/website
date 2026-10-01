#!/bin/bash
# First setup of a development machine.
set -e

if ! docker compose version > /dev/null 2>&1; then
    echo "Docker (avec docker compose) n'est pas installé : https://docs.docker.com/get-docker/"
    exit 1
fi

npm run setup

echo ""
echo "Prêt. Renseigne les secrets dans .env et backend/.env, puis :"
echo "  make dev-db              MongoDB de développement"
echo "  npm run dev:backend      API sur http://localhost:3000"
echo "  npm run dev:frontend     Site sur http://localhost:4200"
