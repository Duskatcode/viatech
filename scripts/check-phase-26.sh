set -e

echo "Checking Phase 26 files..."

required_files=(
  "apps/api/src/equipment/equipment.service.ts"
  "apps/api/src/maintenance-orders/maintenance-orders.service.ts"
  "docs/31-backend-domain-audit-completion.md"
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
  echo "Phase 26 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking equipment audit coverage..."

grep -q "EQUIPMENT_CREATED" apps/api/src/equipment/equipment.service.ts
grep -q "EQUIPMENT_UPDATED" apps/api/src/equipment/equipment.service.ts
grep -q "EQUIPMENT_STATUS_CHANGED" apps/api/src/equipment/equipment.service.ts
grep -q "EQUIPMENT_RETIRED" apps/api/src/equipment/equipment.service.ts

echo ""
echo "Checking maintenance order audit coverage..."

grep -q "MAINTENANCE_ORDER_CREATED" apps/api/src/maintenance-orders/maintenance-orders.service.ts
grep -q "MAINTENANCE_ORDER_STARTED" apps/api/src/maintenance-orders/maintenance-orders.service.ts
grep -q "MAINTENANCE_ORDER_COMPLETED" apps/api/src/maintenance-orders/maintenance-orders.service.ts
grep -q "MAINTENANCE_ORDER_CANCELLED" apps/api/src/maintenance-orders/maintenance-orders.service.ts

echo ""
echo "Checking backend build..."

pnpm --filter @biomed/api build

echo ""
echo "Phase 26 completed successfully."
