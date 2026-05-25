#!/usr/bin/env bash

set -e

echo "Checking Phase 0 files..."

required_files=(
  "README.md"
  ".gitignore"
  "package.json"
  "docs/00-alcance.md"
  "docs/01-flujo-mvp.md"
  "docs/02-roles-y-permisos.md"
  "docs/03-entidades.md"
  "docs/04-reglas-negocio.md"
  "docs/05-backlog.md"
  "docs/06-decisiones-tecnicas.md"
  "docs/07-checklist-fase-0.md"
  "contracts/roles.ts"
  "contracts/equipment-status.ts"
  "contracts/maintenance-type.ts"
  "contracts/maintenance-status.ts"
  "contracts/permissions.ts"
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

if [ "$missing_files" -eq 0 ]; then
  echo ""
  echo "Phase 0 completed successfully."
  exit 0
else
  echo ""
  echo "Phase 0 is incomplete. Missing files: $missing_files"
  exit 1
fi
