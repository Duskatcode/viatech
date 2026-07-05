# 10 — Auth, Users & RBAC

## Objetivo

Implementar autenticación real con JWT, usuarios desde PostgreSQL, hash de contraseña y autorización por roles.

## Incluye

- AuthModule.
- UsersModule.
- Login con email/password.
- Hash de contraseña con bcryptjs.
- JWT access token.
- JWT refresh token con almacenamiento hasheado.
- Logout limpiando refreshTokenHash.
- JwtAuthGuard.
- RolesGuard.
- Decorator @CurrentUser().
- Decorator @Roles().
- Endpoints base de usuarios.

## Endpoints

```txt
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me

GET  /api/v1/users/me
GET  /api/v1/users
GET  /api/v1/users/:id
Usuario demo
email: admin@vitatech.local
password: Admin12345!
Roles iniciales
SUPER_ADMIN
ADMIN
TECHNICIAN
VIEWER
Decisiones

Para MVP se usa RBAC por enum de rol. Más adelante se puede migrar a permisos granulares en base de datos.
