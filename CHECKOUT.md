# Compra de entradas · NOODO

Implementado el 24 de noviembre de 2026. Es un recorrido de interfaz local, no una integración de pagos. No se cobran fondos, no se reservan cupos, no se envían correos y los QR de boletas no autorizan ingresos.

## Recorrido

- `event.html?event=ND-R26-001`: evento con código estable, flyer y QR público.
- `checkout.html?event=ND-R26-001`: selección de localidades y cantidades.
- `step=datos`: nombre, correo, confirmación del correo y celular; acceso como invitado.
- `step=pago`: resumen y tarjeta, PSE, Nequi, Botón Bancolombia o efectivo en corresponsal. Los gratuitos omiten la pasarela.
- `step=pasarela&order=…`: vista de autorización ilustrativa, sin capturar tarjetas ni credenciales bancarias.
- `step=verificacion&order=…`: verificación bancaria/3D Secure ilustrativa, sin solicitar claves ni OTP.
- `step=resultado&order=…`: aprobado, pendiente, rechazado, cancelado, vencido o error; reintento y consulta.
- `step=entradas&order=…`: boletas con identificadores distintos, descarga HTML sin conexión e impresión/guardar PDF del navegador.
- `checkout.html?view=tickets`: pedidos de la sesión y sus boletas.

Los pasos posteriores requieren el pedido correspondiente en esa sesión. Abrir una URL de resultado no crea un pago. Un intento pendiente se reutiliza, no se duplica. Los pagos no aprobados nunca emiten boletas. La sesión de prueba vive en `sessionStorage['noodo-purchase-demo-v1']`. No es autenticación ni una fuente confiable para producción. No se guardan números de tarjeta, CVV, claves bancarias ni documentos de identidad.

## Identidad de eventos y boletas

`event-identity.js` centraliza Radar y los cuatro eventos anteriores de los perfiles. Los diez códigos `ND-R26-001` a `ND-R26-010` están escritos en los datos; no dependen del orden del catálogo. Los códigos anteriores `ND-2026-001` a `ND-2026-004` siguen funcionando. También se mantienen los enlaces numéricos anteriores de Radar.

El QR del evento codifica una URL del mismo origen con su código estable. En local esa URL apunta a `127.0.0.1` y no abrirá en otro teléfono; cuando el sitio tenga un dominio accesible, se genera con ese dominio. No es una entrada. `vendor/qrcode.js` genera QR reales localmente (Kazuhiko Arase, MIT, licencia incluida), sin enviar datos a servicios QR externos.

Los QR de boletas contienen `NOODO:DEMO:TICKET:<código-evento>:<UUID-boleta>`. Se generan una sola vez al aprobar la prueba y se conservan al recargar. Carecen deliberadamente de firma de acceso real; todas las entradas visibles y descargadas llevan la marca de muestra.

## Conectar pagos reales (pendiente, fuera de esta implementación de pantallas)

La referencia de integración es Wompi Web Checkout. La elección de proveedor no queda contratada por este prototipo. Los medios efectivos dependen de la cuenta del comercio y su habilitación. No hay secretos ni llaves en este repositorio.

1. Crear y aprobar la cuenta del comercio, configurar los medios, cuenta de abonos, políticas de venta y tratamiento de datos; verificar sandbox antes de producción.
2. Crear pedidos en un servidor con precios, moneda y disponibilidad leídos del catálogo autorizado. Calcular todos los importes en centavos; reservar inventario de forma atómica con expiración. Aceptar una clave de idempotencia y limitar cantidades en servidor.
3. Generar la referencia y firma de integridad en servidor. Usar Web Checkout o campos alojados/tokenizados del proveedor. Nunca exponer el secreto de integridad ni guardar PAN/CVV en NOODO.
4. Recibir `transaction.updated`, verificar el checksum siguiendo los campos y timestamp del evento y contrastar comercio/entorno, referencia, importe y moneda. Procesar de forma idempotente. No confiar en la URL de retorno, `localStorage`, `sessionStorage` ni un estado enviado por el cliente.
5. Emitir boletas únicamente tras confirmación autorizada. Emitir cada UUID una sola vez, con una restricción única por pedido/localidad/posición; almacenar tokens opacos o firmados de entrada. Autorizar la consulta del pedido con sesión o enlace de acceso seguro. No incluir PII en el QR.
6. En puerta, validar el token en servidor y registrar el ingreso de forma atómica para impedir su reutilización. Añadir revocación/cancelación y auditoría. El QR del evento nunca debe pasar por el lector de acceso como una boleta.
7. Correo de confirmación, recuperación de boletas, conciliación de pendientes, devoluciones, impuestos/cargos reales y soporte requieren servicios y reglas del comercio. Actualizar disponibilidad al retornar del banco y cerrar un intento antes de permitir un nuevo cobro.

Contrato propuesto para reemplazar el simulador:

| Operación | Responsabilidad del servidor |
| --- | --- |
| `POST /api/orders` | Validar comprador, localidades y aforo; calcular total y crear pedido idempotente |
| `POST /api/orders/:id/payment` | Crear intento y devolver URL firmada del checkout alojado |
| `GET /api/orders/:id` | Devolver estado verificado solo al comprador autorizado |
| `POST /api/webhooks/wompi` | Verificar autenticidad, conciliar pago y emitir boletas una vez |
| `GET /api/orders/:id/tickets` | Entregar entradas al comprador después de aprobación |
| `POST /api/check-in` | Validar y consumir entrada una sola vez con permiso de portería |

Fuentes consultadas:
- https://docs.wompi.co/docs/colombia/widget-checkout-web/
- https://docs.wompi.co/docs/colombia/eventos/
- https://docs.wompi.co/docs/colombia/metodos-de-pago/
- https://soporte.wompi.co/hc/es-419/articles/360020764334--Cu%C3%A1les-son-los-medios-de-pago-con-los-que-cuenta-la-pasarela

## Archivos y verificación

`checkout-model.js` contiene cantidades, totales y transiciones; `checkout.js` renderiza las pantallas y la sesión de prueba; `checkout.css` comparte los tokens de NOODO y adapta móvil e impresión. `event-card.js` sigue siendo el componente reutilizable de tarjetas de Radar. Los diez flyers son las imágenes ya creadas, sin nuevas generaciones.

Ejecutar `node --test tests/checkout.test.cjs` para verificar códigos únicos, compatibilidad, importes, límites, aprobación, fallos, expiración, entradas gratuitas y rechazo de repeticiones. Las pruebas del simulador no constituyen validación de seguridad de un backend de producción.
