# PedidoClaro

**Prototipo gratuito de validación para distribuidores mayoristas B2B.**

🌐 **Demo:** https://jaimefg19034.github.io/inmolead-demo/

PedidoClaro explora cómo preparar, revisar y exportar pedidos antes de introducirlos en un ERP.

## Funciones disponibles en la demo
- Bandeja de pedidos con búsqueda y filtros.
- Revisión de líneas, cantidades y precios.
- Confirmación de incidencias y bloqueo de aprobación si quedan pendientes.
- Aprobación y descarte locales.
- Exportación CSV de un pedido o de toda la bandeja.
- **Importación CSV** con validación básica, agrupación por pedido y detección de importaciones duplicadas.
- Plantilla CSV descargable.
- **Catálogo local de productos**: alta y eliminación manual, búsqueda, importación CSV y exportación CSV.
- El catálogo se incluye en las copias JSON y se restaura junto con los pedidos.
- **Copia de seguridad y restauración JSON** de pedidos e historial.
- Parser de texto local muy limitado para algunos ejemplos.
- Historial de acciones y guardado local.
- **PWA / modo sin conexión**: el navegador guarda los archivos de la aplicación tras la primera visita.
- Diseño responsive y controles automáticos en GitHub Actions.

## Catálogo de productos
El catálogo admite columnas `referencia`, `producto` y `precio_unitario` (obligatorias), con `unidad` opcional. Al importar, las referencias existentes se actualizan y las nuevas se añaden. También puedes editar productos y aplicar sus datos a una línea del pedido, que queda pendiente de confirmación humana. Al importar pedidos CSV, las referencias se comparan con el catálogo: se marcan las referencias desconocidas y las diferencias de precio para revisión humana. No se corrigen ni aprueban automáticamente. No existe sincronización con inventario ni ERP.

## Formato CSV
Columnas obligatorias: `cliente`, `referencia`, `producto`, `cantidad`, `precio_unitario`. Opcionales: `pedido`, `unidad`. Se admiten separadores punto y coma, coma o tabulador. Cada línea importada queda pendiente de revisión humana. La plantilla dentro de la aplicación muestra un ejemplo.

## Cómo instalar en iPhone
1. Abre la demo en Safari.
2. Pulsa Compartir.
3. Selecciona **Añadir a pantalla de inicio**.
4. Abre PedidoClaro desde el nuevo icono.

La disponibilidad de funciones de instalación y modo sin conexión depende del navegador y de su versión. En otros dispositivos, utiliza el menú del navegador si aparece la opción de instalar.

## Límites y privacidad
**No hay IA, OCR, lectura de PDF/Excel, conexión con correo, WhatsApp, API ni ERP.** No se suben ficheros a un backend. Pedidos, historial y copias se procesan localmente en el navegador. No existe sincronización entre dispositivos, cuentas ni recuperación de contraseñas. Si borras los datos del navegador sin exportar una copia, puedes perder la información.

Usa solo datos inventados o anonimizados. No introduzcas información personal, datos de clientes, credenciales ni precios confidenciales. Aprobar un pedido solo cambia su estado local; no se comunica con ningún sistema externo. Este prototipo no está preparado para gestionar pedidos reales ni para uso comercial.

## Validación antes de construir más
La categoría tiene competidores. La hipótesis solo merece seguir si un segmento concreto tiene una necesidad no resuelta. El siguiente paso es entrevistar a 10 distribuidores de un mismo sector, medir pedidos/mes, minutos de registro, errores y ERP utilizado, y buscar un piloto limitado antes de desarrollar integraciones.

Consulta `docs/importacion-y-copias.md` y `pedidoclaro/docs/roadmap.md`.

## Desarrollo
- `index.html`: estructura y vistas.
- `styles.css`: diseño responsive.
- `app.js`: lógica de la aplicación en navegador.
- `manifest.webmanifest`, `sw.js`, `icon.svg`: instalación y caché offline.
- `scripts/check_site.py`: validaciones estáticas y sintaxis JavaScript.
- `.github/workflows/pages.yml`: publicación de GitHub Pages.
- `.github/workflows/quality.yml`: controles automáticos en cada cambio.

Todos los servicios usados en la demo son gratuitos y estáticos. El producto no está listo para producción.
