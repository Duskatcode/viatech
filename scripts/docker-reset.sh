set -e

ENV_FILE="${ENV_FILE:-.env.docker}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE"
  exit 1
fi

echo "This will remove containers and volumes for this compose project."
echo "Use only when you want a clean local Docker database."
docker compose --env-file "$ENV_FILE" down -v --remove-orphans
