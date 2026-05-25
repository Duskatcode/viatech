# 23 — Frontend Excel Report Downloads

## Objetivo

Agregar descarga de reportes Excel desde frontend.

## Endpoints usados

```txt
GET /api/v1/reports/equipment.xlsx
GET /api/v1/reports/maintenance-orders.xlsx
Cambios
reports.service.ts agrega:
downloadEquipmentXlsx
downloadMaintenanceOrdersXlsx
/reports muestra botones:
CSV equipos
Excel equipos
CSV órdenes
Excel órdenes
Los filtros actuales se reutilizan en la descarga.
Se agregan estados de descarga separados.
Se usan toasts de éxito/error.
Decisión

Excel queda como formato recomendado para operación diaria. CSV se conserva por simplicidad, compatibilidad y debugging.
