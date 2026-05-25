#!/usr/bin/env bash

set -e

echo "Checking Phase 9 files..."

required_files=(
  "apps/web/src/services/equipment.service.ts"
  "apps/web/src/services/organization.service.ts"
  "apps/web/src/equipment/EquipmentStatusBadge.tsx"
  "apps/web/src/equipment/EquipmentFormModal.tsx"
  "apps/web/src/equipment/EquipmentStatusModal.tsx"
  "apps/web/src/pages/EquipmentPage.tsx"
  "apps/web/src/pages/EquipmentProfilePage.tsx"
  "apps/web/src/types/domain.ts"
  "docs/15-frontend-equipment-crud.md"
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
  echo "Phase 9 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking frontend build..."

pnpm --filter @biomed/web build

echo ""
echo "Phase 9 completed successfully."
