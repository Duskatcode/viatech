# 44 — Troubleshooting MVP

## Puerto ocupado

Síntoma:

```txt
bind: address already in use

Solución:

docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

Cambiar puertos en .env.docker:

API_PORT=3001
WEB_PORT=8081
POSTGRES_PORT=5434
PostgreSQL incompatible

Síntoma:

database files are incompatible with server

Causa: volumen creado con otra versión de PostgreSQL.

Solución local:

pnpm docker:reset
pnpm docker:setup
API no arranca

Ver logs:

pnpm docker:logs api

Revisar:

DATABASE_URL
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
CMD del Dockerfile
Prisma migrations
API busca main.js incorrecto

Síntoma:

Cannot find module '/app/apps/api/dist/main.js'

Solución esperada en apps/api/Dockerfile:

CMD ["node", "apps/api/dist/src/main.js"]
Base de datos no tiene tablas

Síntoma:

health/database responde 500
login falla aunque API esté arriba

Solución:

docker compose --env-file .env.docker exec -T api pnpm --filter @vitatech/api prisma:migrate:deploy
docker compose --env-file .env.docker exec -T api pnpm --filter @vitatech/api prisma:seed
Smoke test falla login

Validar credenciales seed:

Email: admin@vitatech.local
Password: Admin12345!

Ejecutar seed:

docker compose --env-file .env.docker exec -T api pnpm --filter @vitatech/api prisma:seed
No comitear archivos locales

Antes de commit:

rm -f .env.docker
git status --short

