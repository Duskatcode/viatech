# 14 — Frontend Base, Auth & Layout

## Objetivo

Crear la base profesional del frontend React.

## Incluye

- React Router.
- TanStack Query.
- Axios API client.
- AuthProvider.
- Token en localStorage.
- Rutas protegidas.
- Login real contra backend.
- Layout privado.
- Sidebar.
- Dashboard base.
- Página de equipos.
- Página de órdenes.
- Página de organización.

## Rutas

```txt
/login
/
/equipment
/maintenance-orders
/organization
API usada
POST /api/v1/auth/login
GET  /api/v1/auth/me
POST /api/v1/auth/logout
GET  /api/v1/equipment
GET  /api/v1/maintenance-orders
GET  /api/v1/companies
GET  /api/v1/sites
GET  /api/v1/areas
Decisión

Esta fase no implementa formularios completos de CRUD. Primero se construye la navegación, autenticación y lectura real de datos.
