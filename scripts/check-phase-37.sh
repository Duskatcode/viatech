set -e

echo "Checking Phase 37 files..."

required_files=(
  "scripts/docker-setup.sh"
  "scripts/docker-down.sh"
  "scripts/docker-logs.sh"
  "scripts/docker-reset.sh"
  "docs/42-docker-migrations-seed-workflow.md"
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
  echo "Phase 37 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking Docker workflow references..."

grep -q "prisma:migrate:deploy" scripts/docker-setup.sh
grep -q "prisma:seed" scripts/docker-setup.sh
grep -q "docker:setup" package.json
grep -q "docker:down" package.json
grep -q "docker:logs" package.json
grep -q "docker:reset" package.json

echo ""
echo "Checking API Prisma scripts..."

grep -q "prisma:migrate:deploy" apps/api/package.json
grep -q "prisma:seed" apps/api/package.json

echo ""
echo "Checking backend build..."

pnpm --filter @biomed/api build

echo ""
echo "Phase 37 completed successfully."
