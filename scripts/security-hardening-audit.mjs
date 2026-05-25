import fs from 'node:fs';

const checks = [];

function exists(path) {
  return fs.existsSync(path);
}

function read(path) {
  return exists(path) ? fs.readFileSync(path, 'utf8') : '';
}

function pass(name, detail = '') {
  checks.push({ status: 'OK', name, detail });
}

function warn(name, detail = '') {
  checks.push({ status: 'WARN', name, detail });
}

function fail(name, detail = '') {
  checks.push({ status: 'FAIL', name, detail });
}

function includesAny(text, values) {
  return values.some((value) => text.includes(value));
}

const rootPackage = read('package.json');
const mainTs = read('apps/api/src/main.ts');
const dockerCompose = read('docker-compose.yml');
const dockerEnvExample = read('.env.docker.example');
const apiDockerfile = read('apps/api/Dockerfile');
const webDockerfile = read('apps/web/Dockerfile');
const nginxConf = read('apps/web/nginx.conf');
const gitignore = read('.gitignore');

console.log('Running security hardening audit...');

if (mainTs.includes('helmet')) {
  pass('Helmet reference found', 'apps/api/src/main.ts');
} else {
  warn('Helmet reference not found', 'Review apps/api/src/main.ts');
}

if (mainTs.includes('ValidationPipe')) {
  pass('ValidationPipe reference found', 'apps/api/src/main.ts');
} else {
  warn('ValidationPipe reference not found', 'Review global validation setup');
}

if (mainTs.includes('enableCors') || mainTs.includes('cors')) {
  pass('CORS reference found', 'apps/api/src/main.ts');
} else {
  warn('CORS reference not found', 'Review frontend/backend origin policy');
}

if (mainTs.includes('SwaggerModule') || mainTs.includes('DocumentBuilder')) {
  warn('Swagger is enabled', 'Confirm production exposure policy');
} else {
  pass('Swagger not detected in main.ts');
}

if (includesAny(gitignore, ['.env', '*.env', '.env.*'])) {
  pass('gitignore has env protection');
} else {
  warn('gitignore env protection unclear', 'Review .env ignore rules');
}

if (exists('.env')) {
  warn('.env exists locally', 'Do not commit it');
} else {
  pass('.env not present at root');
}

if (exists('.env.docker')) {
  warn('.env.docker exists locally', 'Do not commit it');
} else {
  pass('.env.docker not present');
}

if (exists('apps/api/.env')) {
  warn('apps/api/.env exists locally', 'Do not commit it');
} else {
  pass('apps/api/.env not present');
}

if (dockerEnvExample.includes('JWT_ACCESS_SECRET') && dockerEnvExample.includes('JWT_REFRESH_SECRET')) {
  pass('Docker env example includes JWT secrets placeholders');
} else {
  warn('Docker env example missing JWT placeholders');
}

if (dockerEnvExample.includes('Admin12345') || dockerEnvExample.includes('admin@biomed.local')) {
  warn('Demo credentials found in env example', 'Keep demo only; never production');
}

if (dockerCompose.includes('healthcheck')) {
  pass('Docker Compose healthchecks found');
} else {
  warn('Docker Compose healthchecks not found');
}

if (dockerCompose.includes('5432') || dockerCompose.includes('POSTGRES')) {
  pass('Docker Compose includes PostgreSQL references');
} else {
  warn('Docker Compose PostgreSQL reference unclear');
}

if (apiDockerfile.includes('CMD') && apiDockerfile.includes('node')) {
  pass('API Dockerfile has node CMD');
} else {
  warn('API Dockerfile CMD unclear');
}

if (webDockerfile.includes('nginx')) {
  pass('Web Dockerfile uses Nginx');
} else {
  warn('Web Dockerfile Nginx reference not found');
}

const nginxSecurityHeaders = [
  'X-Frame-Options',
  'X-Content-Type-Options',
  'Referrer-Policy',
  'Permissions-Policy',
  'Content-Security-Policy',
];

const foundHeaders = nginxSecurityHeaders.filter((header) => nginxConf.includes(header));

if (foundHeaders.length >= 3) {
  pass('Nginx security headers partially configured', foundHeaders.join(', '));
} else {
  warn('Nginx security headers weak or missing', `Found: ${foundHeaders.join(', ') || 'none'}`);
}

if (rootPackage.includes('test:api:smoke')) {
  pass('API smoke test script found');
} else {
  warn('API smoke test script missing');
}

if (rootPackage.includes('check:phase43')) {
  pass('Visual parity checks available');
} else {
  warn('check:phase43 missing');
}

const failures = checks.filter((check) => check.status === 'FAIL');
const warnings = checks.filter((check) => check.status === 'WARN');

for (const check of checks) {
  const suffix = check.detail ? ` — ${check.detail}` : '';
  console.log(`${check.status}: ${check.name}${suffix}`);
}

console.log('');
console.log(`Security audit completed: ${checks.length} checks, ${warnings.length} warnings, ${failures.length} failures`);

if (failures.length > 0) {
  process.exit(1);
}
