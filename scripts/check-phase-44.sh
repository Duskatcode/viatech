set -e

echo "Checking Phase 44 files..."

required_files=(
  "docs/54-security-hardening-audit.md"
  "docs/55-production-readiness-checklist.md"
  "scripts/security-hardening-audit.mjs"
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
  echo "Phase 44 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking security documentation references..."

grep -q "JWT_ACCESS_SECRET" docs/54-security-hardening-audit.md
grep -q "CORS" docs/54-security-hardening-audit.md
grep -q "Helmet" docs/54-security-hardening-audit.md
grep -q "Nginx" docs/54-security-hardening-audit.md
grep -q "Production Readiness" docs/55-production-readiness-checklist.md
grep -q "Swagger" docs/55-production-readiness-checklist.md

echo ""
echo "Running security audit script..."

node scripts/security-hardening-audit.mjs

echo ""
echo "Checking backend build..."

pnpm --filter @biomed/api build

echo ""
echo "Checking frontend build..."

pnpm --filter @biomed/web build

echo ""
echo "Checking previous visual phase..."

pnpm check:phase43

echo ""
echo "Phase 44 completed successfully."
