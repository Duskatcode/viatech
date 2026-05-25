# 02 — Roles y Permisos

## Roles iniciales

### SUPER_ADMIN

Control total del sistema.

Puede:

- Crear empresas.
- Administrar cualquier entidad.
- Consultar auditoría.
- Administrar usuarios globales.

### ADMIN

Administrador de una empresa.

Puede:

- Gestionar sedes.
- Gestionar áreas.
- Gestionar equipos.
- Crear y asignar mantenimientos.
- Gestionar usuarios de su empresa.
- Ver reportes.

### TECHNICIAN

Técnico de mantenimiento.

Puede:

- Ver equipos.
- Ver órdenes asignadas.
- Iniciar mantenimientos.
- Registrar diagnóstico.
- Registrar acciones realizadas.
- Completar mantenimientos.
- Subir evidencias.

### VIEWER

Usuario de consulta.

Puede:

- Ver equipos.
- Ver mantenimientos.
- Ver reportes.

No puede crear, editar ni eliminar.

## Matriz de permisos

| Módulo | SUPER_ADMIN | ADMIN | TECHNICIAN | VIEWER |
|---|---|---|---|---|
| Empresas | CRUD | Ver | No | No |
| Sedes | CRUD | CRUD | Ver | Ver |
| Áreas | CRUD | CRUD | Ver | Ver |
| Equipos | CRUD | CRUD | Ver/Actualizar técnico | Ver |
| Mantenimientos | CRUD | CRUD | Ejecutar | Ver |
| Usuarios | CRUD | CRUD empresa | No | No |
| Reportes | Ver | Ver | Ver | Ver |
| Auditoría | Ver | Ver | No | No |

## Decisión

Para MVP 1 se usará RBAC simple basado en roles.

No se implementará todavía un sistema avanzado de permisos dinámicos en base de datos.
