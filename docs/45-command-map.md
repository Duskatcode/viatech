# 45 — Command Map

## Checks por fase

```bash
pnpm check:phase34
pnpm check:phase35
pnpm check:phase36
pnpm check:phase37
Docker
cp .env.docker.example .env.docker
pnpm docker:setup
pnpm docker:logs
pnpm docker:logs api
pnpm docker:logs web
pnpm docker:logs db
pnpm docker:down
pnpm docker:reset
Smoke tests
pnpm test:api:smoke
API_BASE_URL=http://localhost:3001/api/v1 pnpm test:api:smoke
Backend
pnpm --filter @vitatech/api build
pnpm --filter @vitatech/api prisma:migrate:deploy
pnpm --filter @vitatech/api prisma:seed
Frontend
pnpm --filter @vitatech/web build
URLs
Docker web: http://localhost:8081
Docker API: http://localhost:3001/api/v1
Docker Swagger: http://localhost:3001/api/docs

