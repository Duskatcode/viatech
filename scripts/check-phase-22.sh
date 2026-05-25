set -e

echo "Checking Phase 22 files..."

required_files=(
  "apps/web/src/services/reports.service.ts"
  "apps/web/src/maintenance-orders/MaintenanceOrderPdfButton.tsx"
  "apps/web/src/pages/MaintenanceOrderDetailPage.tsx"
  "docs/27-frontend-maintenance-order-pdf-download.md"
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
  echo "Phase 22 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking PDF download references..."

grep -q "downloadMaintenanceOrderPdf" apps/web/src/services/reports.service.ts
grep -q "MaintenanceOrderPdfButton" apps/web/src/maintenance-orders/MaintenanceOrderPdfButton.tsx
grep -q "MaintenanceOrderPdfButton" apps/web/src/pages/MaintenanceOrderDetailPage.tsx

echo ""
echo "Checking frontend build..."

pnpm --filter @biomed/web build

echo ""
echo "Phase 22 completed successfully."
