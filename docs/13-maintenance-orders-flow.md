# 13 — Maintenance Orders Flow

## Objetivo

Implementar el flujo técnico de órdenes de mantenimiento.

## Módulo

MaintenanceOrdersModule

## Endpoints

```txt
POST   /api/v1/maintenance-orders
GET    /api/v1/maintenance-orders
GET    /api/v1/maintenance-orders/:id
PATCH  /api/v1/maintenance-orders/:id
PATCH  /api/v1/maintenance-orders/:id/assign
PATCH  /api/v1/maintenance-orders/:id/start
PATCH  /api/v1/maintenance-orders/:id/complete
PATCH  /api/v1/maintenance-orders/:id/cancel

POST   /api/v1/maintenance-orders/:id/tasks
PATCH  /api/v1/maintenance-orders/:id/tasks/:taskId
Estados de orden
PENDING
IN_PROGRESS
COMPLETED
CANCELLED
Flujo
Crear orden en estado PENDING.
Asignar técnico opcionalmente.
Iniciar orden.
Al iniciar, el equipo pasa a IN_MAINTENANCE.
Completar orden.
Al completar, el equipo pasa al estado final indicado o ACTIVE por defecto.
Cancelar orden si aún no está completada.
Registrar tareas/checklist dentro de la orden.
Reglas de acceso
SUPER_ADMIN puede operar sobre cualquier empresa.
ADMIN puede operar sobre su empresa.
TECHNICIAN puede crear, consultar, iniciar y completar órdenes de su empresa.
VIEWER solo puede consultar.
