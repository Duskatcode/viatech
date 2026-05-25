set -e

ENV_FILE="${ENV_FILE:-.env.docker}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE"
  exit 1
fi

SERVICE="${1:-}"

if [ -z "$SERVICE" ]; then
  docker compose --env-file "$ENV_FILE" logs -f
else
  docker compose --env-file "$ENV_FILE" logs -f "$SERVICE"
fi
