set -e

ENV_FILE="${ENV_FILE:-.env.docker}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE"
  echo "Create it with:"
  echo "cp .env.docker.example .env.docker"
  exit 1
fi

set -a
. "$ENV_FILE"
set +a

API_PORT="${API_PORT:-3001}"
WEB_PORT="${WEB_PORT:-8081}"

echo "Starting Docker services..."
docker compose --env-file "$ENV_FILE" up -d --build

echo ""
echo "Waiting for API container..."
sleep 4

echo ""
echo "Running Prisma migrate deploy..."
docker compose --env-file "$ENV_FILE" exec -T api pnpm --filter @biomed/api prisma:migrate:deploy

echo ""
echo "Running Prisma seed..."
docker compose --env-file "$ENV_FILE" exec -T api pnpm --filter @biomed/api prisma:seed

echo ""
echo "Checking API health..."
curl -fsS "http://localhost:${API_PORT}/api/v1/health"
echo ""

echo ""
echo "Checking database health..."
curl -fsS "http://localhost:${API_PORT}/api/v1/health/database"
echo ""

echo ""
echo "Docker setup completed."
echo "Web: http://localhost:${WEB_PORT}"
echo "API: http://localhost:${API_PORT}/api/v1"
