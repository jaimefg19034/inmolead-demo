# PedidoClaro

**Prototipo de validación para distribuidores mayoristas B2B.** Explora cómo preparar y revisar pedidos que llegan en distintos formatos antes de introducirlos en el ERP.

🌐 **Demo:** https://jaimefg19034.github.io/inmolead-demo/

## Qué puedes probar
- Bandeja de pedidos de ejemplo con filtros y búsqueda.
- Revisión de líneas, referencias, cantidades e incidencias.
- Aprobación o descarte dentro de la demo.
- Exportación CSV.
- Simulación de entrada de pedidos.
- Pegado de texto con un parser local muy limitado.
- Guardado de cambios en el navegador.

## Estado real y límites
Esto es un prototipo frontend con datos ficticios. **No tiene IA, OCR, conexión con email, WhatsApp ni ERP.** No procesa documentos reales. Los cambios se guardan en localStorage. Aprobar un pedido solo cambia su estado en la demo; no transmite ni registra nada fuera del navegador. No introducir información comercial, personal o pedidos reales.

## Hipótesis
Algunos distribuidores pueden dedicar tiempo a transcribir pedidos de email/PDF/Excel al ERP y resolver errores de referencias, unidades y cantidades. La hipótesis aún no está validada. Hay competidores especializados y no pretendemos sustituir el ERP.

## Validación antes de desarrollar
1. Entrevistar a 10 distribuidores de un mismo segmento.
2. Medir pedidos al mes y minutos de registro.
3. Identificar ERP, canales y errores frecuentes.
4. Observar un flujo real con datos anonimizados.
5. Conseguir un piloto limitado y acordar métricas.
6. Solo entonces decidir si construir extracción IA, OCR o integración ERP.

Consulta `pedidoclaro/docs/` para investigación, entrevistas y roadmap. El material anterior de InmoLead queda como archivo de una hipótesis descartada, no como producto actual.

## Publicación
GitHub Pages se despliega desde `main` mediante `.github/workflows/pages.yml`. Los controles automáticos de HTML/JavaScript se ejecutan con `.github/workflows/quality.yml`.
