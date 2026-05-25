set -e

echo "Checking Phase 34 files..."

required_files=(
  "scripts/backend-critical-checks.mjs"
  "docs/39-backend-critical-regression-checks.md"
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
  echo "Phase 34 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Running backend critical regression checks..."

node scripts/backend-critical-checks.mjs

echo ""
echo "Checking backend build..."

pnpm --filter @biomed/api build

echo ""
echo "Phase 34 completed successfully."
