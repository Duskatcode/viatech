set -e

echo "Checking Phase 31 files..."

required_files=(
  "apps/web/src/ui/PageHeader.tsx"
  "apps/web/src/ui/ResponsiveTable.tsx"
  "apps/web/src/ui/SectionCard.tsx"
  "apps/web/src/pages/DashboardPage.tsx"
  "apps/web/src/pages/AuditLogsPage.tsx"
  "docs/36-frontend-ui-component-adoption.md"
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
  echo "Phase 31 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking shared component adoption..."

grep -q "PageHeader" apps/web/src/pages/DashboardPage.tsx
grep -q "PageHeader" apps/web/src/pages/AuditLogsPage.tsx
grep -q "SectionCard" apps/web/src/pages/AuditLogsPage.tsx

echo ""
echo "Checking frontend build..."

pnpm --filter @biomed/web build

echo ""
echo "Phase 31 completed successfully."
