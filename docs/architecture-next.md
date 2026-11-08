# Arquitectura futura (no implementada)

Este documento describe una opción, no infraestructura ya existente. No contratar servicios hasta validar el problema.

## Principios
- Integrarse con el CRM actual cuando sea viable.
- Una fuente de verdad para el estado del lead.
- Explicar por qué una oportunidad aparece pendiente.
- Separar reglas deterministas de sugerencias de IA.
- Revisión humana antes de comunicaciones.
- Minimizar datos y aislar agencias desde el primer día.

## Componentes posibles
Frontend React + TypeScript; API Cloudflare Workers o equivalente; PostgreSQL gestionado con aislamiento por tenant; autenticación gestionada con MFA y roles; cola asíncrona para webhooks y reintentos idempotentes; adaptador de IA intercambiable con límites de coste; adaptadores independientes para CRM y canales con permisos mínimos.

La selección final debe comparar coste, residencia y transferencias de datos, seguridad, mantenimiento y facilidad de salida.

## Modelo mínimo
Agencias, usuarios, leads, tareas, eventos, borradores e integraciones. No guardar tokens en logs.

## Reglas iniciales
- Lead nuevo sin primera respuesta después del umbral acordado.
- Tarea vencida sin actividad.
- Interés activo sin siguiente paso.
- Visita programada que necesita confirmación.

Toda alerta debe mostrar causa, fecha y acción recomendada. No inferir intención solo por el texto.

## Seguridad antes de datos reales
Autenticación, autorización del lado servidor, pruebas de aislamiento entre agencias, cifrado, gestión de secretos, auditoría, retención y borrado, exportación, backups, restauración, monitorización, gestión de incidentes, evaluación de proveedores y pruebas de seguridad.

No construir todavía scraping de portales, sincronización con muchos CRMs, agentes autónomos, enriquecimiento de datos ni scoring automatizado de personas.
