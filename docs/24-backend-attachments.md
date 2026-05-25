# 24 — Backend Attachments

## Objetivo

Agregar backend para archivos adjuntos de equipos y órdenes de mantenimiento.

## Endpoints

```txt
GET    /api/v1/attachments/equipment/:equipmentId
POST   /api/v1/attachments/equipment/:equipmentId
GET    /api/v1/attachments/maintenance-orders/:orderId
POST   /api/v1/attachments/maintenance-orders/:orderId
GET    /api/v1/attachments/:id/download
DELETE /api/v1/attachments/:id
Seguridad
Todos los endpoints usan JWT.
Lectura permitida para:
SUPER_ADMIN
ADMIN
TECHNICIAN
VIEWER
Escritura/eliminación permitida para:
SUPER_ADMIN
ADMIN
TECHNICIAN
Validaciones
Tamaño máximo: 10 MB.
MIME permitidos:
PDF
JPEG
PNG
WEBP
XLSX
XLS
CSV
DOC
DOCX
Almacenamiento

Los archivos se guardan localmente en:

apps/api/storage/attachments

Este directorio está ignorado por Git.

Decisión

La fase usa almacenamiento local para el MVP. Más adelante puede migrarse a S3, Cloudflare R2, Supabase Storage o Google Drive.
