# Mercado Pago — Checkout Pro

La tienda usa los endpoints existentes de Nexus, inspeccionados en la copia local de `Nexus/atom-crm-api`:

- Login ecommerce para obtener JWT, `POST /sales` con `clientOperationId` y estado `PENDING`.
- `POST /mercadopago/payment`: `companyId`, `externalReference: order-<saleId>`, `product`, `client`, `total`. Devuelve `redirectUrl`.
- Se envía una línea por pedido con su total final en ARS, incluyendo envío y ajuste de Mercado Pago. Los productos y variantes se conservan en la venta. Esto evita duplicar envío o acumular errores de redondeo por unidad.
- `POST /mercadopago/payment/:saleId/sync` verifica el pago con Mercado Pago usando las credenciales de la empresa autenticada, tanto al regresar como antes de reintentar. Luego `GET /sales/:id` consulta el saldo conciliado. El navegador nunca usa `status=approved` de la URL como comprobante.
- Se conserva el carrito hasta verificar `payment.status=PAID` y un importe que cubra el total. Solo se vacía si coincide con el carrito que originó ese pago.
- Los reintentos en la misma pestaña reutilizan la operación, venta y preferencia mientras no cambie el pedido.

## Configuración para activar en Nexus

Usar la integración `MERCADOPAGO` de la empresa de Trascendencia. El access token pertenece al backend; no agregar credenciales privadas a variables `NEXT_PUBLIC_*`.

Configurar:

- `accessToken`: credencial del vendedor, inicialmente de pruebas.
- `webhookSecret`: clave secreta de Webhooks de la aplicación de Mercado Pago. El panel de integraciones de Nexus ya incluye este campo; se almacena cifrado junto con las credenciales.
- `notificationUrl`: URL HTTPS pública del backend terminada en `/api/mercadopago/webhook` (el servicio agrega `companyId`).
- `backUrlSuccess`, `backUrlFailure`, `backUrlPending`: las tres deben apuntar a `https://<dominio-trascendencia>/checkout/retorno/`.
- Medio de pago Mercado Pago activo. Los ajustes de medios de pago anteriores no se trasladan automáticamente; configurar el descuento/recargo propio de Mercado Pago si corresponde.

No omitir las URLs: los pedidos con referencia `order-` requieren configurar explícitamente las tres URLs HTTPS de retorno, webhook y clave secreta. No se cambiaron credenciales ni configuración de producción.

## Cambios en Nexus

También se modificaron `Nexus/atom-crm-api` y `Nexus/atom-crm-front`:

- La empresa para crear preferencias proviene del JWT. Las preferencias de pedidos consultan la venta de esa empresa y usan su total persistido, ignorando importes y envío enviados para la preferencia por el navegador.
- Se rechazan ventas ya pagadas o canceladas. Se resuelven credenciales en cada operación para permitir rotación sin reiniciar.
- El webhook de pedidos valida HMAC de Mercado Pago, consulta el pago a la API oficial, y verifica referencia, moneda ARS e importe contra la venta. Errores del webhook producen respuestas HTTP de error para permitir reintentos.
- Retorno y webhook concilian `payment` y `paymentCharge` en una transacción con bloqueo de fila. Notificaciones repetidas y pagos pendientes/rechazados no revierten una venta pagada ni su estado de envío.
- El retorno público existente valida correspondencia del pago; la tienda usa consulta de estado de venta, sin pasar estados de aprobación desde el navegador.
- El formulario de integraciones permite guardar la clave del webhook.
- Los checkouts de Mercado Pago permanecen en `PENDING` hasta acreditarse. Los listados general, diario y de pedidos excluyen estos intentos no pagados, y no emiten avisos de nueva venta antes del pago. Los registros se conservan para auditoría y reintentos; el cambio no elimina registros ni modifica la reserva de stock existente.
- La conciliación busca primero pagos aprobados para evitar que un rechazo posterior oculte una aprobación. También repara `paymentCharge` si `payment` estaba pagado pero el saldo había quedado pendiente.
- El evento de nueva venta se emite después de la primera acreditación; los duplicados no vuelven a crear la venta.

Desplegar backend y panel antes que la tienda, y configurar la integración de Trascendencia antes de habilitar compras. Otros ecommerce de Nexus que usan referencias `order-` también deben configurar sus URLs y clave de webhook. Los flujos de QR/POS conservan su configuración anterior.

