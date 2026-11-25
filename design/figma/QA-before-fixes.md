# NOODO — auditoría final independiente, antes de correcciones de layout

Estado: pendiente corregir desbordamientos detectados. Revisión de solo lectura; Figma liberado para el implementador. No se certifica todavía ausencia total de defectos.

## Conteos verificados directamente en Figma

| Evidencia | Resultado |
|---|---:|
| Component sets registrados y encontrados |54|
| Variantes dentro de esos sets |321|
| Pantallas desktop |46|
| Pantallas mobile |46|
| Variables primitivas / semánticas / responsive |97 /254 /13 =364|
| Estilos tipográficos |6|
| Instancias devueltas por las queries de las92pantallas |835|
| Textos devueltos por las queries de las92pantallas |2845|
| Textos sin fuente / sin estilo en ese barrido |0 /0|
| Variantes de navegación con exactamente un activo |23de23 (18sidebar+5mobile)|

Los seis estilos tienen variables nativas para fontSize,lineHeight,fontFamily,fontStyle. Las54muestras de familias usan Auto Layout y no mostraron fills/strokes sólidos sin binding en sus nodos consultados. Son54muestras, no todas las321variantes ni todos sus descendientes.

## Defectos P1 para corregir

1. Radar móvil57:3017: seis EventCards de560px dentro deEvents57:3070 de358px. IDs57:3071,3104,3127,3150,3173,3196. FIXED con width→VariableID:63:10093. Título/acciones quedan recortados. La portada seleccionada I57:3071;49:998 mide160×160 y usa cover/catalog; las otras90×120. Homogeneizar dimensión/proporción de poster y eliminar el bloqueo de ancho en composición móvil.
2. SectionHeading720px recortado en móvil:57:78,96,112,131,152,168;57:1514,1522,1538,1666,1676;57:2351;57:2860;57:3329,3341,3366;57:3482,3509;57:3685. El chevron/acción queda fuera del área visible. Instancias de bloque necesitan Fill y no binding de ancho fijo.
3. TicketOption440px en evento/checkout móvil:57:3347,57:3488,57:3498; solo358px disponibles.
4. Composer600px en chat móvil57:3847; padreContent390px con padding16; acción enviar fuera de viewport.
5. ForumPost560px en móvil:57:4114,4122,4129,4136 y57:4250; contenido recortado por contenedores390px.
6. Banner desktop56:154 mide720px FIXED, bindingwidth VariableID:63:10042, padreContent56:153 mide1030px (982útiles). No ocupa el ancho completo de su contenido como solicita el usuario.

El barrido horizontal halló39nodos con desborde en12pantallas móviles. Los recortes verticales previstos para scroll no se contaron como defecto. Que clipsContent=true no justifica recortar horizontalmente controles de una columna móvil.

P2: SessionCard360px cuando caben358 (2px):57:118,57:2065,2074,2083,2092. Aplicar Fill como las demás tarjetas de bloque.

## Correcciones anteriores confirmadas

- Opacidad normal=1 (100%), controles visibles.
- TrackRow maestro desktop720×60, sin colapso anterior212×226.
- Cola lateral visible en Comunidad: título+artista en dos líneas y like/añadir, sin duración/portada adicionales.
- FuentesRoboto disponibles y estilos presentes.
- Un único navactivo en las23variantes revisadas.
- Arte del banner3:1, no degradado añadido; CTA legibles.

## Alcance visual y límites

Screenshots revisados: Inicio desktop56:2, Inicio mobile57:2, Radar mobile57:3017, Comunidad desktop56:4718. Checkout57:3443 se revisó estructuralmente, no mediante un quinto screenshot, respetando el máximo4.

No afirmar pixel-perfect de las92pantallas: solo cuatro renders fueron inspeccionados visualmente. Roboto es adaptación explícita del systemUI de la app. El mapa es esquema documentado, no captura cartográfica exacta. Los conteos de fuentes/estilos/colores son los nodos devueltos por queries; algunas consultas no expanden todos los descendientes internos de instancias. La navegación se verificó como estado de componentes, no como prototipo clicable completo.

Después de reparar, revalidar los componentes afectados en sus pantallas mobile y el bannerdesktop. Evidencia estructurada completa con todos losIDs: /tmp/noodo-figma-final-audit.json.
