# 47 — Stitch Visual Parity Audit

## Objetivo

Definir cómo acercar el frontend actual al diseño exportado desde Stitch sin romper la lógica existente.

## Fuente visual

Referencia: export de Stitch para `Vitatech`.

El diseño exportado usa una identidad clínica institucional:

```txt
Nombre visual: Vitatech
Estilo: Institutional Precision
Fuente principal: Inter
Fuente técnica: JetBrains Mono
Iconografía: Material Symbols
Sidebar: oscuro, fijo, 260px
Fondo principal: claro clínico
Cards: blancas, borde gris suave
Color primario: azul institucional
Layout: dashboard/bento + tablas densas
Decisión principal

No se copiará el HTML de Stitch directamente.

Razones:

Stitch usa Tailwind por CDN.
Stitch usa scripts vanilla JS.
Stitch usa Material Symbols por CDN.
Stitch usa imágenes externas.
Stitch no está conectado a React Router.
Stitch no usa los servicios reales del backend.
Stitch no respeta la estructura actual del monorepo.

La estrategia correcta es extraer:

tokens visuales
layout base
componentes compartidos
patrones de cards
patrones de tablas
patrones de formularios
patrones de sidebar/topbar
Pantallas detectadas en Stitch
Login - Vitatech
Dashboard Admin Principal
Dashboard de Clínica
Hoja de Vida de Equipo Profesional
Cronograma Preventivo Excel-Style
Cronograma de Mantenimiento Preventivo v3
Matriz de Permisos por Rol
Solicitudes de Acceso
Plantillas y Formatos
Migración Manual de Datos
Mantenimiento Externo
Mapeo contra app actual
Prioridad	Pantalla app actual	Referencia Stitch	Acción
Alta	LoginPage	Login - Vitatech	Rehacer visual usando layout 2 columnas
Alta	AppLayout	Todas las pantallas internas	Ajustar sidebar, topbar, spacing y colores
Alta	DashboardPage	Dashboard de Clínica / Admin Principal	Adaptar cards, bento grid y tablas
Alta	EquipmentProfilePage	Hoja de Vida de Equipo Profesional	Adaptar identity card, specs, tablas y documentos
Alta	MaintenanceOrdersPage	Órdenes / cronograma preventivo	Adaptar tabla, badges y acciones
Media	ReportsPage	Reportes / dashboard style	Adaptar cards y exports
Media	AuditLogsPage	Matriz / auditoría style	Adaptar tabla densa y filtros
Media	AttachmentsPanel	Documentos relacionados / migración manual	Adaptar file cards y upload zone
Baja	OrganizationPage	Clínicas / sedes y áreas	Ajustar después del layout base
Diferencias principales detectadas
1. Layout general

Stitch usa:

sidebar fijo oscuro
topbar clara
main canvas claro
padding desktop 32px
cards blancas
bordes #c2c6d4 o #e4e2e1

La app actual debe migrar hacia ese sistema antes de modificar pantallas individuales.

2. Sidebar

Stitch usa:

ancho 260px
fondo #1B1E21
logo/título arriba
items con icono + label
estado activo con border-left azul
footer con usuario
3. Topbar

Stitch usa:

alto 64px
fondo surface
borde inferior
nombre de clínica/sección
buscador
notificaciones
ayuda
usuario
4. Cards

Stitch usa:

background blanco
border outline-variant
radius xl
shadow sutil
headers con icono
badges técnicos
5. Tablas

Stitch usa:

headers uppercase 10-12px
filas compactas
hover suave
badges de estado
códigos con JetBrains Mono
tablas densas para cronogramas
6. Formularios

Stitch usa:

labels uppercase
inputs blancos
border outline-variant
focus primario
botones primary sólidos
botones secundarios outline
Estrategia de implementación
Fase 40

Tokens + layout base:

index.css
AppLayout
PageHeader
SectionCard
ResponsiveTable
StatusPill
ActionButton
FilterBar
Fase 41

Login + Dashboard:

LoginPage
DashboardPage
MetricCard
ActivityPanel
CriticalAlertsPanel
Fase 42

Equipos + hoja de vida + órdenes:

EquipmentPage
EquipmentProfilePage
MaintenanceOrdersPage
MaintenanceOrderDetailPage
AttachmentsPanel
Fase 43

Reportes + auditoría + pantallas secundarias:

ReportsPage
AuditLogsPage
OrganizationPage
secondary tables
Criterio de éxito
La app mantiene toda la lógica actual.
El build frontend pasa.
El smoke test API sigue pasando.
La paridad visual alcanza 85-95%.
No se copian scripts vanilla JS.
No se agregan CDNs externos innecesarios.
No se rompe responsive.

