# PedidoClaro

**Prototipo de validación para distribuidores mayoristas B2B.**

🌐 **Demo:** https://jaimefg19034.github.io/inmolead-demo/

PedidoClaro explora cómo preparar, revisar y exportar pedidos que llegan en distintos formatos antes de introducirlos en un ERP.

## Funciones de la demo
- Bandeja con búsqueda y filtros por estado.
- Revisión de líneas, cantidades y precios.
- Confirmación de incidencias antes de aprobar.
- Aprobación y descarte locales.
- Exportación CSV de un pedido o de toda la bandeja.
- Creación de pedidos ficticios y parser local muy limitado para texto.
- Historial de acciones de esta sesión de navegador.
- Guardado en localStorage.
- Diseño responsive, navegación accesible y controles de teclado.

## Limitaciones importantes
**No hay IA, OCR, conexión con correo, WhatsApp, API ni ERP.** No procesa PDFs o Excel reales. Los datos de muestra y los cambios se guardan únicamente en el navegador. Aprobar un pedido solo cambia su estado local. No introducir datos de clientes ni información comercial real.

## Validación antes de construir más
La categoría ya tiene competidores. La hipótesis solo merece seguir si un segmento concreto tiene una necesidad no resuelta. El plan es entrevistar a 10 distribuidores del mismo sector, medir pedidos/mes, minutos de registro, errores y ERP, y buscar un piloto limitado antes de desarrollar integraciones.

Consulta `pedidoclaro/docs/` para investigación, entrevistas, outreach y roadmap.

## Desarrollo
- `index.html`: estructura y vistas.
- `styles.css`: diseño responsive.
- `app.js`: lógica de demostración en navegador.
- `scripts/check_site.py`: validaciones estáticas y sintaxis JS.
- `.github/workflows/pages.yml`: publicación de GitHub Pages.
- `.github/workflows/quality.yml`: controles automáticos en cada cambio.

Los pedidos de ejemplo no son datos reales. El producto no está listo para uso comercial.
