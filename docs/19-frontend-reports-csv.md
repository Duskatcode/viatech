# 19 — Frontend Reports CSV

## Objetivo

Crear reportes operativos iniciales desde frontend con exportación CSV.

## Incluye

- Ruta `/reports`.
- Reporte de equipos.
- Reporte de órdenes de mantenimiento.
- Filtros por búsqueda.
- Filtros por estado.
- Filtros por tipo de mantenimiento.
- Filtros por rango de fecha para órdenes.
- Exportación CSV.

## Endpoints usados

```txt
GET /api/v1/equipment
GET /api/v1/maintenance-orders
Decisión

La exportación inicial se hace en CSV desde frontend. No se implementa PDF/Excel todavía porque primero interesa validar estructura, filtros y utilidad del reporte.

Más adelante, si el cliente necesita formato institucional, se migrará a:

Excel con estilos.
PDF con encabezado institucional.
Endpoint backend /reports.
