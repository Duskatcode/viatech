# Vitatech Maintenance Platform — MVP

Plataforma para gestión de mantenimiento biomédico.

## Stack

```txt
Backend: NestJS
Frontend: React + Vite + Tailwind
Database: PostgreSQL
ORM: Prisma
Runtime local/prod: Docker Compose
Web server: Nginx
Inicio rápido con Docker
cp .env.docker.example .env.docker
pnpm docker:setup
URLs
Web: http://localhost:8081
API: http://localhost:3001/api/v1
Swagger: http://localhost:3001/api/docs
PostgreSQL: localhost:5434
Credenciales demo
Email: admin@vitatech.local
Password: Admin12345!
Validación
API_BASE_URL=http://localhost:3001/api/v1 pnpm test:api:smoke
Comandos útiles
pnpm docker:logs
pnpm docker:logs api
pnpm docker:down
pnpm docker:reset
Checks principales
pnpm check:phase34
pnpm check:phase35
pnpm check:phase36
pnpm check:phase37
Documentación
docs/41-docker-local-production-deployment.md
docs/42-docker-migrations-seed-workflow.md
docs/43-mvp-release-checklist.md
docs/44-troubleshooting-mvp.md
docs/45-command-map.md

