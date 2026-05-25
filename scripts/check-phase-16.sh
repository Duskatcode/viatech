set -e

echo "Checking Phase 16 files..."

required_files=(
  "apps/web/src/services/reports.service.ts"
  "apps/web/src/reports/report-utils.ts"
  "apps/web/src/pages/ReportsPage.tsx"
  "docs/21-frontend-reports-backend-api.md"
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
  echo "Phase 16 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking frontend build..."

pnpm --filter @biomed/web build

echo ""
echo "Phase 16 completed successfully."
