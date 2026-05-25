# 41 — Docker Local/Production Deployment Foundation

## Objetivo

Agregar base de despliegue local reproducible con Docker.

## Servicios

```txt
db   PostgreSQL
api  NestJS API
web  React/Vite servido por Nginx
Puertos por defecto
web: http://localhost:8080
api: http://localhost:3000/api/v1
db:  localhost:5433
Archivos agregados
.dockerignore
docker-compose.yml
.env.docker.example
apps/api/Dockerfile
apps/web/Dockerfile
apps/web/nginx.conf
Uso
cp .env.docker.example .env.docker
docker compose --env-file .env.docker up -d --build
docker compose --env-file .env.docker ps
Validación
curl http://localhost:3000/api/v1/health
curl http://localhost:8080
Decisión

El frontend se sirve con Nginx y proxy /api/v1 hacia la API. PostgreSQL usa volumen persistente.

## Setup automatizado

```bash
cp .env.docker.example .env.docker
pnpm docker:setup

Este comando:

1. Construye y levanta servicios Docker.
2. Ejecuta Prisma migrate deploy.
3. Ejecuta seed.
4. Valida health.
5. Valida database health.
Logs
pnpm docker:logs
pnpm docker:logs api
pnpm docker:logs web
pnpm docker:logs db
Apagar servicios
pnpm docker:down
Reset local completo
pnpm docker:reset

Este comando elimina volúmenes. Úsalo solo para reiniciar la base de datos local Docker desde cero.
