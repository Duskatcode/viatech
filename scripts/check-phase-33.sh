set -e

echo "Checking Phase 33 files..."

required_files=(
  "apps/web/src/ui/FieldFeedback.tsx"
  "apps/web/src/ui/SubmitButton.tsx"
  "apps/web/src/lib/form-validation.ts"
  "apps/web/src/attachments/AttachmentsPanel.tsx"
  "apps/web/src/pages/LoginPage.tsx"
  "apps/web/src/index.css"
  "docs/38-frontend-forms-validation-ux.md"
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
  echo "Phase 33 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking form UX references..."

grep -q "FieldError" apps/web/src/attachments/AttachmentsPanel.tsx
grep -q "SubmitButton" apps/web/src/attachments/AttachmentsPanel.tsx
grep -q "validateFileSize" apps/web/src/attachments/AttachmentsPanel.tsx
grep -q "form-input-base" apps/web/src/index.css
grep -q "autoComplete" apps/web/src/pages/LoginPage.tsx

echo ""
echo "Checking frontend build..."

pnpm --filter @biomed/web build

echo ""
echo "Phase 33 completed successfully."
