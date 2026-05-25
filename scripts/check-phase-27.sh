set -e

echo "Checking Phase 27 files..."

required_files=(
  "apps/web/src/pages/DashboardPage.tsx"
  "docs/32-frontend-dashboard-operational-kpis.md"
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
  echo "Phase 27 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking dashboard references..."

grep -q "auditLogsService" apps/web/src/pages/DashboardPage.tsx
grep -q "reportsService" apps/web/src/pages/DashboardPage.tsx
grep -q "Últimos eventos críticos" apps/web/src/pages/DashboardPage.tsx
grep -q "Alertas operativas" apps/web/src/pages/DashboardPage.tsx

echo ""
echo "Checking frontend build..."

pnpm --filter @biomed/web build

echo ""
echo "Phase 27 completed successfully."
