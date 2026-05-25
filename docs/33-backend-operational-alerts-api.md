# 33 — Backend Operational Alerts API

## Objetivo

Agregar endpoint backend para alertas operativas reales.

## Endpoint

```txt
GET /api/v1/alerts/summary
Query params
days

Por defecto:

30
Alertas calculadas
overdueOrders
upcomingOrders
inMaintenanceEquipment
outOfServiceEquipment
warrantyExpiringEquipment
Seguridad

Roles con acceso:

SUPER_ADMIN
ADMIN
TECHNICIAN
VIEWER
Scoping
SUPER_ADMIN ve todas las empresas.
Los demás roles solo ven datos de su empresa.
Decisión

Esta fase es backend-only. El dashboard se conectará al endpoint en la siguiente fase.
