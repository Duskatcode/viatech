# 51 — Login and Dashboard Stitch Parity

## Objetivo

Aplicar paridad visual con Stitch en las dos pantallas más visibles del MVP:

```txt
LoginPage
DashboardPage
Referencias Stitch
Login - Vitatech
Dashboard de Clínica
Dashboard Admin Principal
Criterios visuales
Login
Layout 2 columnas en desktop
Panel izquierdo oscuro institucional
Logo Vitatech
Mensaje de seguridad
Formulario claro con inputs institucionales
Botón primario azul
Footer con soporte/términos
Dashboard
PageHeader institucional
Cards métricas tipo bento
Cards blancas con borde suave
Badges compactos
Sección de alertas críticas
Tabla/listado operativo
Actividad reciente
Restricciones
No tocar backend.
No tocar servicios API.
No cambiar contratos de auth.
No cambiar rutas.
No usar HTML directo de Stitch.
No agregar CDN.
Validación
pnpm --filter @vitatech/web build
pnpm check:phase40
pnpm check:phase39

