# 34 — Frontend Operational Alerts Integration

## Objetivo

Conectar el dashboard frontend con la API de alertas operativas.

## Endpoint usado

```txt
GET /api/v1/alerts/summary?days=30
Cambios
Se crea alerts.service.ts.
DashboardPage consume:
reports/summary
audit-logs
alerts/summary
Se agregan cards de:
alertas totales
alertas críticas
órdenes vencidas
garantías próximas
Se agregan listados de:
órdenes vencidas
mantenimientos próximos
equipos fuera de servicio
equipos en mantenimiento
garantías próximas
Decisión

La integración se mantiene en el dashboard porque las alertas son información operacional de primer nivel.
