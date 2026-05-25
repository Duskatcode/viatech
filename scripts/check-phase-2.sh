#!/usr/bin/env bash

set -e

echo "Checking Phase 2 files..."

required_files=(
  "apps/api/src/main.ts"
  "apps/api/src/app.module.ts"
  "apps/api/src/config/app.config.ts"
  "apps/api/src/config/env.validation.ts"
  "apps/api/src/common/constants/api.constants.ts"
  "apps/api/src/health/health.module.ts"
  "apps/api/src/health/health.controller.ts"
  "apps/api/src/health/health.service.ts"
  "apps/api/src/health/health.types.ts"
  "apps/api/.env.example"
  "docs/08-backend-base.md"
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
  echo "Phase 2 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking backend build..."

pnpm --filter @biomed/api build

echo ""
echo "Phase 2 completed successfully."
