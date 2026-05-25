# 41 — Docker Local/Production Deployment Foundation

## Objetivo

Agregar base de despliegue local reproducible con Docker.

## Servicios

```txt
db   PostgreSQL
api  NestJS API
web  React/Vite servido por Nginx
Puertos por defecto
web: http://localhost:8080
api: http://localhost:3000/api/v1
db:  localhost:5433
Archivos agregados
.dockerignore
docker-compose.yml
.env.docker.example
apps/api/Dockerfile
apps/web/Dockerfile
apps/web/nginx.conf
Uso
cp .env.docker.example .env.docker
docker compose --env-file .env.docker up -d --build
docker compose --env-file .env.docker ps
Validación
curl http://localhost:3000/api/v1/health
curl http://localhost:8080
Decisión

El frontend se sirve con Nginx y proxy /api/v1 hacia la API. PostgreSQL usa volumen persistente.
