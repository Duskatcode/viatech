set -e

echo "Checking Phase 21 files..."

required_files=(
  "apps/api/src/reports/reports-pdf.util.ts"
  "apps/api/src/reports/reports.controller.ts"
  "apps/api/src/reports/reports.service.ts"
  "docs/26-backend-maintenance-order-pdf.md"
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
  echo "Phase 21 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking PDF references..."

grep -q "maintenance-orders/:id.pdf" apps/api/src/reports/reports.controller.ts
grep -q "maintenanceOrderPdf" apps/api/src/reports/reports.service.ts
grep -q "buildMaintenanceOrderPdf" apps/api/src/reports/reports-pdf.util.ts

echo ""
echo "Checking backend build..."

pnpm --filter @biomed/api build

echo ""
echo "Phase 21 completed successfully."
