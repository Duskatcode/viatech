# Datos de demostración (Seed)

El proyecto incluye un **seed masivo** que genera automáticamente empresas, sedes, áreas, equipos, órdenes de mantenimiento, tareas, registros de auditoría y usuarios para pruebas.

## Ejecutar el seed

Desde el proyecto:

```bash
pnpm --filter @vitatech/api prisma:seed
```

Si el backend se está ejecutando con Docker:

```bash
docker compose exec api pnpm --filter @vitatech/api prisma:seed
```

---

# Usuarios de demostración

Todos los usuarios creados por el seed utilizan la misma contraseña.

**Contraseña**

```text
Admin123.
```

---

## Super Administrador

Acceso completo a toda la plataforma.

| Usuario | Rol |
|---------|-----|
| `superadmin@vitatech.local` | `SUPER_ADMIN` |

---

## Administradores

Se crea **un administrador por empresa**.

Formato:

```text
admin.<empresa>@demo.com
```

Ejemplos:

```text
admin.hospitalcentral@demo.com
admin.clinicanorte@demo.com
admin.centromedico@demo.com
```

Rol:

```text
ADMIN
```

---

## Técnicos

Cada empresa recibe múltiples técnicos.

Formato:

```text
tecnico1.<empresa>@demo.com
tecnico2.<empresa>@demo.com
tecnico3.<empresa>@demo.com
...
```

Ejemplos:

```text
tecnico1.hospitalcentral@demo.com
tecnico2.hospitalcentral@demo.com
tecnico1.clinicanorte@demo.com
```

Rol:

```text
TECHNICIAN
```

> **Nota:** El seed actual **no crea usuarios con rol `AUDITOR`**. Sí genera registros de auditoría para pruebas, pero no cuentas de auditor.

---

# Dataset generado

| Recurso | Cantidad |
|---------|---------:|
| Empresas | 12 |
| Sedes | 72 |
| Áreas | 1734 |
| Usuarios | 129 |
| Equipos | 1881 |
| Órdenes de mantenimiento | 13194 |
| Tareas | 92205 |
| Registros de auditoría | 100000 |