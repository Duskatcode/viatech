set -e

echo "Checking Phase 18 files..."

required_files=(
  "apps/web/src/services/reports.service.ts"
  "apps/web/src/pages/ReportsPage.tsx"
  "docs/23-frontend-excel-report-downloads.md"
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
  echo "Phase 18 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking Excel download references..."

grep -q "downloadEquipmentXlsx" apps/web/src/services/reports.service.ts
grep -q "downloadMaintenanceOrdersXlsx" apps/web/src/services/reports.service.ts
grep -q "handleDownloadEquipmentXlsx" apps/web/src/pages/ReportsPage.tsx
grep -q "handleDownloadOrdersXlsx" apps/web/src/pages/ReportsPage.tsx

echo ""
echo "Checking frontend build..."

pnpm --filter @biomed/web build

echo ""
echo "Phase 18 completed successfully."
