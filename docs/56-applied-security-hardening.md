# 56 — Applied Security Hardening

## Objetivo

Aplicar hardening básico posterior a la auditoría de seguridad.

## Cambios aplicados

```txt
Swagger condicionado por ENABLE_SWAGGER
Nginx security headers
CSP inicial
.env.docker.example documenta ENABLE_SWAGGER
Swagger

Swagger ya no debe exponerse automáticamente.

Variable:

ENABLE_SWAGGER=true

Uso recomendado:

local/demo: true
production: false
Nginx headers

Headers aplicados:

X-Frame-Options
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
Content-Security-Policy
CSP inicial

La CSP actual permite:

self scripts
self styles con unsafe-inline por Tailwind/build actual
self/data/blob images
self/data fonts
API local en localhost:3000/3001
sin object-src
sin frame ancestors
Riesgos pendientes
Rate limiting aún pendiente
Upload MIME policy aún pendiente
Swagger auth/protección avanzada pendiente
Producción requiere dominio real en CSP/connect-src
Validación
pnpm check:phase45
API_BASE_URL=http://localhost:3001/api/v1 pnpm test:api:smoke

