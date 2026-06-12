# Fase 59 - Cuentas demo y plan de pruebas del MVP

## 1. Advertencia

Estas credenciales son exclusivamente para entornos locales y demostraciones controladas.

- No usar estas cuentas ni contraseñas en producción.
- No publicar estas credenciales en un despliegue accesible desde Internet.
- No compartir access tokens ni refresh tokens.
- Cambiar contraseñas, secretos JWT y credenciales de base de datos antes de producción.
- Los datos, NIT, correos y teléfonos de este documento son ficticios.

## 2. URLs locales

| Servicio                    | URL                            |
| --------------------------- | ------------------------------ |
| Frontend                    | http://localhost:8081          |
| API                         | http://localhost:3001/api/v1   |
| Swagger, si está habilitado | http://localhost:3001/api/docs |

## 3. Cuentas demo

| Rol         | Empresa                  | Nombre                        | Email                       | Password            | Debe poder                                                         | No debe poder                                       |
| ----------- | ------------------------ | ----------------------------- | --------------------------- | ------------------- | ------------------------------------------------------------------ | --------------------------------------------------- |
| SUPER_ADMIN | Global                   | Super Admin Demo              | superadmin@biomed.local     | `SuperAdmin123!`    | Ver panel global, ambas empresas y administrar usuarios permitidos | Crear otro SUPER_ADMIN por API                      |
| ADMIN       | Clínica Metropolitana    | Admin Demo                    | admin@biomed.local          | `Admin12345!`       | Administrar datos y usuarios TECHNICIAN/VIEWER de su empresa       | Ver otra empresa o crear ADMIN/SUPER_ADMIN          |
| ADMIN       | Clínica Metropolitana    | Admin Clínica Metropolitana   | admin.metro@biomed.local    | `AdminMetro123!`    | Administrar datos y usuarios TECHNICIAN/VIEWER de su empresa       | Ver otra empresa o crear ADMIN/SUPER_ADMIN          |
| TECHNICIAN  | Clínica Metropolitana    | Técnico Biomédico Demo        | tecnico@biomed.local        | `Tecnico123!`       | Consultar y ejecutar órdenes permitidas de su empresa              | Administrar empresas o usuarios                     |
| VIEWER      | Clínica Metropolitana    | Auditor Clínica Metropolitana | auditor.metro@biomed.local  | `AuditorMetro123!`  | Consultar dashboard, reportes y auditoría de su empresa            | Crear, editar o eliminar información                |
| ADMIN       | Hospital San Rafael Demo | Admin Hospital San Rafael     | admin.rafael@biomed.local   | `AdminRafael123!`   | Administrar datos y usuarios TECHNICIAN/VIEWER de su empresa       | Ver Clínica Metropolitana o crear ADMIN/SUPER_ADMIN |
| TECHNICIAN  | Hospital San Rafael Demo | Técnico Hospital San Rafael   | tecnico.rafael@biomed.local | `TecnicoRafael123!` | Consultar y ejecutar órdenes permitidas de su empresa              | Administrar empresas o usuarios                     |
| VIEWER      | Hospital San Rafael Demo | Auditor Hospital San Rafael   | auditor.rafael@biomed.local | `AuditorRafael123!` | Consultar datos de Hospital San Rafael Demo                        | Crear, editar o eliminar información                |

VIEWER representa el perfil auditor de solo lectura.

## 4. Empresas demo

| Empresa                  | NIT         | Sedes                          | Áreas                                                                                    | Uso en pruebas                          |
| ------------------------ | ----------- | ------------------------------ | ---------------------------------------------------------------------------------------- | --------------------------------------- |
| Clínica Metropolitana    | 900000000-1 | Sede Principal, Sede Norte     | Urgencias, UCI, Cirugía, Hospitalización, Imagenología                                   | Flujo principal del MVP                 |
| Hospital San Rafael Demo | 900000000-2 | Sede Central, Consulta Externa | Urgencias, Hospitalización, Esterilización, Consulta Prioritaria, Procedimientos Menores | Aislamiento multiempresa y panel global |

## 5. Equipos demo pre-cargados

