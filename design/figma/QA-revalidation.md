# NOODO — revalidación independiente de Figma

Revisión de solo lectura terminada. Figma liberado para edición. Se realizaron 3 lecturas y 3 screenshots.

## Resultado

- Barrido de las 92 pantallas: **0 desbordamientos horizontales detectados**, frente a 39 nodos en 12 pantallas móviles en la revisión anterior.
- 2.845 textos devueltos por las queries: **0 fuentes ausentes y 0 textos sin estilo**.
- Screenshots revisados: Inicio desktop 56:2, Radar mobile 57:3017 y Checkout mobile 57:3443.
- El banner 56:154 ocupa 982 px, usa Fill y no tiene binding fijo de ancho. Su arte mide 982 × 327,333 px (3:1).
- Los controles de Radar y selección de entradas caben en la columna móvil, sin acciones recortadas en las muestras.

## Campos anidados: comprobación aprobada

| Composición | Campo | Resultado |
|---|---|---|
| Composer Empty / Writing / Disabled | 49:795 / 49:808 / 49:821 | Fill, sin binding de ancho; 496 px dentro de 600 px |
| Composer de chat móvil | I57:3847;49:795 | Fill, sin binding de ancho; 254 px dentro de 358 px; hijos también caben |
| Dialog Playlist desktop / mobile | 60:11 / 60:36 | Fill, sin binding de ancho; 390 / 308 px |
| Dialog Share desktop / mobile | 60:200 / 60:222 | Fill, sin binding de ancho; 390 / 308 px |
| Checkout móvil | 57:3515 / 57:3521 / 57:3527 | Fill; 358 px |

## Diferencias restantes de fidelidad

1. **Radar, proporción de la portada.** El arte de la primera tarjeta seleccionada, I57:3071;49:998, sigue midiendo 160 × 160 px con width y height ligados a cover/catalog (VariableID:42:117). La siguiente portada I57:3104;49:978 mide 90 × 120 px. No hay overflow, pero la variante seleccionada cambia tamaño/proporción y recorta el afiche. Recomiendo un rol de poster de lista compartido entre estados, en lugar de heredar el token de portada cuadrada.
2. **Checkout, campos distintos del producto.** Desktop 56:4459 y mobile 57:3443 contienen Nombre completo, Correo electrónico y Documento. El campo Documento es 56:4597 / 57:3527. El flujo original de dist/checkout.js solicita nombre, correo, confirmación de correo y celular; no solicita documento. Faltan confirmación y celular como campos de esta pantalla, aunque sí existe SelectionControl para consentimiento. Alinear estos campos antes de declarar fidelidad completa al producto.

## Límites y siguiente cambio

Los errores P1 de geometría previamente enumerados quedan cerrados por este barrido y las tres muestras visuales. Esto no certifica todos los estados ni todos los descendientes internos de instancias: las queries pueden omitir internals según su alcance. Los recortes verticales intencionales de scroll se excluyeron del conteo horizontal. Se mantienen las adaptaciones ya declaradas: Roboto en Figma y mapa esquemático.

La nueva solicitud de colocar Apoyar en la misma fila que like y añadir en el perfil de artista aún será implementada y sincronizada por el agente principal; no forma parte de esta aprobación de layout.

Evidencia detallada: /tmp/noodo-figma-revalidation.json.


## Última comprobación acotada — Radar, Checkout y Apoyar

Se realizó 1 lectura y 2 screenshots adicionales, sin mutaciones. Figma está libre para edición.

