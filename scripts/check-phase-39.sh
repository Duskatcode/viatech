set -e

echo "Checking Phase 39 files..."

required_files=(
  "docs/47-stitch-visual-parity-audit.md"
  "docs/48-stitch-design-tokens.md"
  "docs/49-stitch-visual-implementation-plan.md"
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
  echo "Phase 39 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking Stitch references..."

grep -q "BioMed Control" docs/47-stitch-visual-parity-audit.md
grep -q "Stitch" docs/47-stitch-visual-parity-audit.md
grep -q "#003f87" docs/48-stitch-design-tokens.md
grep -q "#1B1E21" docs/48-stitch-design-tokens.md
grep -q "sidebar-width: 260px" docs/48-stitch-design-tokens.md
grep -q "Inter" docs/48-stitch-design-tokens.md
grep -q "JetBrains Mono" docs/48-stitch-design-tokens.md
grep -q "Fase 40" docs/49-stitch-visual-implementation-plan.md
grep -q "Fase 41" docs/49-stitch-visual-implementation-plan.md
grep -q "Fase 42" docs/49-stitch-visual-implementation-plan.md

echo ""
echo "Checking frontend still builds..."

pnpm --filter @biomed/web build

echo ""
echo "Phase 39 completed successfully."
