# 37 — Frontend Mobile Tables and List Views

## Objetivo

Mejorar la experiencia móvil en pantallas con tablas pesadas.

## Cambios

- `AuditLogsPage` mantiene tabla en desktop y agrega cards en móvil.
- `AttachmentsPanel` mantiene tabla en desktop y agrega cards en móvil.
- Se evita overflow horizontal innecesario en pantallas pequeñas.
- Se conservan las acciones existentes:
  - ver JSON
  - descargar adjunto
  - eliminar adjunto

## Decisión

No se elimina la tabla desktop. En móvil se muestra una vista tipo card para mejorar legibilidad y usabilidad táctil.
