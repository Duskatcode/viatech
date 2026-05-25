# 42 — Docker Migrations and Seed Workflow

## Objetivo

Hacer que el entorno Docker sea usable desde cero.

## Scripts agregados

```txt
docker:setup
docker:down
docker:logs
docker:reset
Flujo recomendado
cp .env.docker.example .env.docker
pnpm docker:setup
Qué ejecuta docker:setup
docker compose up -d --build
prisma migrate deploy
prisma seed
health check
database health check
Decisión

La migración y el seed se ejecutan después de que el contenedor API está levantado. Esto evita acoplar el arranque del contenedor a tareas de inicialización que pueden fallar o necesitar repetición manual.
