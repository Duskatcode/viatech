set -e

echo "Checking Phase 35 files..."

required_files=(
  "scripts/api-smoke-tests.mjs"
  "docs/40-api-smoke-tests.md"
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
  echo "Phase 35 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking smoke test references..."

grep -q "auth login" scripts/api-smoke-tests.mjs
grep -q "equipment list" scripts/api-smoke-tests.mjs
grep -q "alerts summary" scripts/api-smoke-tests.mjs
grep -q "equipment CSV download" scripts/api-smoke-tests.mjs
grep -q "maintenance order PDF download" scripts/api-smoke-tests.mjs

echo ""
echo "Checking backend build..."

pnpm --filter @biomed/api build

echo ""
echo "Phase 35 completed successfully."
echo ""
echo "Runtime smoke test is manual and requires API running:"
echo "pnpm test:api:smoke"
