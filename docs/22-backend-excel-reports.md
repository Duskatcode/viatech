# 22 — Backend Excel Reports

## Objetivo

Agregar exportación XLSX desde backend para reportes operativos.

## Endpoints

```txt
GET /api/v1/reports/equipment.xlsx
GET /api/v1/reports/maintenance-orders.xlsx
Base técnica
ExcelJS.
Estilos básicos.
Encabezado institucional.
Congelación de fila de encabezado.
Filtros de Excel.
Anchos de columnas.
Reutilización de filtros y scoping de ReportsService.
Filtros soportados

Los mismos filtros de los reportes JSON/CSV:

Equipos
companyId
siteId
areaId
status
search
createdFrom
createdTo
Órdenes
companyId
equipmentId
assignedToId
type
status
search
createdFrom
createdTo
Decisión

Esta fase solo agrega backend Excel. La integración visual en frontend se deja para la siguiente fase para aislar problemas de generación de archivos.
