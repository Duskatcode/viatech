# 28 — Backend Audit Logs Foundation

## Objetivo

Agregar base de auditoría para acciones críticas del sistema.

## Endpoint

```txt
GET /api/v1/audit-logs
Filtros
action
entity
entityId
userId
from
to
Roles

Pueden consultar logs:

SUPER_ADMIN
ADMIN
Scoping
SUPER_ADMIN puede ver todos los logs.
ADMIN solo ve logs asociados a usuarios de su empresa.
Eventos iniciales registrados
ATTACHMENT_UPLOADED
ATTACHMENT_DELETED
REPORT_PDF_EXPORTED
Entidades
Attachment
MaintenanceOrder
Equipment
Report
Decisión

La fase implementa la base de auditoría y algunos eventos críticos iniciales. En fases posteriores se ampliará a equipos, órdenes, usuarios y reportes Excel/CSV.