- **Radar visual corregido:** I57:3071;49:998 mide 90 × 120 px. La primera tarjeta ya conserva la proporción del resto y sus controles caben.
- **Binding de poster aún por confirmar/corregir:** el objeto boundVariables de I57:3071;49:998 no incluye width ni height; los tokens esperados VariableID:72:347 / VariableID:72:348 no aparecen en este nodo. El valor visual es correcto, pero esta lectura no acredita esas vinculaciones.
- **Confirmación de correo corregida:** 56:4597 y 57:3527 muestran Confirma tu correo, ambos Fill sin binding fijo de ancho.
- **Celular pendiente:** los campos nuevos 81:10946 (desktop) y 81:15832 (mobile) todavía muestran Documento. Textos exactos: I81:10946;43:310 e I81:15832;43:310. Por lo tanto, no cierro aún el hallazgo del formulario.
- **Apoyar aprobado:** variantes móviles 47:199, 47:213, 47:227, 47:241 y 47:255 miden 358 × 60 px. Like, añadir y regalo están en la misma fila: y=8, tamaños 44 × 44, x=210/258/306; borde derecho máximo350, dentro del ancho358. Los botones Apoyar son 79:1259, 79:1262, 79:1265, 79:1268 y 79:1271; icono real Icon/gift. El estado Unavailable usa el IconButton deshabilitado.

El screenshot aislado de TrackRow tiene fondo transparente y no sirve para volver a certificar contraste; su geometría sí queda comprobada. Evidencia de esta última lectura: /tmp/noodo-figma-last-fixes.json.


## Cierre de hallazgos — evidencia del agente principal

**Estado final: los hallazgos concretos abiertos en esta auditoría quedan cerrados según la revalidación independiente anterior y las comprobaciones finales del agente principal.** Esta sección reemplaza el estado pendiente de las secciones históricas; conserva la distinción entre lo observado directamente por este auditor y lo comunicado por el implementador.

| Hallazgo | Evidencia final | Quién verificó |
|---|---|---|
| 39 desbordamientos horizontales en 12 pantallas móviles | Barrido posterior de 92 pantallas: 0 desbordamientos horizontales. Banner de Inicio 982 px Fill y arte 3:1. | Auditor independiente, lectura directa y screenshots |
| Fields anidados en Composer/Dialog | Fill sin binding de ancho fijo; campo del Composer móvil 254 px dentro de 358 px. | Auditor independiente, lectura directa |
| Apoyar junto a like y añadir | Las cinco variantes móviles 47:199 / 213 / 227 / 241 / 255 tienen las tres acciones a y=8 y tamaño 44 × 44. | Auditor independiente, lectura directa y screenshot |
| Confirmación de correo | 56:4597 y 57:3527 muestran Confirma tu correo. | Auditor independiente, lectura directa |
| Campos nuevos seguían mostrando Documento | Component properties de 81:10946 y 81:15832 verificadas con Value = Celular · +57. | Agente principal; sin nueva lectura de este auditor |
| Afiche seleccionado: tamaño/proporción y bindings | Nueva familia EventPoster 86:344, variantes 86:345 / 86:346 / 86:347. Nodo fuente de lista seleccionada 86:349; instancia de pantalla 85:7215; arte I85:7215;86:349 mide 90 × 120 y tiene width → VariableID:72:347, height → VariableID:72:348. Binding comprobado en las 14 instancias de lista (4 desktop y 10 mobile), con screenshot de Radar. | Agente principal; sin nueva lectura de este auditor |
| Ancho semántico móvil | content/mobileWidth, VariableID:84:5122, alias a VariableID:42:59; resuelve 358 px, comprobado en 57:3654. | Agente principal; sin nueva lectura de este auditor |

El agente principal reporta el inventario final de **55 familias, 324 variantes y 92 pantallas**. La auditoría independiente había contado directamente 54 familias, 321 variantes y 92 pantallas antes de añadir EventPoster. No se infiere un nuevo total de variables sin un conteo actualizado.

### Límites que se mantienen

La inspección visual fue por muestras, no un examen pixel a pixel de las 92 pantallas ni de todas las variantes. Los barridos estructurales dependen del alcance de las queries y no equivalen a ejecutar un prototipo navegable completo. Los recortes verticales intencionales de scroll quedan fuera del conteo horizontal. Roboto y el mapa esquemático siguen siendo adaptaciones explícitas. No hubo nuevas llamadas a Figma en este cierre; este auditor solo incorporó la evidencia final comunicada por el agente principal.
