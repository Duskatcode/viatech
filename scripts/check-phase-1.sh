#!/usr/bin/env bash

set -e

echo "Checking Phase 1 files..."

required_files=(
  "pnpm-workspace.yaml"
  "docker-compose.yml"
  ".env.example"
  "apps/api/package.json"
  "apps/api/src/main.ts"
  "apps/web/package.json"
  "apps/web/src/main.tsx"
  "packages/shared/package.json"
  "packages/shared/tsconfig.json"
  "packages/shared/src/index.ts"
  "packages/shared/src/domain/roles.ts"
  "packages/shared/src/domain/equipment-status.ts"
  "packages/shared/src/domain/maintenance-type.ts"
  "packages/shared/src/domain/maintenance-status.ts"
  "packages/shared/src/domain/permissions.ts"
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
  echo "Phase 1 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking workspace packages..."

pnpm --filter @biomed/shared check
pnpm --filter @biomed/api build
pnpm --filter @biomed/web build

echo ""
echo "Phase 1 completed successfully."
