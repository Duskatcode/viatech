# 08 — Backend Base

## Objetivo

Configurar el backend NestJS con una base profesional antes de crear módulos de negocio.

## Incluye

- ConfigModule global.
- Validación de variables de entorno.
- Prefijo global `/api/v1`.
- Swagger en `/api/docs`.
- Helmet.
- CORS.
- ValidationPipe global.
- Health endpoint en `/api/v1/health`.

## Endpoints iniciales

### Health

GET /api/v1/health

Respuesta esperada:

```json
{
  "status": "ok",
  "service": "Vitatech Maintenance API",
  "version": "0.0.1",
  "uptime": 12.34,
  "timestamp": "2026-05-24T22:00:00.000Z"
}
Swagger

GET /api/docs

Variables principales
NODE_ENV=development
APP_NAME="Vitatech Maintenance API"
APP_VERSION=0.0.1
API_PORT=3000
API_PREFIX=api/v1
SWAGGER_PATH=api/docs
FRONTEND_ORIGIN=http://localhost:5173
Decisiones

Swagger queda fuera del prefijo /api/v1 para facilitar acceso durante desarrollo.

La API real queda bajo:

/api/v1

