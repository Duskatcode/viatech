# 15 — Frontend Equipment CRUD

## Objetivo

Implementar la gestión visual de equipos biomédicos.

## Incluye

- Listado de equipos.
- Filtros por búsqueda, sede, área y estado.
- Crear equipo.
- Editar equipo.
- Cambiar estado.
- Retirar equipo.
- Ver hoja de vida.
- Ver historial de mantenimiento del equipo.

## Rutas

```txt
/equipment
/equipment/:id
Endpoints usados
GET    /api/v1/equipment
POST   /api/v1/equipment
PATCH  /api/v1/equipment/:id
PATCH  /api/v1/equipment/:id/status
DELETE /api/v1/equipment/:id
GET    /api/v1/equipment/:id/profile
GET    /api/v1/sites
GET    /api/v1/areas
Decisión

La eliminación visual de equipos se implementa como retiro lógico usando el endpoint DELETE, que en backend cambia el estado a RETIRED.
