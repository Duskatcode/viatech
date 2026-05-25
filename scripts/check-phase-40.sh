set -e

echo "Checking Phase 40 files..."

required_files=(
  "apps/web/src/layout/AppLayout.tsx"
  "apps/web/src/ui/PageHeader.tsx"
  "apps/web/src/ui/SectionCard.tsx"
  "apps/web/src/ui/ResponsiveTable.tsx"
  "apps/web/src/ui/StatusPill.tsx"
  "apps/web/src/ui/ActionButton.tsx"
  "apps/web/src/ui/FilterBar.tsx"
  "docs/50-stitch-design-tokens-layout-base.md"
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
  echo "Phase 40 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking Stitch token references..."

grep -q -- "--stitch-primary: #003f87" apps/web/src/index.css
grep -q -- "--stitch-sidebar-bg: #1b1e21" apps/web/src/index.css
grep -q -- "--stitch-sidebar-width: 260px" apps/web/src/index.css
grep -q "stitch-sidebar" apps/web/src/layout/AppLayout.tsx
grep -q "BioMed Control" apps/web/src/layout/AppLayout.tsx
grep -q "Institutional Precision" apps/web/src/layout/AppLayout.tsx
grep -q "stitch-badge" apps/web/src/ui/StatusPill.tsx
grep -q "stitch-card" apps/web/src/ui/SectionCard.tsx
grep -q "stitch-table" apps/web/src/ui/ResponsiveTable.tsx

echo ""
echo "Checking frontend build..."

pnpm --filter @biomed/web build

echo ""
echo "Phase 40 completed successfully."
