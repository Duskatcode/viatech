set -e

echo "Checking Phase 43 files..."

required_files=(
  "apps/web/src/pages/ReportsPage.tsx"
  "apps/web/src/pages/AuditLogsPage.tsx"
  "apps/web/src/pages/OrganizationPage.tsx"
  "docs/53-reports-audit-secondary-stitch-parity.md"
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
  echo "Phase 43 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking Stitch component adoption..."

grep -q "PageHeader" apps/web/src/pages/ReportsPage.tsx
grep -q "SectionCard\\|stitch-card" apps/web/src/pages/ReportsPage.tsx
grep -q "PageHeader" apps/web/src/pages/AuditLogsPage.tsx
grep -q "ResponsiveTable\\|stitch-table" apps/web/src/pages/AuditLogsPage.tsx
grep -q "PageHeader" apps/web/src/pages/OrganizationPage.tsx
grep -q "SectionCard\\|stitch-card" apps/web/src/pages/OrganizationPage.tsx

echo ""
echo "Checking frontend build..."

pnpm --filter @biomed/web build

echo ""
echo "Checking previous visual phase..."

pnpm check:phase42

echo ""
echo "Phase 43 completed successfully."
