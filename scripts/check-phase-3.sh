#!/usr/bin/env bash

set -e

echo "Checking Phase 3 files..."

required_files=(
  "apps/api/prisma.config.ts"
  "apps/api/prisma/schema.prisma"
  "apps/api/prisma/seed.ts"
  "apps/api/src/database/database.module.ts"
  "apps/api/src/database/prisma.service.ts"
  "apps/api/src/generated/prisma/client.ts"
  "docs/09-database-prisma.md"
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
  echo "Phase 3 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking backend build..."

pnpm --filter @biomed/api prisma:generate
pnpm --filter @biomed/api build

echo ""
echo "Phase 3 completed successfully."
