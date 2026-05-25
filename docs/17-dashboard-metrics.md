# 17 — Dashboard Metrics

## Objetivo

Mejorar el dashboard con métricas reales calculadas desde los datos ya disponibles en el frontend.

## Datos usados

```txt
GET /api/v1/equipment
GET /api/v1/maintenance-orders
Métricas
Total de equipos.
Órdenes activas.
Mantenimientos completados este mes.
Tasa de cierre.
Órdenes vencidas.
Equipos por estado.
Órdenes por estado.
Equipos en alerta.
Órdenes recientes.
Decisión

No se crea endpoint backend todavía. Para el volumen actual del MVP, calcular estas métricas en frontend es suficiente. Cuando haya paginación, grandes volúmenes o multiempresa pesada, se moverá a un endpoint agregado tipo /dashboard/summary.
