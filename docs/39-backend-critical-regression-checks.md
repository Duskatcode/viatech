# 39 — Backend Critical Regression Checks

## Objetivo

Agregar checks críticos de backend sin introducir todavía un test runner completo.

## Qué valida

- `DATABASE_URL` requerido.
- Auth controller con login, refresh y me.
- Guards y roles en controladores sensibles.
- Scoping por empresa en servicios críticos.
- Auditoría de equipos.
- Auditoría de órdenes.
- Auditoría de adjuntos.
- Auditoría de reportes.
- Endpoint de alertas operativas.
- Endpoint de auditoría.
- Prefijo global `api/v1`.

## Decisión

Esta fase usa checks estáticos porque son rápidos, baratos y reducen riesgo inmediato. Más adelante se pueden complementar con unit tests y e2e tests usando Jest/Supertest.
