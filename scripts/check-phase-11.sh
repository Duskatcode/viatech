#!/usr/bin/env bash

set -e

echo "Checking Phase 11 files..."

required_files=(
  "apps/web/src/dashboard/dashboard-utils.ts"
  "apps/web/src/dashboard/MetricCard.tsx"
  "apps/web/src/dashboard/StatusDistribution.tsx"
  "apps/web/src/dashboard/EquipmentAlerts.tsx"
  "apps/web/src/dashboard/RecentMaintenanceOrders.tsx"
  "apps/web/src/pages/DashboardPage.tsx"
  "docs/17-dashboard-metrics.md"
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
  echo "Phase 11 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking frontend build..."

pnpm --filter @biomed/web build

echo ""
echo "Phase 11 completed successfully."
