# 06 — Decisiones Técnicas

## Arquitectura

Se usará monorepo.

Estructura futura:

apps/api
apps/web
packages/shared
docs
contracts
scripts

## Backend

Framework:

NestJS

Razones:

- Arquitectura modular.
- Buen soporte para TypeScript.
- Guards, pipes, interceptors y decorators.
- Buena integración con Swagger.
- Escalable para módulos grandes.

## Frontend

Framework:

React + Vite + TypeScript

Razones:

- Rápido para desarrollo.
- Flexible.
- Compatible con Tailwind y shadcn/ui.
- Buen ecosistema.

## UI

Tailwind CSS + shadcn/ui

Razones:

- Permite diseño profesional.
- Componentes limpios.
- Fácil personalización.
- Similar al estilo generado por Stitch.

## Base de datos

PostgreSQL

Razones:

- Relacional.
- Robusta.
- Compatible con Supabase.
- Buena para entidades con relaciones claras.

## ORM

Prisma

Razones:

- Tipado fuerte.
- Migraciones.
- Cliente TypeScript.
- Buen DX.

## Autenticación

JWT + Refresh Token

Razones:

- Patrón común.
- Escalable.
- Compatible con frontend web.
- Permite proteger API.

## Deploy

Frontend:

Vercel

Backend:

Render

Base de datos:

Supabase PostgreSQL

## API

Todas las rutas del backend usarán:

/api/v1

Swagger estará en:

/api/docs

## Decisiones pendientes

- Nombre final del producto.
- Proveedor definitivo de almacenamiento de archivos.
- Formato inicial de reportes: PDF, Excel o ambos.
- Si se agregará QR en MVP 2.
