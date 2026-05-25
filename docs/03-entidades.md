# 03 — Entidades del MVP

## Entidades principales

- User
- Company
- Site
- Area
- Equipment
- MaintenanceOrder
- MaintenanceTask
- Attachment
- AuditLog

## User

Representa a un usuario del sistema.

Campos iniciales:

- id
- name
- email
- passwordHash
- role
- companyId
- isActive
- createdAt
- updatedAt

## Company

Representa una empresa, clínica, institución o cliente.

Campos iniciales:

- id
- name
- nit
- phone
- email
- address
- isActive
- createdAt
- updatedAt

## Site

Representa una sede física de una empresa.

Campos iniciales:

- id
- companyId
- name
- address
- city
- isActive
- createdAt
- updatedAt

## Area

Representa un área dentro de una sede.

Campos iniciales:

- id
- siteId
- name
- floor
- description
- isActive
- createdAt
- updatedAt

## Equipment

Representa un equipo biomédico.

Campos iniciales:

- id
- companyId
- siteId
- areaId
- internalCode
- name
- brand
- model
- serialNumber
- equipmentType
- riskLevel
- status
- purchaseDate
- installationDate
- warrantyUntil
- notes
- createdAt
- updatedAt

## MaintenanceOrder

Representa una orden de mantenimiento.

Campos iniciales:

- id
- code
- equipmentId
- assignedToId
- createdById
- type
- status
- scheduledDate
- startedAt
- completedAt
- description
- diagnosis
- actionsPerformed
- recommendations
- finalEquipmentStatus
- createdAt
- updatedAt

## MaintenanceTask

Representa una tarea/checklist dentro de una orden.

Campos iniciales:

- id
- orderId
- title
- description
- isCompleted
- completedAt

## Attachment

Representa un archivo o evidencia.

Campos iniciales:

- id
- orderId
- equipmentId
- filename
- originalName
- mimeType
- size
- url
- createdAt

## AuditLog

Representa una acción importante hecha dentro del sistema.

Campos iniciales:

- id
- userId
- action
- entity
- entityId
- oldValue
- newValue
- createdAt
