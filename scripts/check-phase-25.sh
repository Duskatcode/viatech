set -e

echo "Checking Phase 25 files..."

required_files=(
  "apps/api/src/audit-logs/audit-log.constants.ts"
  "apps/api/src/audit-logs/audit-logs.service.ts"
  "apps/api/src/reports/reports.service.ts"
  "docs/30-backend-expanded-audit-coverage.md"
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
  echo "Phase 25 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking audit constants..."

grep -q "REPORT_CSV_EXPORTED" apps/api/src/audit-logs/audit-log.constants.ts
grep -q "REPORT_XLSX_EXPORTED" apps/api/src/audit-logs/audit-log.constants.ts
grep -q "EQUIPMENT_CREATED" apps/api/src/audit-logs/audit-log.constants.ts
grep -q "MAINTENANCE_ORDER_COMPLETED" apps/api/src/audit-logs/audit-log.constants.ts
grep -q "safeCreate" apps/api/src/audit-logs/audit-logs.service.ts

echo ""
echo "Checking report export audit coverage..."

grep -q "REPORT_CSV_EXPORTED" apps/api/src/reports/reports.service.ts
grep -q "REPORT_XLSX_EXPORTED" apps/api/src/reports/reports.service.ts

echo ""
echo "Checking backend build..."

pnpm --filter @biomed/api build

echo ""
echo "Phase 25 completed successfully."
