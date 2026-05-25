# 25 — Frontend Attachments UI

## Objetivo

Conectar el frontend con el backend de adjuntos.

## Incluye

- Servicio `attachments.service.ts`.
- Componente reutilizable `AttachmentsPanel`.
- Adjuntos en hoja de vida de equipo.
- Adjuntos en detalle de orden.
- Subida de archivos.
- Listado de adjuntos.
- Descarga de adjuntos.
- Eliminación con confirmación.
- Toasts de éxito/error.
- Estados loading/error/empty.

## Rutas afectadas

```txt
/equipment/:id
/maintenance-orders/:id
Endpoints usados
GET    /api/v1/attachments/equipment/:equipmentId
POST   /api/v1/attachments/equipment/:equipmentId
GET    /api/v1/attachments/maintenance-orders/:orderId
POST   /api/v1/attachments/maintenance-orders/:orderId
GET    /api/v1/attachments/:id/download
DELETE /api/v1/attachments/:id
Decisión

Se usa un solo componente AttachmentsPanel para evitar duplicar lógica entre equipos y órdenes.
