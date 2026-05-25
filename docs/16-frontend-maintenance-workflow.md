# 16 — Frontend Maintenance Orders Workflow

## Objetivo

Implementar la interfaz del flujo técnico de órdenes de mantenimiento.

## Incluye

- Listado de órdenes.
- Filtros por búsqueda, tipo y estado.
- Crear orden.
- Iniciar orden.
- Completar orden.
- Cancelar orden.
- Ver detalle de orden.
- Gestionar checklist.
- Ver diagnóstico, acciones y recomendaciones.

## Rutas

```txt
/maintenance-orders
/maintenance-orders/:id
Endpoints usados
GET    /api/v1/maintenance-orders
GET    /api/v1/maintenance-orders/:id
POST   /api/v1/maintenance-orders
PATCH  /api/v1/maintenance-orders/:id/start
PATCH  /api/v1/maintenance-orders/:id/complete
PATCH  /api/v1/maintenance-orders/:id/cancel
POST   /api/v1/maintenance-orders/:id/tasks
PATCH  /api/v1/maintenance-orders/:id/tasks/:taskId
GET    /api/v1/equipment
GET    /api/v1/users
Decisión

La UI ejecuta el flujo técnico desde la lista de órdenes y permite gestionar el checklist desde la vista detalle.
