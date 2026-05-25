set -e

echo "Checking Phase 29 files..."

required_files=(
  "apps/web/src/services/alerts.service.ts"
  "apps/web/src/pages/DashboardPage.tsx"
  "docs/34-frontend-operational-alerts-integration.md"
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
  echo "Phase 29 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking frontend alert references..."

grep -q "alertsService" apps/web/src/pages/DashboardPage.tsx
grep -q "/alerts/summary" apps/web/src/services/alerts.service.ts
grep -q "Alertas operativas" apps/web/src/pages/DashboardPage.tsx
grep -q "Garantías próximas" apps/web/src/pages/DashboardPage.tsx

echo ""
echo "Checking frontend build..."

pnpm --filter @biomed/web build

echo ""
echo "Phase 29 completed successfully."
