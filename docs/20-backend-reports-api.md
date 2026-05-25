# 20 — Backend Reports API

## Objetivo

Mover reportes base al backend para tener scoping, filtros y exportación CSV desde API.

## Endpoints

```txt
GET /api/v1/reports/summary
GET /api/v1/reports/equipment
GET /api/v1/reports/equipment.csv
GET /api/v1/reports/maintenance-orders
GET /api/v1/reports/maintenance-orders.csv
Filtros de equipos
companyId
siteId
areaId
status
search
createdFrom
createdTo
Filtros de órdenes
companyId
equipmentId
assignedToId
type
status
search
createdFrom
createdTo
Seguridad

Todos los reportes respetan el scoping por empresa:

SUPER_ADMIN puede consultar todas las empresas o filtrar por companyId.
ADMIN, TECHNICIAN y VIEWER solo consultan su empresa.
Decisión

La fase implementa JSON + CSV. PDF/Excel se deja para una fase posterior.
