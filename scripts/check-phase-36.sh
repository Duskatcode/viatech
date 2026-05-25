set -e

echo "Checking Phase 36 files..."

required_files=(
  ".dockerignore"
  "docker-compose.yml"
  ".env.docker.example"
  "apps/api/Dockerfile"
  "apps/web/Dockerfile"
  "apps/web/nginx.conf"
  "docs/41-docker-local-production-deployment.md"
)

missing_files=0

for file in "${required_files[@]}"; do
  if [ -f "$file" ]; then
    echo "OK: $file"
  else
    echo "MISSING: $file"
    missing_files=$((missing_files + 1))
  fi
done

if [ "$missing_files" -ne 0 ]; then
  echo ""
  echo "Phase 36 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking Docker references..."

grep -q "postgres" docker-compose.yml
grep -q "biomed-api" docker-compose.yml
grep -q "biomed-web" docker-compose.yml
grep -q "proxy_pass http://api:3000/api/v1/" apps/web/nginx.conf
grep -q "pnpm --filter @biomed/api build" apps/api/Dockerfile
grep -q "pnpm --filter @biomed/web build" apps/web/Dockerfile

echo ""
echo "Checking backend build..."

pnpm --filter @biomed/api build

echo ""
echo "Checking frontend build..."

pnpm --filter @biomed/web build

echo ""
echo "Phase 36 completed successfully."
