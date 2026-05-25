# 21 — Frontend Reports with Backend API

## Objetivo

Conectar la UI de reportes al Backend Reports API.

## Cambios

- Se crea `reports.service.ts`.
- `/reports` usa:
  - `GET /api/v1/reports/summary`
  - `GET /api/v1/reports/equipment`
  - `GET /api/v1/reports/equipment.csv`
  - `GET /api/v1/reports/maintenance-orders`
  - `GET /api/v1/reports/maintenance-orders.csv`
- La descarga CSV se hace desde backend.
- El frontend conserva filtros visuales.
- El dashboard puede consumir `reports/summary`.

## Decisión

El backend queda como fuente principal de reportes para respetar scoping por empresa y evitar que el navegador sea responsable de construir archivos.
