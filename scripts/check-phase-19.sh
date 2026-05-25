set -e

echo "Checking Phase 19 files..."

required_files=(
  "apps/api/src/attachments/attachments.constants.ts"
  "apps/api/src/attachments/attachments.controller.ts"
  "apps/api/src/attachments/attachments.module.ts"
  "apps/api/src/attachments/attachments.service.ts"
  "apps/api/src/attachments/dto/create-attachment.dto.ts"
  "docs/24-backend-attachments.md"
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
  echo "Phase 19 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking AppModule registration..."

grep -q "AttachmentsModule" apps/api/src/app.module.ts

echo ""
echo "Checking backend build..."

pnpm --filter @biomed/api build

echo ""
echo "Phase 19 completed successfully."
