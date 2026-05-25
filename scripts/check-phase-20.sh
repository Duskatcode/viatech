set -e

echo "Checking Phase 20 files..."

required_files=(
  "apps/web/src/services/attachments.service.ts"
  "apps/web/src/attachments/AttachmentsPanel.tsx"
  "apps/web/src/pages/EquipmentProfilePage.tsx"
  "apps/web/src/pages/MaintenanceOrderDetailPage.tsx"
  "docs/25-frontend-attachments-ui.md"
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
  echo "Phase 20 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking attachment references..."

grep -q "AttachmentsPanel" apps/web/src/pages/EquipmentProfilePage.tsx
grep -q "AttachmentsPanel" apps/web/src/pages/MaintenanceOrderDetailPage.tsx
grep -q "uploadEquipmentAttachment" apps/web/src/services/attachments.service.ts
grep -q "uploadMaintenanceOrderAttachment" apps/web/src/services/attachments.service.ts

echo ""
echo "Checking frontend build..."

pnpm --filter @biomed/web build

echo ""
echo "Phase 20 completed successfully."
