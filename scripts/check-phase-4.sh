#!/usr/bin/env bash

set -e

echo "Checking Phase 4 files..."

required_files=(
  "apps/api/src/auth/auth.module.ts"
  "apps/api/src/auth/auth.controller.ts"
  "apps/api/src/auth/auth.service.ts"
  "apps/api/src/auth/dto/login.dto.ts"
  "apps/api/src/auth/dto/refresh-token.dto.ts"
  "apps/api/src/auth/types/auth-user.type.ts"
  "apps/api/src/auth/types/jwt-payload.type.ts"
  "apps/api/src/auth/types/request-with-user.type.ts"
  "apps/api/src/users/users.module.ts"
  "apps/api/src/users/users.controller.ts"
  "apps/api/src/users/users.service.ts"
  "apps/api/src/common/decorators/current-user.decorator.ts"
  "apps/api/src/common/decorators/roles.decorator.ts"
  "apps/api/src/common/guards/jwt-auth.guard.ts"
  "apps/api/src/common/guards/roles.guard.ts"
  "docs/10-auth-users-rbac.md"
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
  echo "Phase 4 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking backend build..."

pnpm --filter @biomed/api prisma:generate
pnpm --filter @biomed/api build

echo ""
echo "Phase 4 completed successfully."
