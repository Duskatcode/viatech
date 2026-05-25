#!/usr/bin/env bash

set -e

echo "Checking Phase 12 files..."

required_files=(
  "apps/web/src/organization/CompanyFormModal.tsx"
  "apps/web/src/organization/SiteFormModal.tsx"
  "apps/web/src/organization/AreaFormModal.tsx"
  "apps/web/src/pages/OrganizationPage.tsx"
  "apps/web/src/services/organization.service.ts"
  "apps/web/src/types/domain.ts"
  "docs/18-frontend-organization-crud.md"
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
  echo "Phase 12 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking frontend build..."

pnpm --filter @biomed/web build

echo ""
echo "Phase 12 completed successfully."
