set -e

echo "Checking Phase 17 files..."

required_files=(
  "apps/api/src/reports/reports-excel.util.ts"
  "apps/api/src/reports/reports.controller.ts"
  "apps/api/src/reports/reports.service.ts"
  "docs/22-backend-excel-reports.md"
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
  echo "Phase 17 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking Excel endpoints..."

grep -q "equipment.xlsx" apps/api/src/reports/reports.controller.ts
grep -q "maintenance-orders.xlsx" apps/api/src/reports/reports.controller.ts
grep -q "equipmentXlsx" apps/api/src/reports/reports.service.ts
grep -q "maintenanceOrdersXlsx" apps/api/src/reports/reports.service.ts

echo ""
echo "Checking backend build..."

pnpm --filter @biomed/api build

echo ""
echo "Phase 17 completed successfully."
