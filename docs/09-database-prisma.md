# 09 — Database & Prisma

## Objetivo

Configurar PostgreSQL con Prisma ORM para el backend NestJS.

## Incluye

- Prisma ORM.
- PostgreSQL local mediante Docker.
- Prisma Client generado en `apps/api/src/generated/prisma`.
- Migración inicial.
- Seed básico.
- PrismaService.
- DatabaseModule global.
- Health check de base de datos.

## Comandos principales

```bash
pnpm db:up
pnpm --filter @vitatech/api prisma:generate
cd apps/api && pnpm prisma:migrate:init
cd apps/api && pnpm prisma:seed
cd apps/api && pnpm prisma:studio
Endpoints
GET /api/v1/health
GET /api/v1/health/database
Entidades iniciales
User
Company
Site
Area
Equipment
MaintenanceOrder
MaintenanceTask
Attachment
AuditLog
