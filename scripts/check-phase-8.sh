#!/usr/bin/env bash

set -e

echo "Checking Phase 8 files..."

required_files=(
  "apps/web/src/App.tsx"
  "apps/web/src/main.tsx"
  "apps/web/src/index.css"
  "apps/web/src/lib/api.ts"
  "apps/web/src/lib/auth-storage.ts"
  "apps/web/src/auth/AuthProvider.tsx"
  "apps/web/src/auth/useAuth.ts"
  "apps/web/src/auth/ProtectedRoute.tsx"
  "apps/web/src/layout/AppLayout.tsx"
  "apps/web/src/pages/LoginPage.tsx"
  "apps/web/src/pages/DashboardPage.tsx"
  "apps/web/src/pages/EquipmentPage.tsx"
  "apps/web/src/pages/MaintenanceOrdersPage.tsx"
  "apps/web/src/pages/OrganizationPage.tsx"
  "apps/web/src/types/auth.ts"
  "apps/web/src/types/domain.ts"
  "docs/14-frontend-base-auth-layout.md"
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
  echo "Phase 8 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking frontend build..."

pnpm --filter @biomed/web build

echo ""
echo "Phase 8 completed successfully."
