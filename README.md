# InmoLead

**Prototipo de validación para pequeñas inmobiliarias.** La hipótesis es que algunas agencias pierden continuidad comercial cuando una consulta no recibe respuesta o no tiene un siguiente paso claro.

🌐 Demo publicada: https://jaimefg19034.github.io/inmolead-demo/

## Estado real del proyecto

La versión actual es una demo frontend estática con datos ficticios. Permite:

- Ver un resumen calculado a partir de los registros de ejemplo.
- Buscar y filtrar oportunidades por estado.
- Añadir, editar y eliminar registros ficticios.
- Consultar los seguimientos vencidos y próximos.
- Preparar, editar y copiar borradores locales.
- Cambiar el estado y programar un siguiente seguimiento de ejemplo.
- Registrar actividad local y exportar los registros a CSV.
- Reiniciar la demo a sus datos iniciales.
- Utilizar la web desde móvil o escritorio.

**No es todavía un SaaS ni debe utilizarse para gestionar compradores reales.** No tiene inicio de sesión, servidor, base de datos, cifrado de datos de clientes, IA conectada, WhatsApp, correo, calendario, integraciones con CRM, pagos ni envío de mensajes. Los cambios se guardan en `localStorage` del navegador donde se abrió la demo.

## Cómo probarla

1. Abre el enlace de GitHub Pages.
2. Baja hasta «Explora InmoLead».
3. Entra en Oportunidades y abre un registro.
4. Prueba a preparar y copiar un borrador, cambiar el estado y guardar un seguimiento.
5. Añade un contacto completamente ficticio, filtra la tabla y exporta el CSV.
6. Pulsa «Reiniciar demo» para recuperar los datos iniciales.

No introduzcas nombres, teléfonos, correos, direcciones ni información de clientes reales.

## Publicación

GitHub Pages se despliega automáticamente al actualizar `main`, mediante `.github/workflows/pages.yml`.

## Estrategia de producto

No competir inicialmente como CRM inmobiliario completo. El mercado ya cuenta con herramientas que incluyen contactos, seguimiento, agenda y automatizaciones. La hipótesis diferenciadora que queremos probar es una capa sencilla que detecte oportunidades sin siguiente acción, ayude a priorizarlas y encaje en el proceso que la agencia ya utiliza.

Antes de desarrollar integraciones:

1. Entrevistar a 10 agencias pequeñas.
2. Identificar el CRM, canales y proceso real que usan.
3. Confirmar que el problema de seguimiento es frecuente y costoso.
4. Conseguir 2 agencias interesadas en diseñar un piloto.
5. Validar disposición a pagar con un piloto asistido y métricas claras.

Consulta `docs/` para el plan de entrevistas, oferta de piloto, investigación competitiva, roadmap, arquitectura futura y lista de seguridad.

## Principios

- No afirmar que un contacto está olvidado sin datos suficientes.
- No inventar disponibilidad, precios ni características de inmuebles.
- No enviar mensajes sin aprobación humana y controles apropiados.
- Minimizar los datos personales, limitar accesos y definir conservación y borrado.
- Medir el tiempo ahorrado y la continuidad del seguimiento, no prometer ventas.
- Validar la disposición a pagar antes de asumir costes fijos de APIs o infraestructura.