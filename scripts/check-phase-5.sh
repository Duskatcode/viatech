#!/usr/bin/env bash

set -e

echo "Checking Phase 5 files..."

required_files=(
  "apps/api/src/companies/companies.module.ts"
  "apps/api/src/companies/companies.controller.ts"
  "apps/api/src/companies/companies.service.ts"
  "apps/api/src/companies/dto/create-company.dto.ts"
  "apps/api/src/companies/dto/update-company.dto.ts"
  "apps/api/src/sites/sites.module.ts"
  "apps/api/src/sites/sites.controller.ts"
  "apps/api/src/sites/sites.service.ts"
  "apps/api/src/sites/dto/create-site.dto.ts"
  "apps/api/src/sites/dto/update-site.dto.ts"
  "apps/api/src/areas/areas.module.ts"
  "apps/api/src/areas/areas.controller.ts"
  "apps/api/src/areas/areas.service.ts"
  "apps/api/src/areas/dto/create-area.dto.ts"
  "apps/api/src/areas/dto/update-area.dto.ts"
  "docs/11-organization-crud.md"
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
  echo "Phase 5 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking AppModule registrations..."

grep -q "CompaniesModule" apps/api/src/app.module.ts
grep -q "SitesModule" apps/api/src/app.module.ts
grep -q "AreasModule" apps/api/src/app.module.ts

echo ""
echo "Checking backend build..."

pnpm --filter @biomed/api build

echo ""
echo "Phase 5 completed successfully."
