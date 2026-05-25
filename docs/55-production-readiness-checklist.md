# 55 — Production Readiness Checklist

## Backend

```txt
[ ] NODE_ENV=production
[ ] PORT definido
[ ] DATABASE_URL definido por ambiente
[ ] JWT_ACCESS_SECRET fuerte
[ ] JWT_REFRESH_SECRET fuerte
[ ] CORS restringido
[ ] Helmet activo
[ ] ValidationPipe activo
[ ] Swagger revisado para producción
[ ] Health endpoint activo
[ ] Database health activo
[ ] Logs sin secretos
Frontend
[ ] VITE_API_URL correcto según ambiente
[ ] No hay URLs hardcodeadas de desarrollo
[ ] Build pasa
[ ] Rutas protegidas funcionan
[ ] Login/logout funciona
[ ] Manejo de errores visible
Docker
[ ] .env.docker no comiteado
[ ] .env.docker.example sin secretos reales
[ ] PostgreSQL con volumen persistente
[ ] Health checks activos
[ ] Migraciones corren
[ ] Seed solo para demo/local
[ ] Puertos documentados
Seguridad
[ ] No usar credenciales demo en producción
[ ] No exponer DB públicamente
[ ] No exponer Swagger sin control
[ ] Limitar uploads
[ ] Auditar descargas y borrados
[ ] Revisar rate limiting
[ ] Revisar headers Nginx
Validación obligatoria
pnpm check:phase43
pnpm check:phase42
pnpm check:phase38
API_BASE_URL=http://localhost:3001/api/v1 pnpm test:api:smoke

