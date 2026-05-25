# 43 — MVP Release Checklist v0.1.0

## Estado objetivo

Versión MVP funcional para demostración y pruebas internas.

## Validaciones obligatorias

```txt
pnpm check:phase34
pnpm check:phase35
pnpm check:phase36
pnpm check:phase37
Validación Docker
cp .env.docker.example .env.docker
pnpm docker:reset
pnpm docker:setup
API_BASE_URL=http://localhost:3001/api/v1 pnpm test:api:smoke
Servicios esperados
web: http://localhost:8081
api: http://localhost:3001/api/v1
db:  localhost:5434
Credenciales demo
Email: admin@biomed.local
Password: Admin12345!
Flujos funcionales mínimos
Login
Ver dashboard
Ver equipos
Crear equipo
Cambiar estado de equipo
Ver hoja de vida de equipo
Crear orden de mantenimiento
Iniciar orden
Completar orden
Subir adjunto
Descargar adjunto
Exportar CSV
Exportar XLSX
Descargar PDF de orden
Ver auditoría
Ver alertas
Criterio de cierre MVP

El MVP se considera listo cuando:

Docker setup pasa sin errores.
Smoke test API pasa.
Frontend carga desde Nginx.
Login demo funciona.
Los flujos mínimos funcionan manualmente.
No hay archivos .env comiteados.

