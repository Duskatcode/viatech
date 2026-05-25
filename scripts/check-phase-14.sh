set -e

echo "Checking Phase 14 files..."

required_files=(
  "apps/web/src/lib/error-message.ts"
  "apps/web/src/ui/ToastProvider.tsx"
  "apps/web/src/ui/StateMessage.tsx"
  "apps/web/src/ui/ConfirmModal.tsx"
  "apps/web/src/main.tsx"
  "apps/web/src/pages/LoginPage.tsx"
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
  echo "Phase 14 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking frontend build..."

pnpm --filter @biomed/web build

echo ""
echo "Phase 14 completed successfully."
