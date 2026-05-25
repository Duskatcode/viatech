set -e

echo "Checking Phase 45 files..."

required_files=(
  "apps/api/src/main.ts"
  "apps/web/nginx.conf"
  ".env.docker.example"
  "docs/56-applied-security-hardening.md"
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
  echo "Phase 45 is incomplete. Missing files: $missing_files"
  exit 1
fi

echo ""
echo "Checking Swagger hardening..."

grep -q "ENABLE_SWAGGER" apps/api/src/main.ts
grep -q "SwaggerModule.setup" apps/api/src/main.ts
grep -q "ENABLE_SWAGGER=true" .env.docker.example

echo ""
echo "Checking Nginx security headers..."

grep -q "X-Frame-Options" apps/web/nginx.conf
grep -q "X-Content-Type-Options" apps/web/nginx.conf
grep -q "Referrer-Policy" apps/web/nginx.conf
grep -q "Permissions-Policy" apps/web/nginx.conf
grep -q "Content-Security-Policy" apps/web/nginx.conf
grep -q "proxy_pass http://api:3000/api/v1/" apps/web/nginx.conf

if grep -q '\\;' apps/web/nginx.conf; then
  echo "Invalid escaped semicolon found in apps/web/nginx.conf"
  exit 1
fi

echo ""
echo "Running security audit..."

node scripts/security-hardening-audit.mjs

echo ""
echo "Checking backend build..."

pnpm --filter @biomed/api build

echo ""
echo "Checking frontend build..."

pnpm --filter @biomed/web build

echo ""
echo "Checking previous phase..."

pnpm check:phase44

echo ""
echo "Phase 45 completed successfully."
