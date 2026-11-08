# PedidoClaro — prototipo de validación

PedidoClaro explora un problema operativo de distribuidores mayoristas B2B: pedidos que llegan por correo, PDF, Excel o mensajes y que alguien debe interpretar, revisar y volver a introducir en el ERP.

## Demo
https://jaimefg19034.github.io/inmolead-demo/pedidoclaro/

## Qué se puede probar
- Bandeja de pedidos ficticios y filtros por estado.
- Revisión de líneas, cantidades, precios e incidencias.
- Aprobación o descarte dentro de la demo.
- Exportación CSV.
- Simulación de un pedido entrante.
- Pegado de texto con un parser local muy limitado.
- Persistencia de cambios en el navegador.

## Limitaciones
No hay IA, OCR, conexión con correo, WhatsApp, API ni ERP. No procesa PDFs reales. Los datos son ficticios y se guardan en localStorage. Aprobar un pedido solo cambia su estado en la demo: no se transmite a ningún sistema. No utilizar con datos comerciales o personales reales.

## Hipótesis de negocio
Distribuidores pequeños y medianos con pedidos recurrentes que se teclean manualmente en el ERP. La primera solución sería una bandeja de revisión humana para un canal y un ERP concretos, no sustituir el ERP.

## Validación necesaria
Entrevistar a 10 distribuidores de un mismo segmento. Observar el flujo actual con ejemplos anonimizados. Medir pedidos/mes, minutos de registro, errores, excepciones, ERP y disposición a probar. No construir integraciones hasta tener un piloto real.

## Riesgo competitivo
Hay proveedores especializados. La oportunidad no está demostrada y no debe presentarse como un mercado vacío.
