# 18 — Frontend Organization CRUD

## Objetivo

Administrar visualmente la estructura organizacional:

Company → Site → Area

## Incluye

- Editar empresa.
- Crear sede.
- Editar sede.
- Eliminar sede lógico.
- Crear área.
- Editar área.
- Eliminar área lógico.
- Vista jerárquica empresa → sedes → áreas.

## Rutas

```txt
/organization
Endpoints usados
GET    /api/v1/companies
PATCH  /api/v1/companies/:id
GET    /api/v1/sites
POST   /api/v1/sites
PATCH  /api/v1/sites/:id
DELETE /api/v1/sites/:id
GET    /api/v1/areas
POST   /api/v1/areas
PATCH  /api/v1/areas/:id
DELETE /api/v1/areas/:id
Decisión

No se agrega creación de empresas desde UI general porque en backend solo SUPER_ADMIN puede crear empresas. Para ADMIN se prioriza editar su empresa, sedes y áreas.
