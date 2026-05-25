set -e

echo "Checking Phase 15 files..."

required_files=(
  "apps/api/src/reports/reports.module.ts"
  "apps/api/src/reports/reports.controller.ts"
  "apps/api/src/reports/reports.service.ts"
  "apps/api/src/reports/reports-csv.util.ts"
  "apps/api/src/reports/dto/query-equipment-report.dto.ts"
  "apps/api/src/reports/dto/query-maintenance-report.dto.ts"
  "docs/20-backend-reports-api.md"
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
  echo "Phase 15 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking AppModule registration..."

grep -q "ReportsModule" apps/api/src/app.module.ts

echo ""
echo "Checking backend build..."

pnpm --filter @biomed/api build

echo ""
echo "Phase 15 completed successfully."
