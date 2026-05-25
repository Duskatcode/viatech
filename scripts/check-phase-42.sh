set -e

echo "Checking Phase 42 files..."

required_files=(
  "apps/web/src/pages/EquipmentPage.tsx"
  "apps/web/src/pages/EquipmentProfilePage.tsx"
  "apps/web/src/pages/MaintenanceOrdersPage.tsx"
  "apps/web/src/pages/MaintenanceOrderDetailPage.tsx"
  "apps/web/src/attachments/AttachmentsPanel.tsx"
  "docs/52-equipment-maintenance-stitch-parity.md"
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
  echo "Phase 42 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking Stitch component adoption..."

grep -q "PageHeader" apps/web/src/pages/EquipmentPage.tsx
grep -q "SectionCard\\|stitch-card" apps/web/src/pages/EquipmentProfilePage.tsx
grep -q "StatusPill\\|stitch-badge" apps/web/src/pages/MaintenanceOrdersPage.tsx
grep -q "SectionCard\\|stitch-card" apps/web/src/pages/MaintenanceOrderDetailPage.tsx
grep -q "stitch-card\\|SectionCard" apps/web/src/attachments/AttachmentsPanel.tsx

echo ""
echo "Checking frontend build..."

pnpm --filter @biomed/web build

echo ""
echo "Checking previous visual phase..."

pnpm check:phase41

echo ""
echo "Phase 42 completed successfully."
