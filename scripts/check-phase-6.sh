#!/usr/bin/env bash

set -e

echo "Checking Phase 6 files..."

required_files=(
  "apps/api/src/equipment/equipment.module.ts"
  "apps/api/src/equipment/equipment.controller.ts"
  "apps/api/src/equipment/equipment.service.ts"
  "apps/api/src/equipment/dto/create-equipment.dto.ts"
  "apps/api/src/equipment/dto/update-equipment.dto.ts"
  "apps/api/src/equipment/dto/update-equipment-status.dto.ts"
  "apps/api/src/equipment/dto/query-equipment.dto.ts"
  "docs/12-equipment-crud.md"
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
  echo "Phase 6 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking AppModule registration..."

grep -q "EquipmentModule" apps/api/src/app.module.ts

echo ""
echo "Checking backend build..."

pnpm --filter @biomed/api build

echo ""
echo "Phase 6 completed successfully."