La validación de precios del catálogo al crear ventas sigue perteneciendo a `POST /sales`; esta migración cobra el total registrado. No implementa devoluciones/contracargos automáticos: deben conciliarse mediante el circuito administrativo existente. Las comprobaciones del agente no crean cobros.

El 24/09/2026 se recuperó la acreditación existente del pedido `S001-00000258`: Mercado Pago confirmó ARS 16 y Nexus quedó con `payment=PAID` y saldo pendiente cero. El usuario había configurado Webhooks solo en modo de prueba, mientras que ese pago tenía `live_mode=true`. Configurar también **Modo productivo → Pagos (legacy)** en la aplicación correspondiente y guardar su clave en Nexus. La consulta al retorno y la conciliación periódica del backend sirven de respaldo; mantener configurado el webhook productivo.

## Validación

Tienda: `node --test tests/mercadopago.test.cjs`

Pruebas de contrato de tienda y backend con dependencias simuladas: `node --test tests/mercadopago.test.cjs tests/nexus-mercadopago.test.cjs`. Por defecto buscan el backend en `../../Nexus/atom-crm-api`; se puede indicar otra copia con `NEXUS_API_PATH`.

Backend: `npx jest --runInBand --runTestsByPath src/module/payment/service/mercadopago.service.spec.ts`

Resultados locales: 33 pruebas de contrato aprobadas. La consulta al API local verificó que el pedido acreditado sigue visible con saldo cero, los intentos 255–257 no aparecen en los listados, y las ventas históricas sin medio de pago se conservan. Verificación de tipos de los archivos cambiados del backend aprobada con tipos de Node. El build de producción de la migración inicial fue exitoso; el chequeo global de tipos de la tienda mantiene errores previos en páginas de productos/categorías. El runner Jest de Nexus no terminó en este entorno y su configuración global referencia tipos de Jest faltantes. Las pruebas de contrato ejecutan el servicio real con Mercado Pago y Prisma simulados; no reemplazan pruebas de notificaciones reales ni verifican concurrencia real de MySQL.

En sandbox verificar aprobación (también cerrando la pestaña antes de volver), pendiente, rechazo, cancelación, webhook duplicado, reintento sin nueva venta, envío y descuentos, y conservar productos añadidos al carrito después de iniciar el pago. Se necesitan credenciales de prueba y webhook público para completar esas pruebas.

Referencias oficiales: [Checkout Pro](https://www.mercadopago.com.ar/developers/es/reference/online-payments/checkout-pro-preferences/overview), [Webhooks](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro-preferences/additional-content/notifications/webhooks).

El pedido S001-00000259 se recuperó el 24/09/2026: ARS 58.000 acreditados y saldo cero, confirmado en el listado real de Nexus. El túnel recibió una IPN `merchant_order` que antes se ignoraba. Ahora el controlador acepta topic/id en query y consulta el recurso al proveedor antes de conciliar. La repetición real devolvió 403 desde Mercado Pago al consultar merchant_orders con las credenciales actuales; este camino todavía depende de resolver ese permiso del proveedor. No se toma la notificación como prueba de pago.

Como respaldo independiente del navegador y del webhook, el backend ejecuta conciliación cada 60 segundos, con lotes de 20 ventas pendientes y cursor rotativo, sin superponer ejecuciones. Verifica pagos aprobados por referencia, empresa, moneda e importe mediante la API de pagos. El tiempo de recuperación depende de la cantidad de pendientes, disponibilidad del proveedor y de que Nexus esté ejecutándose. Las notificaciones IPN se verifican consultando la API; los Webhooks payment conservan la validación de firma.

## URL de notificaciones sin companyId manual

Nexus devuelve la URL de las credenciales con `integrationId` generado desde la integración de la empresa autenticada y elimina `companyId`. El panel actualiza la dirección después de guardar y ofrece Copiar URL para Mercado Pago. Pegar la dirección completa en Webhooks de Mercado Pago (prueba y producción según corresponda). No borrar simplemente el parámetro de una URL antigua: copiar la nueva URL generada. Las URLs antiguas conservan compatibilidad. El backend resuelve solo integraciones activas de Mercado Pago y conserva la validación del pago y su firma. No se cambiaron automáticamente las configuraciones externas de Mercado Pago.

Opcionalmente el administrador del servidor puede definir `MERCADOPAGO_WEBHOOK_URL` con la URL pública común del backend; se usa como base para todas las empresas. Sin esa variable se conserva la base configurada en cada integración, incluidos túneles de desarrollo. Desplegar backend y panel juntos.
