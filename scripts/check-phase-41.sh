set -e

echo "Checking Phase 41 files..."

required_files=(
  "apps/web/src/pages/LoginPage.tsx"
  "apps/web/src/pages/DashboardPage.tsx"
  "docs/51-login-dashboard-stitch-parity.md"
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
  echo "Phase 41 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking Stitch parity references..."

grep -q "BioMed Control" apps/web/src/pages/LoginPage.tsx
grep -q "Institutional Precision" apps/web/src/pages/LoginPage.tsx
grep -q "stitch-input" apps/web/src/pages/LoginPage.tsx
grep -q "stitch-card" apps/web/src/pages/DashboardPage.tsx
grep -q "PageHeader" apps/web/src/pages/DashboardPage.tsx

echo ""
echo "Checking frontend build..."

pnpm --filter @biomed/web build

echo ""
echo "Checking visual base still passes..."

pnpm check:phase40

echo ""
echo "Phase 41 completed successfully."
