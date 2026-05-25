set -e

echo "Checking Phase 30 files..."

required_files=(
  "apps/web/src/ui/PageHeader.tsx"
  "apps/web/src/ui/ResponsiveTable.tsx"
  "apps/web/src/ui/SectionCard.tsx"
  "apps/web/src/ui/StateMessage.tsx"
  "apps/web/src/index.css"
  "apps/web/src/layout/AppLayout.tsx"
  "docs/35-frontend-responsive-ux-polish.md"
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
  echo "Phase 30 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking UX references..."

grep -q "safe-layout-width" apps/web/src/index.css
grep -q "scrollbar-width" apps/web/src/index.css
grep -q "overflow-x-hidden" apps/web/src/layout/AppLayout.tsx
grep -q "PageHeader" apps/web/src/ui/PageHeader.tsx
grep -q "ResponsiveTable" apps/web/src/ui/ResponsiveTable.tsx
grep -q "SectionCard" apps/web/src/ui/SectionCard.tsx

echo ""
echo "Checking frontend build..."

pnpm --filter @biomed/web build

echo ""
echo "Phase 30 completed successfully."
