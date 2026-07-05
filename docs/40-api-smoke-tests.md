# 40 — API Smoke Tests

## Objetivo

Agregar pruebas smoke de API contra un servidor real en ejecución.

## Requisito

La API debe estar levantada:

```txt
pnpm dev:api
Script
pnpm test:api:smoke
Variables soportadas
API_BASE_URL=http://localhost:3000/api/v1
SMOKE_EMAIL=admin@vitatech.local
SMOKE_PASSWORD=Admin12345!
Endpoints probados
GET /health
GET /health/database
POST /auth/login
GET /auth/me
GET /equipment
GET /maintenance-orders
GET /reports/summary
GET /alerts/summary
GET /audit-logs
GET /reports/equipment.csv
GET /reports/equipment.xlsx
GET /reports/maintenance-orders/:id.pdf
Decisión

Estos smoke tests no reemplazan tests unitarios ni e2e completos. Sirven para detectar regresiones rápidas en endpoints críticos.
