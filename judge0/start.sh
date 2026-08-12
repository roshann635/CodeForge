#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

echo "=== CodeForge Judge0 Setup ==="

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker not found. Install: https://docs.docker.com/engine/install/"
  exit 1
fi

if [ ! -f judge0.conf ]; then
  cp judge0.conf.example judge0.conf
  echo "Created judge0.conf — edit passwords before production."
fi

echo "Starting PostgreSQL and Redis..."
docker compose up -d db redis
sleep 15

echo "Starting Judge0 server and workers..."
docker compose up -d
sleep 10

echo "Checking Judge0 health..."
curl -sf http://localhost:2358/about | head -c 500 || echo "Not ready yet — run: docker compose logs -f server"

echo ""
echo "Add to server/.env:"
echo "  JUDGE0_URL=http://localhost:2358"
echo "  JUDGE0_AUTH_TOKEN=codeforge_judge0_local_token"
echo ""
echo "API docs: http://localhost:2358/docs"
echo "Test:     cd ../server && node scripts/testJudge0.js"
