# Roadmap — PedidoClaro

## Fase 0 — Prototipo de validación (implementado)
- [x] Dashboard responsive y navegación por vistas.
- [x] Bandeja con búsqueda y filtros por estado.
- [x] Datos de ejemplo de varios clientes y canales simulados.
- [x] Edición de cantidades y precios con recálculo de totales.
- [x] Incidencias por línea y confirmación humana explícita.
- [x] Bloqueo de aprobación si hay incidencias pendientes.
- [x] Aprobación y descarte locales.
- [x] Exportación CSV de un pedido o de toda la bandeja.
- [x] Parser local de texto limitado a unos ejemplos.
- [x] Historial local de actividad.
- [x] Persistencia en localStorage y avisos de limitaciones.
- [x] Control automático de sintaxis JavaScript y estructura HTML.
- [ ] 10 entrevistas con un único segmento de distribuidores.
- [ ] Observar el proceso actual y medir tiempos y errores.
- [ ] Conseguir un piloto con alcance y métricas escritos.

## Fase 1 — Piloto controlado
Solo si la validación lo justifica:
- Elegir un segmento, un formato de entrada y un ERP.
- Trabajar inicialmente con documentos de prueba y datos anonimizados.
- Medir extracción por campo y confianza, no solo acierto global.
- Construir catálogo de referencias y equivalencias del cliente.
- Mantener una bandeja de excepciones y aprobación humana.
- Registrar auditoría, versiones y exportaciones.
- No escribir automáticamente en el ERP durante el primer piloto.

## Fase 2 — Producto
Solo tras un piloto satisfactorio:
- Integración oficial y documentada con el ERP elegido.
- Autenticación, roles y permisos por empresa.
- Backend, base de datos y almacenamiento seguros.
- Cifrado, retención y borrado de documentos.
- Monitorización, copias de seguridad, soporte y recuperación.
- Contratos, privacidad, evaluación legal y pruebas de seguridad.

## No construir todavía
- Integraciones genéricas con diez ERPs.
- Envío automático de pedidos sin revisión.
- OCR o IA de pago sin corpus de documentos representativo.
- Aplicación móvil nativa, multi-tenant complejo o pagos.
- Funciones de marketing antes de demostrar ahorro operativo.

## Condición de continuidad
Seguir solo si entrevistas muestran un problema repetido y cuantificable, una carencia específica de las soluciones actuales y al menos una empresa dispuesta a probar un piloto medible. Si no, cambiar de segmento o abandonar la idea.
