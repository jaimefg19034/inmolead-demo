# Importar pedidos desde CSV

La importación se ejecuta en el navegador. No se sube el fichero a un servidor.

## Columnas admitidas

| Columna | Obligatoria | Alias aceptados |
|---|---|---|
| pedido | No | order_id, id_pedido, numero_pedido |
| cliente | Sí | customer, empresa |
| referencia | Sí | sku, codigo, codigo_producto |
| producto | Sí | product, descripcion, nombre |
| cantidad | Sí | qty, quantity |
| unidad | No | unit, ud |
| precio_unitario | Sí | precio, price, unit_price |

- Separador admitido: punto y coma, coma o tabulador.
- Los precios admiten decimales con coma o punto.
- La cantidad debe ser un entero positivo.
- Cada línea debe repetir el identificador de pedido y el cliente para agrupar varias líneas.
- Si no se incluye pedido, cada fila se trata como un pedido independiente.
- Límite actual: 2 MB y 1.000 líneas por fichero.
- Las líneas importadas quedan pendientes de confirmación humana.
- El mismo identificador de pedido + cliente se omite si ya se importó antes.

## Copias de seguridad

La opción **Copia JSON** descarga los pedidos y el historial local. **Restaurar** sustituye el contenido actual del navegador por el de la copia. No existe sincronización entre dispositivos ni copia automática en la nube.

## Importante

Esta funcionalidad sirve para probar formatos con datos inventados o anonimizados. No importes información personal, datos de clientes, precios confidenciales ni pedidos reales. El prototipo no es un sistema de gestión de pedidos certificado y no está preparado para producción.
