# PedidoClaro

**Prototipo gratuito de validación para distribuidores mayoristas B2B.**

🌐 **Demo:** https://jaimefg19034.github.io/inmolead-demo/

PedidoClaro explora cómo preparar, revisar y exportar pedidos antes de introducirlos en un ERP.

## Funciones disponibles en la demo
- **Reglas de validación v29:** cantidad máxima por línea, tolerancia porcentual frente al precio del catálogo y tratamiento configurable de SKU desconocidos y referencias repetidas (avisar o bloquear). Se aplican tanto a la previsualización como a la importación efectiva de pedidos; se guardan localmente y viajan en la copia JSON.
- **Cola de revisión v29:** panel operativo que agrupa líneas pendientes, incidencias declaradas, SKU ausentes del catálogo y diferencias de precio frente a la referencia local. Prioriza las excepciones y permite abrir directamente el pedido. Es una comprobación determinista local, no IA ni una garantía de detección de errores comerciales.
- **Acciones masivas v26:** selección individual o de todos los pedidos visibles, exportación de la selección a CSV/Excel y aprobación múltiple con confirmación. Solo aprueba pedidos listos, sin incidencias y no cerrados; los demás quedan intactos. Es un cambio de estado local de demostración, no una comunicación con un ERP.
- **Bandeja v25:** ordenación por prioridad/incidencias, importe ascendente o descendente y cliente A–Z. Exportación CSV o Excel de los resultados visibles respetando la búsqueda y el filtro, además de la exportación completa.
- **Centro de importación v24:** auditoría previa de cada fila antes de guardar, resumen de válidas, advertencias, rechazadas y duplicadas; reconocimiento de columnas; detalle de incidencias; descarga anticipada del informe de errores y bloqueo del botón de importación cuando no hay registros válidos o nuevos. La aplicación vuelve a validar al confirmar.
- **Interfaz v24:** renovación del diálogo de importación con flujo por pasos, tarjetas de calidad de datos, tabla de revisión y diseño adaptable; mejora adicional de navegación, formularios, botones y superficies.
- Rediseño visual v18: panel principal destacado, navegación refinada, tarjetas KPI y gráficos CSS dinámicos (anillo de estados y barras comparativas). Las gráficas representan únicamente los datos locales existentes; no se generan tendencias ni cifras ficticias.
- Interfaz visual refinada para Clientes y Analítica, con tarjetas KPI, resumen de clientes destacados, barras de progreso y distribución visual de estados. Diseño adaptable a móvil.
- Bandeja de pedidos con búsqueda y filtros.
- **Clientes:** resumen automático por cliente con pedidos, pendientes, incidencias, valor total y valor aprobado. No requiere crear fichas ni servicios externos.
- **Analítica local:** pedidos totales, valor agregado, valor aprobado, ticket medio, tasa de aprobación, incidencias y principales clientes. Los indicadores se recalculan al cambiar los pedidos.
- Revisión de líneas, cantidades y precios con límites de validación (1–999.999 unidades y 0–999.999 € por unidad).
- Confirmación de incidencias y bloqueo de aprobación si quedan pendientes.
- Aprobación y descarte locales.
- Exportación CSV de un pedido o de toda la bandeja.
- **Exportación Excel `.xlsx` real** para pedidos y catálogo, con encabezados destacados, filtros, primera fila congelada, anchos de columna y formatos numéricos. La importación reconoce separadores decimales europeos (`1.234,56`) y anglosajones (`1,234.56`), además del símbolo de euro. No requiere librerías ni servicios externos.
- **Importación CSV** con validación de cada fila, agrupación por pedido y detección de importaciones duplicadas. Antes de guardar, se muestra una vista previa de las primeras filas y del número total de registros. La persona confirma expresamente la importación. Desde la cola de revisión, «Revisar» abre el pedido y desplaza la pantalla hasta su ficha; las reglas también están disponibles en la cabecera de la cola. Las filas rechazadas se descargan en un segundo CSV con número de fila y motivo, sin perder el contenido original. El catálogo también detecta SKU repetidos dentro del mismo fichero y filas con un número de columnas incorrecto, encabezados vacíos o duplicados para evitar actualizaciones ambiguas. Incluye una plantilla CSV descargable para el catálogo. Si el CSV no incluye número de pedido, agrupa las líneas por cliente dentro de esa importación (en vez de crear un pedido por línea). Cada nueva importación sin número genera un lote independiente.
- Plantilla CSV descargable.
- **Catálogo local de productos**: alta y eliminación manual, búsqueda, importación CSV y exportación CSV.
- El catálogo se incluye en las copias JSON y se restaura junto con los pedidos.
- **Copia de seguridad y restauración JSON** de pedidos, catálogo e historial, con rechazo de números de pedido, referencias SKU e importaciones de origen duplicadas.
- Parser de texto local muy limitado para algunos ejemplos.
- Historial de acciones y guardado local.
- **PWA / modo sin conexión**: el navegador guarda los archivos de la aplicación tras la primera visita.
- Diseño responsive, navegación móvil compacta y controles automáticos en GitHub Actions.

## Clientes y analítica
Las vistas de Clientes y Analítica se calculan directamente desde los pedidos almacenados en el navegador. Los nombres de cliente se agrupan por coincidencia textual; todavía no hay un maestro CRM, contactos, deduplicación avanzada ni métricas contables. El valor total incluye todos los estados, mientras que el valor aprobado solo suma pedidos aprobados. No son ventas reales ni datos sincronizados.

## Catálogo de productos
El catálogo admite columnas `referencia`, `producto` y `precio_unitario` (obligatorias), con `unidad` opcional. Al importar, las referencias existentes se actualizan y las nuevas se añaden. También puedes editar productos y aplicar sus datos a una línea del pedido, que queda pendiente de confirmación humana. Al importar pedidos CSV, las referencias se comparan con el catálogo: se marcan las referencias desconocidas, las diferencias de precio y las referencias repetidas dentro de un pedido para revisión humana. El parser de texto también utiliza los precios y unidades del catálogo cuando encuentra la referencia. No se corrigen ni aprueban automáticamente. No existe sincronización con inventario ni ERP.

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


### v30 · Confirmación explícita de incidencias
- Al confirmar una línea se registra fecha y hora local, se añade una entrada al historial y se muestra una notificación.
- Las líneas confirmadas salen de la cola de revisión. Si se edita una línea o se vuelven a aplicar datos del catálogo, se reabre automáticamente para una nueva confirmación.
- La fecha de confirmación se conserva en las copias JSON. La confirmación es manual y local; no equivale a una validación externa.
