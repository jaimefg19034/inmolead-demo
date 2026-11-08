# InmoLead

MVP de validación para inmobiliarias: organizar oportunidades, priorizar seguimientos y convertir consultas en visitas.

## Estado actual

Esta primera versión es una **demo frontend** con datos ficticios. Incluye:
- Panel de indicadores y oportunidades.
- Búsqueda y filtros por estado.
- Borradores de seguimiento editables y copiables.
- Alta de contactos de prueba.
- Registro local de cambios en el navegador.
- Diseño adaptable a móvil.

**Todavía no** conecta con WhatsApp, correo, CRM, calendarios, modelos de IA ni pagos. No envía mensajes automáticamente. Los datos se guardan únicamente en el navegador mediante localStorage.

## Ejecutar localmente

Abre `index.html` directamente en un navegador o utiliza un servidor estático:

```bash
python -m http.server 8000
```

Después visita http://localhost:8000.

## Publicar con GitHub Pages

1. Abre Settings → Pages en el repositorio.
2. En Build and deployment, selecciona Deploy from a branch.
3. Elige la rama `main` y la carpeta `/ (root)`.
4. Guarda y espera a que termine el despliegue.

También se incluye un workflow en `.github/workflows/pages.yml`.

## Próxima arquitectura (cuando validemos demanda)

- Frontend: React + TypeScript.
- API: Cloudflare Workers.
- Auth y base de datos: Supabase.
- Procesamiento asíncrono: Cloudflare Queues.
- Integración de mensajería: WhatsApp Business Platform, con consentimiento y plantillas aprobadas cuando corresponda.
- Calendario: integración autorizada con Google Calendar/Microsoft 365.
- IA: proveedor intercambiable para clasificar consultas y redactar borradores; revisión humana antes de enviar.
- Pagos: Stripe, solo después de validar disposición de pago.

## Principios de producto

1. No inventar disponibilidad, precios ni características de inmuebles.
2. No enviar comunicaciones sin autorización y controles del cliente.
3. Minimizar los datos personales y permitir su eliminación.
4. Registrar acciones y errores para poder auditar el sistema.
5. Medir el coste por conversación y el valor generado para la agencia.

## Validación comercial

Ver `docs/validation-plan.md`, `docs/sales-message.md` y `docs/market-observation.md`.
