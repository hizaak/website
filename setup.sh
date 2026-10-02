#!/bin/bash
# First setup of a development machine.
set -e

cd "$(dirname "$0")"

if ! docker compose version > /dev/null 2>&1; then
    echo "Docker (with docker compose) is not installed: https://docs.docker.com/get-docker/"
    exit 1
fi

npm run setup:deps
bash configure-env.sh

echo ""
echo "Ready:"
echo "  make dev-db              Development MongoDB"
echo "  npm run dev:backend      API on http://localhost:3000"
echo "  npm run dev:frontend     Site on http://localhost:4200"
