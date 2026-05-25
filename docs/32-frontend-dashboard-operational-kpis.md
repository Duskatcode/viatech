# 32 — Frontend Dashboard Operational KPIs

## Objetivo

Mejorar el dashboard con KPIs reales y eventos de auditoría.

## Datos usados

```txt
GET /api/v1/reports/summary
GET /api/v1/audit-logs
KPIs
Equipos totales.
Equipos activos.
Equipos en mantenimiento.
Equipos fuera de servicio.
Órdenes abiertas.
Órdenes completadas.
Eventos auditados.
Exportaciones auditadas.
Adjuntos auditados.
Alertas operativas.
Widgets
Cards operativas.
Cards de auditoría.
Lista de últimos eventos críticos.
Resumen operativo con disponibilidad.
Decisión

Esta fase es frontend-only. No se crean endpoints nuevos porque reports/summary y audit-logs ya cubren las métricas iniciales.
