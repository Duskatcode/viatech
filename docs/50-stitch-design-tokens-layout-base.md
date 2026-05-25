# 50 — Stitch Design Tokens and Layout Base

## Objetivo

Aplicar la base visual de Stitch al frontend actual sin tocar lógica de negocio.

## Cambios principales

```txt
index.css: tokens Stitch y clases globales
AppLayout: sidebar/topbar estilo Stitch
StatusPill: badges reutilizables
ActionButton: botones institucionales
FilterBar: contenedor de filtros
PageHeader: encabezado de página
SectionCard: card institucional
ResponsiveTable: tabla institucional
Decisiones
No se copia HTML de Stitch.
No se agregan scripts vanilla JS.
No se agrega Tailwind CDN.
No se cambian servicios API.
No se cambian rutas.
No se toca backend.
Tokens aplicados
primary: #003f87
sidebar-bg: #1B1E21
background: #fbf9f8
surface-lowest: #ffffff
outline-variant: #c2c6d4
sidebar-width: 260px
topbar-height: 64px
Resultado esperado
Layout global más cercano a Stitch.
Sidebar oscuro institucional.
Topbar clara.
Cards/tablas/badges con estilo base común.
Pantallas existentes siguen funcionando.
Validación
pnpm --filter @biomed/web build
pnpm check:phase39

