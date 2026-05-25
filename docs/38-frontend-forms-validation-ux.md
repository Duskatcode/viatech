# 38 — Frontend Forms and Validation UX Polish

## Objetivo

Mejorar la experiencia de formularios sin cambiar contratos de API ni lógica backend.

## Cambios

- Se agrega `FieldFeedback`.
- Se agrega `SubmitButton`.
- Se agrega helper `form-validation`.
- Se mejora upload de adjuntos con:
  - error local si no hay archivo
  - validación de tamaño máximo 10 MB
  - hint visible
  - submit button consistente
- Se agregan clases globales base para formularios.
- Se mejora `LoginPage` con atributos HTML mínimos:
  - required
  - autocomplete
  - minLength

## Decisión

La fase evita reescribir modales completos. Primero se crea base común y se adopta donde el riesgo es bajo.
