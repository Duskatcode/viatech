set -e

echo "Checking Phase 38 files..."

required_files=(
  "README-MVP.md"
  "docs/43-mvp-release-checklist.md"
  "docs/44-troubleshooting-mvp.md"
  "docs/45-command-map.md"
  "docs/46-release-v0.1.0-summary.md"
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
  echo "Phase 38 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking MVP doc references..."

grep -q "admin@biomed.local" README-MVP.md
grep -q "Admin12345" README-MVP.md
grep -q "pnpm docker:setup" README-MVP.md
grep -q "v0.1.0" docs/46-release-v0.1.0-summary.md
grep -q "pnpm docker:setup" docs/43-mvp-release-checklist.md
grep -q "Troubleshooting" docs/44-troubleshooting-mvp.md

echo ""
echo "Checking existing critical checks..."

pnpm check:phase34
pnpm check:phase35
pnpm check:phase36
pnpm check:phase37

echo ""
echo "Phase 38 completed successfully."
