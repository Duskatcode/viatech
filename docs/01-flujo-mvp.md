# 01 — Flujo Principal del MVP

## Flujo obligatorio

1. SUPER_ADMIN crea una empresa.
2. ADMIN crea una sede para esa empresa.
3. ADMIN crea un área dentro de la sede.
4. ADMIN registra un equipo biomédico.
5. ADMIN consulta la hoja de vida del equipo.
6. ADMIN crea una orden de mantenimiento.
7. ADMIN asigna la orden a un técnico.
8. TECHNICIAN inicia la orden.
9. TECHNICIAN registra diagnóstico.
10. TECHNICIAN registra acciones realizadas.
11. TECHNICIAN sube evidencia opcional.
12. TECHNICIAN finaliza la orden.
13. El sistema actualiza el historial del equipo.
14. ADMIN genera un reporte básico.

## Diagrama textual

Company
  └── Site
       └── Area
            └── Equipment
                 └── MaintenanceOrder
                      ├── MaintenanceTask
                      └── Attachment

## Estados del equipo durante el flujo

1. Equipo se crea como ACTIVE.
2. Al iniciar mantenimiento cambia a IN_MAINTENANCE.
3. Al completar mantenimiento puede volver a ACTIVE.
4. Si el técnico indica falla grave, queda OUT_OF_SERVICE.
5. Si ya no se usará, queda RETIRED.

## Estados de la orden

PENDING → IN_PROGRESS → COMPLETED

También puede pasar a:

PENDING → CANCELLED

## Criterio de éxito

El MVP funciona si se puede registrar un equipo, hacerle mantenimiento y consultar su historial desde la hoja de vida.
