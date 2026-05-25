# 54 — Security Hardening Audit

## Objetivo

Auditar la preparación de seguridad del MVP antes de despliegue real.

## Áreas revisadas

```txt
Secrets y archivos .env
JWT access/refresh secrets
CORS
Helmet
ValidationPipe
Rate limiting
Upload limits
Nginx security headers
Docker env policy
Credenciales demo
Logs
Health checks
Swagger exposure
Decisión

Esta fase no cambia la arquitectura ni agrega features. Su objetivo es convertir la seguridad en una lista verificable antes de producción.

Riesgos críticos
1. Secrets débiles o demo en producción

No deben usarse en producción:

Admin12345!
admin@biomed.local
JWT demo secrets
biomed_password
2. Archivos .env

No deben comitearse:

.env
.env.docker
apps/api/.env
apps/web/.env
3. CORS

En producción no debe quedar abierto a cualquier origen.

Correcto:

FRONTEND_ORIGIN=https://dominio-real.com

Incorrecto:

origin: true
origin: "*"
4. Swagger

Swagger es útil en desarrollo, pero en producción debe evaluarse:

desactivarlo
protegerlo
limitarlo por ambiente
5. Uploads

Los adjuntos deben tener:

límite de tamaño
filtro de MIME
directorio fuera de public directo
validación de permisos
auditoría
6. Rate limiting

Auth debe protegerse contra fuerza bruta.

Recomendación futura:

@nestjs/throttler
rate limit en /auth/login
rate limit global moderado
7. Nginx headers

El frontend Docker debe agregar headers básicos:

X-Frame-Options
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
Content-Security-Policy inicial
Criterio mínimo pre-producción
No hay .env comiteados.
JWT secrets están definidos por ambiente.
CORS no está abierto.
Helmet activo.
ValidationPipe activo.
Uploads tienen límite.
Docker health checks pasan.
Smoke tests pasan.
Credenciales demo no son de producción.
Swagger está controlado.



## Referencias requeridas por check

- JWT_ACCESS_SECRET
