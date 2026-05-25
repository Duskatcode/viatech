# 52 — Equipment and Maintenance Stitch Parity

## Objetivo

Aplicar paridad visual Stitch a los módulos centrales del MVP:

```txt
EquipmentPage
EquipmentProfilePage
MaintenanceOrdersPage
MaintenanceOrderDetailPage
AttachmentsPanel
Referencias Stitch
Hoja de Vida de Equipo Profesional
Cronograma Preventivo Excel-Style
Cronograma de Mantenimiento Preventivo v3
Documentos relacionados
Criterios visuales
Cards institucionales
Tablas densas tipo Stitch
Badges compactos
Códigos técnicos con JetBrains Mono
Estados con StatusPill
Filtros en FilterBar
Acciones con ActionButton
Secciones con SectionCard
Restricciones
No tocar backend.
No tocar servicios API.
No cambiar rutas.
No cambiar contratos de formularios.
No copiar HTML directo de Stitch.
No agregar CDN.
No romper responsive.
Validación
pnpm --filter @biomed/web build
pnpm check:phase41
pnpm check:phase40