| Código     | Empresa                  | Sede             | Área                   | Nombre                        | Marca             | Modelo          | Serial      | Estado         | Riesgo                            | Uso recomendado                     |
| ---------- | ------------------------ | ---------------- | ---------------------- | ----------------------------- | ----------------- | --------------- | ----------- | -------------- | --------------------------------- | ----------------------------------- |
| EQ-MET-001 | Clínica Metropolitana    | Sede Principal   | Urgencias              | Pulsoxímetro Adulto           | ChoiceMMed        | MD300C          | MET-PUL-001 | ACTIVE         | IIA                               | Crear y ejecutar una orden sencilla |
| EQ-MET-002 | Clínica Metropolitana    | Sede Principal   | UCI                    | Monitor Multiparámetro        | Mindray           | BeneVision N12  | MET-MON-002 | ACTIVE         | Consultar orden completada y PDF  |
| EQ-MET-003 | Clínica Metropolitana    | Sede Principal   | UCI                    | Bomba de Infusión             | B. Braun          | Infusomat Space | MET-INF-003 | IN_MAINTENANCE | Continuar una orden correctiva    |
| EQ-MET-004 | Clínica Metropolitana    | Sede Principal   | Urgencias              | Desfibrilador Externo         | Zoll              | R Series        | MET-DES-004 | ACTIVE         | Ver garantía próxima y preventivo |
| EQ-MET-005 | Clínica Metropolitana    | Sede Principal   | UCI                    | Ventilador Mecánico           | Dräger            | Evita V300      | MET-VEN-005 | OUT_OF_SERVICE | Caso crítico y alerta vencida     |
| EQ-MET-006 | Clínica Metropolitana    | Sede Norte       | Imagenología           | Electrocardiógrafo            | GE Healthcare     | MAC 2000        | MET-ECG-006 | ACTIVE         | Consultar orden cancelada         |
| EQ-MET-007 | Clínica Metropolitana    | Sede Principal   | Cirugía                | Autoclave de Mesa             | Tuttnauer         | 2540M           | MET-AUT-007 | ACTIVE         | Orden correctiva cerrada          |
| EQ-MET-008 | Clínica Metropolitana    | Sede Norte       | Hospitalización        | Aspirador de Secreciones      | Allied Healthcare | Gomco 6000      | MET-ASP-008 | IN_MAINTENANCE | Estado de equipo en mantenimiento |
| EQ-MET-009 | Clínica Metropolitana    | Sede Principal   | Cirugía                | Lámpara Cialítica             | Dr. Mach          | LED 3SC         | MET-LAM-009 | ACTIVE         | Hoja de vida sin orden activa     |
| EQ-MET-010 | Clínica Metropolitana    | Sede Norte       | Hospitalización        | Incubadora Neonatal           | Atom Medical      | Incu i          | MET-INC-010 | ACTIVE         | Garantía y preventivo próximos    |
| EQ-RAF-001 | Hospital San Rafael Demo | Sede Central     | Urgencias              | Monitor de Signos Vitales     | Philips           | SureSigns VM6   | RAF-MON-001 | ACTIVE         | Preventivo de empresa B           |
| EQ-RAF-002 | Hospital San Rafael Demo | Sede Central     | Hospitalización        | Bomba de Infusión Volumétrica | Hospira           | Plum A+         | RAF-INF-002 | ACTIVE         | Orden completada de empresa B     |
| EQ-RAF-003 | Hospital San Rafael Demo | Sede Central     | Esterilización         | Esterilizador Rápido          | Steris            | AMSCO 400       | RAF-EST-003 | OUT_OF_SERVICE | Alerta vencida y aislamiento      |
| EQ-RAF-004 | Hospital San Rafael Demo | Consulta Externa | Consulta Prioritaria   | Electrocardiógrafo Portátil   | Welch Allyn       | CP 150          | RAF-ECG-004 | ACTIVE         | Orden en progreso de empresa B    |
| EQ-RAF-005 | Hospital San Rafael Demo | Consulta Externa | Procedimientos Menores | Tensiómetro Digital Clínico   | Omron             | HEM-907         | RAF-TEN-005 | ACTIVE         | Garantía próxima en empresa B     |

## 6. Órdenes demo pre-cargadas

Las fechas son relativas al momento de ejecutar el seed para mantener vigentes las alertas.

