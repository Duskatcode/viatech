# 27 — Frontend Maintenance Order PDF Download

## Objetivo

Agregar descarga PDF desde la vista de detalle de una orden de mantenimiento.

## Endpoint usado

```txt
GET /api/v1/reports/maintenance-orders/:id.pdf
Cambios
reports.service.ts agrega downloadMaintenanceOrderPdf.
Se crea MaintenanceOrderPdfButton.
MaintenanceOrderDetailPage muestra botón Descargar PDF.
Se descarga el PDF como Blob.
Se muestran toasts de éxito/error.
El botón queda deshabilitado mientras descarga.
Decisión

El PDF se genera desde backend para mantener consistencia, scoping por empresa y formato institucional centralizado.
