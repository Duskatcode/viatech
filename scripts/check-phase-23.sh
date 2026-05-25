set -e

echo "Checking Phase 23 files..."

required_files=(
  "apps/api/src/audit-logs/audit-log.constants.ts"
  "apps/api/src/audit-logs/audit-logs.controller.ts"
  "apps/api/src/audit-logs/audit-logs.module.ts"
  "apps/api/src/audit-logs/audit-logs.service.ts"
  "apps/api/src/audit-logs/dto/query-audit-logs.dto.ts"
  "docs/28-backend-audit-logs.md"
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
  echo "Phase 23 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking audit registrations..."

grep -q "AuditLogsModule" apps/api/src/app.module.ts
grep -q "AuditLogsModule" apps/api/src/attachments/attachments.module.ts
grep -q "AuditLogsModule" apps/api/src/reports/reports.module.ts
grep -q "ATTACHMENT_UPLOADED" apps/api/src/attachments/attachments.service.ts
grep -q "REPORT_PDF_EXPORTED" apps/api/src/reports/reports.service.ts

echo ""
echo "Checking backend build..."

pnpm --filter @biomed/api build

echo ""
echo "Phase 23 completed successfully."
