# 04 — Reglas de Negocio

## Reglas de empresa, sede y área

1. Una empresa puede tener muchas sedes.
2. Una sede pertenece a una sola empresa.
3. Una sede puede tener muchas áreas.
4. Un área pertenece a una sola sede.

## Reglas de equipos

1. Un equipo siempre pertenece a una empresa.
2. Un equipo siempre pertenece a una sede.
3. Un equipo siempre pertenece a un área.
4. Un equipo debe tener código interno.
5. Un equipo puede tener número de serie.
6. Un equipo inicia con estado ACTIVE.
7. Un equipo en mantenimiento debe pasar a IN_MAINTENANCE.
8. Un equipo retirado no debe recibir nuevas órdenes de mantenimiento.

## Reglas de mantenimiento

1. Una orden siempre pertenece a un equipo.
2. Una orden puede crearse sin técnico asignado.
3. Una orden PENDING puede editarse.
4. Una orden IN_PROGRESS solo puede actualizarse con datos técnicos.
5. Una orden COMPLETED no debe editarse libremente.
6. Una orden CANCELLED no debe ejecutarse.
7. Al iniciar una orden, el equipo cambia a IN_MAINTENANCE.
8. Al completar una orden, el técnico define si el equipo queda ACTIVE u OUT_OF_SERVICE.
9. Una orden debe registrar diagnóstico antes de completarse.
10. Una orden debe registrar acciones realizadas antes de completarse.

## Reglas de roles

1. VIEWER no puede crear, editar ni eliminar.
2. TECHNICIAN no puede crear empresas, sedes ni áreas.
3. TECHNICIAN puede ejecutar órdenes asignadas.
4. ADMIN puede gestionar datos de su empresa.
5. SUPER_ADMIN puede gestionar todo el sistema.

## Reglas de auditoría

Deben generar auditoría:

- Crear equipo.
- Editar equipo.
- Cambiar estado de equipo.
- Crear orden.
- Iniciar orden.
- Completar orden.
- Cancelar orden.
- Crear usuario.
- Cambiar rol de usuario.
