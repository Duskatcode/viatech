# 48 — Stitch Design Tokens

## Objetivo

Registrar los tokens visuales extraídos de Stitch para usarlos como base del rediseño frontend.

## Colores principales

```txt
primary: #003f87
primary-container: #0056b3
surface-tint: #115cb9
background: #fbf9f8
surface: #fbf9f8
surface-container-lowest: #ffffff
surface-container-low: #f6f3f2
surface-container: #f0eded
surface-container-high: #eae8e7
surface-container-highest: #e4e2e1
surface-variant: #e4e2e1
outline: #727784
outline-variant: #c2c6d4
on-surface: #1b1c1c
on-surface-variant: #424752
inverse-surface: #303030
error: #ba1a1a
error-container: #ffdad6
secondary: #006e25
secondary-container: #80f98b
tertiary: #553e00
tertiary-fixed: #ffdf9e
Colores funcionales observados
sidebar-bg: #1B1E21
success-bg: #D4EDDA
success-text: #155724
warning-bg: #FFF3CD
warning-text: #856404
danger-bg: #F8D7DA
danger-text: #721C24
danger-border: #F5C2C7
Tipografía
font-primary: Inter
font-code: JetBrains Mono
Escala tipográfica
display-lg: 32px / 40px / 700 / -0.02em
headline-md: 24px / 32px / 600 / -0.01em
headline-sm: 20px / 28px / 600
body-lg: 16px / 24px / 400
body-md: 14px / 20px / 400
body-sm: 12px / 16px / 400
label-md: 12px / 16px / 600
code-sm: 12px / 16px / 400
Spacing
sidebar-width: 260px
margin-desktop: 32px
margin-mobile: 16px
gutter: 16px
container-max: 1440px
unit: 4px
topbar-height: 64px
Border radius
default: 2px
lg: 4px
xl: 8px
full: 12px
Patrones de layout
App shell
sidebar fixed left
main margin-left 260px
topbar 64px
content padding 32px
background claro
Cards
bg surface-container-lowest
border outline-variant
rounded-xl
shadow-sm o custom-drop-shadow
padding 20px-24px
Sidebar item
display flex
gap 12px
padding 10px-12px
icon + label
inactive: surface-variant/70
hover: surface-variant/10
active: border-left primary + bg primary-container/10
Topbar
height 64px
background surface
border-bottom outline-variant
search input integrado
actions: notifications/help/user
Tables
thead background surface-container-low/high
headers uppercase
font 10px-12px
rows hover surface-container-low
badges compactos
code values con JetBrains Mono
Forms
label uppercase 10px-12px
input bg white/surface-container-lowest
border outline-variant
focus border primary
focus ring primary/20
button primary solid
button secondary outline/text
Reglas de adopción
1. Usar tokens globales antes de tocar pantallas.
2. Evitar Tailwind suelto duplicado por página.
3. Convertir patrones repetidos en componentes.
4. Mantener React Router y servicios actuales.
5. No introducir CDN de Tailwind ni scripts vanilla.
6. No depender de imágenes externas de Stitch.

