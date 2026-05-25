set -e

echo "Checking Phase 32 files..."

required_files=(
  "apps/web/src/pages/AuditLogsPage.tsx"
  "apps/web/src/attachments/AttachmentsPanel.tsx"
  "apps/web/src/index.css"
  "docs/37-frontend-mobile-tables-list-views.md"
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
  echo "Phase 32 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking mobile list references..."

grep -q "Vista móvil de auditoría" apps/web/src/pages/AuditLogsPage.tsx
grep -q "Vista móvil de adjuntos" apps/web/src/attachments/AttachmentsPanel.tsx
grep -q "lg:hidden" apps/web/src/pages/AuditLogsPage.tsx
grep -q "lg:hidden" apps/web/src/attachments/AttachmentsPanel.tsx

echo ""
echo "Checking frontend build..."

pnpm --filter @biomed/web build

echo ""
echo "Phase 32 completed successfully."
