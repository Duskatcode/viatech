set -e

echo "Checking Phase 24 files..."

required_files=(
  "apps/web/src/services/audit-logs.service.ts"
  "apps/web/src/pages/AuditLogsPage.tsx"
  "apps/web/src/App.tsx"
  "apps/web/src/layout/AppLayout.tsx"
  "docs/29-frontend-audit-logs-ui.md"
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
  echo "Phase 24 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking audit frontend references..."

grep -q "AuditLogsPage" apps/web/src/App.tsx
grep -q "auditLogsService" apps/web/src/pages/AuditLogsPage.tsx
grep -q "/audit-logs" apps/web/src/layout/AppLayout.tsx
grep -q "Auditoría" apps/web/src/layout/AppLayout.tsx

echo ""
echo "Checking frontend build..."

pnpm --filter @biomed/web build

echo ""
echo "Phase 24 completed successfully."
