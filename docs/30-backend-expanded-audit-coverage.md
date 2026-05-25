# 30 — Backend Expanded Audit Coverage

## Objetivo

Ampliar cobertura de auditoría para acciones operativas críticas.

## Nuevos eventos

```txt
REPORT_CSV_EXPORTED
REPORT_XLSX_EXPORTED
EQUIPMENT_CREATED
EQUIPMENT_UPDATED
EQUIPMENT_STATUS_CHANGED
EQUIPMENT_RETIRED
MAINTENANCE_ORDER_CREATED
MAINTENANCE_ORDER_STARTED
MAINTENANCE_ORDER_COMPLETED
MAINTENANCE_ORDER_CANCELLED
Eventos previos conservados
ATTACHMENT_UPLOADED
ATTACHMENT_DELETED
REPORT_PDF_EXPORTED
Decisión

Los logs se escriben mediante safeCreate para evitar que un fallo de auditoría rompa la operación principal.
