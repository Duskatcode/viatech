# 29 — Frontend Audit Logs UI

## Objetivo

Agregar interfaz frontend para consultar logs de auditoría.

## Ruta

```txt
/audit-logs
Incluye
Servicio audit-logs.service.ts.
Página AuditLogsPage.
Filtros por:
action
entity
entityId
userId
from
to
Tabla de eventos.
Modal de detalle JSON:
oldValue
newValue
Link en sidebar.
Seguridad visual

La página solo permite consulta visual a:

ADMIN
SUPER_ADMIN

El backend sigue siendo la fuente real de seguridad.

Endpoint usado
GET /api/v1/audit-logs

