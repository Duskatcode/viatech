# 49 — Stitch Visual Implementation Plan

## Objetivo

Definir el orden seguro para aplicar paridad visual Stitch al frontend actual.

## Principio

Primero se ajusta el sistema visual global. Después se actualizan pantallas.

No se debe rediseñar pantalla por pantalla antes de estabilizar tokens, layout y componentes compartidos.

## Fase 40 — Tokens + layout base

Archivos probables:

```txt
apps/web/src/index.css
apps/web/src/layout/AppLayout.tsx
apps/web/src/ui/PageHeader.tsx
apps/web/src/ui/SectionCard.tsx
apps/web/src/ui/ResponsiveTable.tsx
apps/web/src/ui/StatusPill.tsx
apps/web/src/ui/ActionButton.tsx
apps/web/src/ui/FilterBar.tsx

Objetivo:

sidebar Stitch-like
topbar Stitch-like
main background
card style
table style
badges
buttons
inputs

Validación:

pnpm --filter @vitatech/web build
pnpm check:phase38
Fase 41 — Login + Dashboard parity

Archivos probables:

apps/web/src/pages/LoginPage.tsx
apps/web/src/pages/DashboardPage.tsx

Objetivo:

Login 2 columnas estilo Stitch
Dashboard con cards bento
Alertas críticas
Actividad reciente
Tablas/cajas con estilo institucional
Fase 42 — Equipment + Maintenance parity

Archivos probables:

apps/web/src/pages/EquipmentPage.tsx
apps/web/src/pages/EquipmentProfilePage.tsx
apps/web/src/pages/MaintenanceOrdersPage.tsx
apps/web/src/pages/MaintenanceOrderDetailPage.tsx
apps/web/src/attachments/AttachmentsPanel.tsx

Objetivo:

Hoja de vida profesional
Identity card de equipo
Detalles técnicos
Historial preventivo/correctivo
Adjuntos como documentos relacionados
Órdenes con badges y tablas densas
Fase 43 — Reports/Audit/Secondary screens

Archivos probables:

apps/web/src/pages/ReportsPage.tsx
apps/web/src/pages/AuditLogsPage.tsx
apps/web/src/pages/OrganizationPage.tsx

Objetivo:

Reportes con cards institucionales
Auditoría con tabla densa
Organización con layout coherente
Riesgos
1. Romper responsive móvil.
2. Aumentar duplicación de clases.
3. Cambiar lógica accidentalmente.
4. Cambiar contratos de servicios.
5. Introducir dependencia de CDN o assets externos.
Mitigación
1. Commits pequeños por fase.
2. Build frontend después de cada fase.
3. No tocar backend en fases visuales.
4. No tocar servicios API.
5. Mantener componentes compartidos como fuente de estilo.
Criterio final de paridad
Layout global: 90%
Login: 90-95%
Dashboard: 85-90%
Hoja de vida: 85-90%
Órdenes/equipos: 80-90%
Reportes/auditoría: 75-85%