| Código       | Empresa                  | Equipo     | Tipo       | Estado      | Técnico asignado            | Fecha programada | Uso recomendado                       |
| ------------ | ------------------------ | ---------- | ---------- | ----------- | --------------------------- | ---------------- | ------------------------------------- |
| MTTO-MET-001 | Clínica Metropolitana    | EQ-MET-001 | PREVENTIVE | PENDING     | tecnico@biomed.local        | +7 días          | Iniciar y completar mantenimiento     |
| MTTO-MET-002 | Clínica Metropolitana    | EQ-MET-003 | CORRECTIVE | IN_PROGRESS | tecnico@biomed.local        | -2 días          | Continuar orden en progreso           |
| MTTO-MET-003 | Clínica Metropolitana    | EQ-MET-002 | PREVENTIVE | COMPLETED   | tecnico@biomed.local        | -18 días         | Descargar PDF                         |
| MTTO-MET-004 | Clínica Metropolitana    | EQ-MET-005 | CORRECTIVE | PENDING     | tecnico@biomed.local        | -8 días          | Alerta crítica vencida                |
| MTTO-MET-005 | Clínica Metropolitana    | EQ-MET-004 | PREVENTIVE | PENDING     | tecnico@biomed.local        | +14 días         | Preventivo próximo                    |
| MTTO-MET-006 | Clínica Metropolitana    | EQ-MET-007 | CORRECTIVE | COMPLETED   | tecnico@biomed.local        | -35 días         | Revisar diagnóstico y recomendaciones |
| MTTO-MET-007 | Clínica Metropolitana    | EQ-MET-006 | CORRECTIVE | CANCELLED   | tecnico@biomed.local        | -12 días         | Revisar caso cancelado                |
| MTTO-MET-008 | Clínica Metropolitana    | EQ-MET-010 | PREVENTIVE | PENDING     | tecnico@biomed.local        | +21 días         | Garantía y preventivo próximos        |
| MTTO-RAF-001 | Hospital San Rafael Demo | EQ-RAF-001 | PREVENTIVE | PENDING     | tecnico.rafael@biomed.local | +10 días         | Preventivo empresa B                  |
| MTTO-RAF-002 | Hospital San Rafael Demo | EQ-RAF-003 | CORRECTIVE | PENDING     | tecnico.rafael@biomed.local | -6 días          | Alerta vencida empresa B              |
| MTTO-RAF-003 | Hospital San Rafael Demo | EQ-RAF-002 | PREVENTIVE | COMPLETED   | tecnico.rafael@biomed.local | -20 días         | Orden cerrada empresa B               |
| MTTO-RAF-004 | Hospital San Rafael Demo | EQ-RAF-004 | CORRECTIVE | IN_PROGRESS | tecnico.rafael@biomed.local | -1 día           | Ejecución técnica empresa B           |

Cada orden incluye un checklist preventivo o correctivo. La orden crítica `MTTO-MET-004` incluye pruebas eléctricas, alarmas, módulo de flujo, presión y registro de salida de servicio.

## 7. Pruebas físicas y manuales

### Prueba física 1 - Hoja de vida

- [ ] Iniciar sesión como ADMIN de Clínica Metropolitana.
- [ ] Abrir `EQ-MET-005` Ventilador Mecánico.
- [ ] Verificar sede, área UCI, estado `OUT_OF_SERVICE`, riesgo III y detalles técnicos.
- [ ] Resultado esperado: la hoja de vida carga y refleja que es un equipo crítico fuera de servicio.

### Prueba física 2 - Crear orden

- [ ] Iniciar sesión como ADMIN.
- [ ] Crear una orden para `EQ-MET-001`.
- [ ] Asignar `tecnico@biomed.local`.
- [ ] Resultado esperado: la orden aparece en la lista de Clínica Metropolitana y queda disponible para el técnico.

### Prueba física 3 - Técnico ejecuta orden

- [ ] Iniciar sesión como `tecnico@biomed.local`.
- [ ] Abrir la orden asignada.
- [ ] Iniciar la orden, completar tareas y completar la orden.
- [ ] Resultado esperado: cambia a `COMPLETED`, conserva el checklist y registra la actividad.

### Prueba física 4 - Adjuntos

- [ ] Iniciar sesión como ADMIN o TECHNICIAN con permiso.
- [ ] Subir un PDF pequeño, una imagen JPG/PNG de equipo, una foto de placa serial o un acta simulada.
- [ ] Descargar el adjunto.
- [ ] Resultado esperado: el archivo descargado coincide con el original y sigue disponible tras reiniciar los contenedores.

