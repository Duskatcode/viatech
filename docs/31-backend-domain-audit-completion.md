# 31 — Backend Domain Audit Completion

## Objetivo

Completar auditoría de dominio para equipos y órdenes de mantenimiento.

## Eventos de equipos

```txt
EQUIPMENT_CREATED
EQUIPMENT_UPDATED
EQUIPMENT_STATUS_CHANGED
EQUIPMENT_RETIRED
Eventos de órdenes
MAINTENANCE_ORDER_CREATED
MAINTENANCE_ORDER_STARTED
MAINTENANCE_ORDER_COMPLETED
MAINTENANCE_ORDER_CANCELLED
Decisión

La auditoría se registra después de operaciones exitosas. Se usa safeCreate para evitar que un fallo de auditoría rompa la operación principal.
