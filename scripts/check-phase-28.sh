set -e

echo "Checking Phase 28 files..."

required_files=(
  "apps/api/src/alerts/alerts.controller.ts"
  "apps/api/src/alerts/alerts.module.ts"
  "apps/api/src/alerts/alerts.service.ts"
  "apps/api/src/alerts/dto/query-alerts-summary.dto.ts"
  "docs/33-backend-operational-alerts-api.md"
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
  echo "Phase 28 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking AppModule registration..."

grep -q "AlertsModule" apps/api/src/app.module.ts

echo ""
echo "Checking alerts references..."

grep -q "overdueOrders" apps/api/src/alerts/alerts.service.ts
grep -q "upcomingOrders" apps/api/src/alerts/alerts.service.ts
grep -q "warrantyExpiringEquipment" apps/api/src/alerts/alerts.service.ts
grep -q "@Controller('alerts')" apps/api/src/alerts/alerts.controller.ts

echo ""
echo "Checking backend build..."

pnpm --filter @biomed/api build

echo ""
echo "Phase 28 completed successfully."