El seed no inserta adjuntos falsos ni archivos binarios.

### Prueba física 5 - Reporte PDF

- [ ] Abrir `MTTO-MET-003`.
- [ ] Descargar el PDF de la orden.
- [ ] Resultado esperado: el documento se descarga con datos del monitor, tareas y cierre de la orden.

### Prueba física 6 - Auditor VIEWER

- [ ] Iniciar sesión como `auditor.metro@biomed.local`.
- [ ] Confirmar que puede consultar dashboard, equipos, órdenes, reportes y auditoría.
- [ ] Confirmar que no puede crear, editar ni eliminar.
- [ ] Resultado esperado: acceso de lectura limitado a Clínica Metropolitana.

### Prueba física 7 - Aislamiento multiempresa

- [ ] Iniciar sesión como `admin.rafael@biomed.local`.
- [ ] Confirmar que no aparecen equipos `EQ-MET-*`.
- [ ] Confirmar que solo aparecen equipos `EQ-RAF-*`.
- [ ] Intentar abrir por URL o ID un equipo de Clínica Metropolitana.
- [ ] Resultado esperado: los listados están aislados y el acceso directo responde 403 o 404.

### Prueba física 8 - SUPER_ADMIN global

- [ ] Iniciar sesión como `superadmin@biomed.local`.
- [ ] Confirmar que aparece el panel global.
- [ ] Confirmar usuarios globales y resumen por empresa.
- [ ] Resultado esperado: ve ambas empresas sin quedar limitado por `companyId`.

## 8. Pruebas de seguridad RBAC

| Usuario                     | Acción                                            | Resultado esperado      |
| --------------------------- | ------------------------------------------------- | ----------------------- |
| ADMIN Clínica Metropolitana | Crear SUPER_ADMIN                                 | Bloqueado               |
| ADMIN Clínica Metropolitana | Crear ADMIN                                       | Bloqueado               |
| ADMIN Clínica Metropolitana | Asignar otra empresa                              | Bloqueado               |
| TECHNICIAN                  | Entrar a `/users`                                 | Bloqueado               |
| TECHNICIAN                  | Crear usuario                                     | Bloqueado               |
| VIEWER                      | Editar o eliminar equipo                          | Bloqueado               |
| VIEWER                      | Crear, iniciar o cancelar orden                   | Bloqueado               |
| ADMIN Hospital San Rafael   | Ver equipo `EQ-MET-*` por ID                      | Bloqueado con 403 o 404 |
| ADMIN Clínica Metropolitana | Ver orden `MTTO-RAF-*` por ID                     | Bloqueado con 403 o 404 |
| SUPER_ADMIN                 | Ver ambas empresas y sus resúmenes                | Permitido               |
| SUPER_ADMIN                 | Crear ADMIN, TECHNICIAN o VIEWER para una empresa | Permitido               |

## 9. Comandos de validación

```bash
docker compose --env-file .env.docker.example up -d --build api web
```

```bash
curl -i http://localhost:3001/api/v1/health
curl -i http://localhost:3001/api/v1/health/database
```

```bash
API_BASE_URL=http://localhost:3001/api/v1 node scripts/api-smoke-tests.mjs
```

```bash
DATABASE_URL="postgresql://biomed:biomed_password@localhost:5434/biomed?schema=public" pnpm --filter @biomed/api run prisma:seed
```

El seed es idempotente para empresas, usuarios, sedes, áreas, equipos, órdenes y auditorías. Las tareas se regeneran únicamente para las órdenes demo descritas en este documento.

## 10. Criterio de MVP listo

- [ ] API health responde 200.
- [ ] Database health responde 200.
- [ ] Smoke test pasa 12/12.
- [ ] Login SUPER_ADMIN funciona.
- [ ] Login ADMIN funciona.
- [ ] Login TECHNICIAN funciona.
- [ ] Login VIEWER funciona.
- [ ] Dashboard global funciona.
- [ ] Dashboard de empresa funciona.
- [ ] Usuarios funciona para SUPER_ADMIN y ADMIN.
- [ ] TECHNICIAN y VIEWER no ven Usuarios.
- [ ] Aislamiento entre Empresa A y Empresa B está validado.
- [ ] Reportes PDF, CSV y XLSX descargan.
- [ ] Adjuntos suben y descargan.
- [ ] Auditoría carga eventos de ambas empresas.
