# 26 — Backend Maintenance Order PDF

## Objetivo

Generar una hoja imprimible PDF para una orden de mantenimiento.

## Endpoint

```txt
GET /api/v1/reports/maintenance-orders/:id.pdf
Contenido del PDF
Datos generales de la orden.
Datos del equipo.
Ubicación: empresa, sede y área.
Técnico asignado.
Usuario creador.
Descripción inicial.
Checklist.
Diagnóstico.
Acciones realizadas.
Recomendaciones.
Estado final del equipo.
Espacios para firma.
Seguridad

El endpoint usa los mismos roles de reportes:

SUPER_ADMIN
ADMIN
TECHNICIAN
VIEWER

También respeta scoping por empresa.

Decisión

La generación se hace desde backend usando PDFKit. Frontend se conectará en una fase posterior con un botón de descarga.
