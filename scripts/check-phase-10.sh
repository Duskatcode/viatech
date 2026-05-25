#!/usr/bin/env bash

set -e

echo "Checking Phase 10 files..."

required_files=(
  "apps/web/src/services/maintenance-orders.service.ts"
  "apps/web/src/services/users.service.ts"
  "apps/web/src/maintenance-orders/MaintenanceStatusBadge.tsx"
  "apps/web/src/maintenance-orders/MaintenanceOrderFormModal.tsx"
  "apps/web/src/maintenance-orders/CompleteMaintenanceOrderModal.tsx"
  "apps/web/src/pages/MaintenanceOrdersPage.tsx"
  "apps/web/src/pages/MaintenanceOrderDetailPage.tsx"
  "apps/web/src/types/domain.ts"
  "docs/16-frontend-maintenance-workflow.md"
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
  echo "Phase 10 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking frontend build..."

pnpm --filter @biomed/web build

echo ""
echo "Phase 10 completed successfully."
