# 12 — Equipment CRUD

## Objetivo

Implementar el CRUD base de equipos biomédicos y una hoja de vida inicial.

## Módulo

EquipmentModule

## Endpoints

```txt
POST   /api/v1/equipment
GET    /api/v1/equipment
GET    /api/v1/equipment/:id
GET    /api/v1/equipment/:id/profile
PATCH  /api/v1/equipment/:id
PATCH  /api/v1/equipment/:id/status
DELETE /api/v1/equipment/:id
Reglas de acceso
SUPER_ADMIN puede gestionar equipos de cualquier empresa.
ADMIN puede gestionar equipos de su empresa.
TECHNICIAN puede consultar equipos y actualizar estado.
VIEWER solo puede consultar equipos.
Estados
ACTIVE
IN_MAINTENANCE
OUT_OF_SERVICE
RETIRED
Decisión

DELETE no elimina físicamente el equipo. Cambia su estado a RETIRED para conservar trazabilidad.
