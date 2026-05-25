# 11 — Organization CRUD

## Objetivo

Implementar los CRUD iniciales del dominio organizacional:

Company → Site → Area

## Módulos

- CompaniesModule.
- SitesModule.
- AreasModule.

## Endpoints

### Companies

```txt
POST   /api/v1/companies
GET    /api/v1/companies
GET    /api/v1/companies/:id
PATCH  /api/v1/companies/:id
DELETE /api/v1/companies/:id
Sites
POST   /api/v1/sites
GET    /api/v1/sites
GET    /api/v1/sites/:id
PATCH  /api/v1/sites/:id
DELETE /api/v1/sites/:id
Areas
POST   /api/v1/areas
GET    /api/v1/areas
GET    /api/v1/areas/:id
PATCH  /api/v1/areas/:id
DELETE /api/v1/areas/:id
Reglas de acceso
SUPER_ADMIN puede gestionar todo.
ADMIN puede gestionar sedes y áreas de su empresa.
TECHNICIAN puede consultar sedes y áreas.
VIEWER puede consultar sedes y áreas.
Company usa soft delete mediante isActive = false.
Site usa soft delete mediante isActive = false.
Area usa soft delete mediante isActive = false.
Decisión

No se eliminan registros físicamente porque después Equipment dependerá de Site y Area.
