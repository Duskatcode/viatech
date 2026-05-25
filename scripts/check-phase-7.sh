#!/usr/bin/env bash

set -e

echo "Checking Phase 7 files..."

required_files=(
  "apps/api/src/maintenance-orders/maintenance-orders.module.ts"
  "apps/api/src/maintenance-orders/maintenance-orders.controller.ts"
  "apps/api/src/maintenance-orders/maintenance-orders.service.ts"
  "apps/api/src/maintenance-orders/dto/create-maintenance-order.dto.ts"
  "apps/api/src/maintenance-orders/dto/update-maintenance-order.dto.ts"
  "apps/api/src/maintenance-orders/dto/assign-maintenance-order.dto.ts"
  "apps/api/src/maintenance-orders/dto/complete-maintenance-order.dto.ts"
  "apps/api/src/maintenance-orders/dto/cancel-maintenance-order.dto.ts"
  "apps/api/src/maintenance-orders/dto/create-maintenance-task.dto.ts"
  "apps/api/src/maintenance-orders/dto/update-maintenance-task.dto.ts"
  "apps/api/src/maintenance-orders/dto/query-maintenance-orders.dto.ts"
  "docs/13-maintenance-orders-flow.md"
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
  echo "Phase 7 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking AppModule registration..."

grep -q "MaintenanceOrdersModule" apps/api/src/app.module.ts

echo ""
echo "Checking backend build..."

pnpm --filter @biomed/api build

echo ""
echo "Phase 7 completed successfully."
