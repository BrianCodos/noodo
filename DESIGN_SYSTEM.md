# NOODO — Sistema UI del reproductor

Actualizado: 24 de noviembre de 2026. Estado: prototipo auditado; no certificación de producción.

## Fuentes y mantenimiento

- `dist/theme.js`: validación, aplicación, sincronización y exportación del tema común. Se carga antes de pintar cada entrada del reproductor, checkout y catálogo.
- `styles/workspace/manifest.json`: orden de los ocho módulos CSS. Editar estos archivos; regenerar con `node scripts/build-workspace.cjs`. No editar el bundle generado directamente.
- `dist/component-status.js`: distingue implementaciones reales del prototipo y contratos/muestras, con ruta y archivo responsable.

- `dist/index.html#inventory`: catálogo navegable de 88 componentes/familias, con contratos y estados. Un contrato documentado no implica que todas sus variantes estén construidas.
- `dist/typography.js`: fuente canónica de tipografía.
- `dist/noodo-tokens-v0.3.css`: fundamentos publicados para las pantallas.
- `dist/content.js`, `dist/player-lab.js`, `dist/player-rules.js`: inventario y ejemplos.
- `dist/noodo-design-system-v0.3.json`: exportación versionada del inventario.
- `node scripts/sync-design-system.cjs`: sincroniza exportación y tipografía publicada. `node --test tests/*.test.cjs` detecta divergencias.

## Fundamentos

| Token / regla | Valor y uso |
|---|---|
| Fondo | #110B1B |
| Reproductor | #09060F |
| Superficie / elevada | #1C1429 / #291E3B |
| Acción / acento suave | #6F36E1 / #C397F4 |
| Texto / secundario | #F5F2E9 / #BCB7C2 |
| Foco | Acento visible, contorno separado del control |
| Espaciado | 4, 8, 12, 16, 24, 32, 48, 64 px |
| Radios | Campo 8, tarjeta 16, panel 24, pill 999 px |
| Objetivo de pulsación | 44 × 44 px para controles independientes |
| Texto mínimo | 12 px; texto secundario no usa el neutral decorativo |
| Superficies | Planas o transparentes; ilustraciones y capas fotográficas son excepciones de contenido |
| Shell | Móvil hasta 760 px; escritorio desde 761 px; ancho amplio desde 1500 px |
| Movimiento | Respetar prefers-reduced-motion; foco y estado no dependen de animación |

| Rol | Escritorio, tamaño/interlínea | Móvil |
|---|---|---|
| Display | 40/46 | 26/32 |
| Title | 26/32 | 20/26 |
| Heading | 18/24 | 16/22 |
| Body | 16/24 | 16/24 |
| Label | 14/20 | 14/20 |
| Meta | 12/18 | 12/18 |

Tipografía del sistema operativo. PP Neue Montreal sigue pendiente de archivos y licencia. No presentar la aproximación como la fuente de marca definitiva.

## Cobertura y propiedad de componentes

| Familia | Implementación | Contrato |
|---|---|---|
| Header, búsqueda, menú y biblioteca | listen.html, navigation.js, workspace.css | Controles separados; rail conserva iconos; menú móvil accesible |
| Navegación móvil | workspace.css, navigation.js | Cinco destinos en una fila, safe-area y espacio reservado bajo dock |
| Dock, transporte, progreso, volumen | listen.js, listen.css | Nombre accesible, estado reproducir/pausar y rangos nativos |
| Dock lateral, cola, volumen flotante | section-player.js/css | Mismo dock global, sin duplicarlo; acciones de cola en segunda línea |
| Información contextual | listen.js | Tabs Canción, Artista, Conciertos y Letras; panel asociado |
| Filas de pistas | noodoTrackList en listen.js | Reutilizadas por catálogo, cola, álbum y playlist; título truncable sin invadir acciones |
| Portadas de catálogo | catalog-cards.js/css | Cuadradas, mínimo objetivo 180 px / 140 px, gap 16, máximo 8 columnas; última tarjeta Ver todas en previews |
| Playlists | experience.js | Biblioteca de portadas → detalle → regreso; vacío con reproducción deshabilitada |
| Géneros y bandas | experience.js, catalog-cards.js | Directorios completos, enlaces a perfiles, misma escala de portadas |
| Perfil, álbum, galería, booking | artist.js, artist.css | Secciones internas y filas compartidas; ausencia de URL oficial explícita |
| Publicidad | listen.js, workspace.css | Arte 3:1, sin degradado, Publicidad visible; Ver más y Comprar tiquete |
| Originals y vídeo | listen.js, editorial.js | Poster 16:9, acciones independientes, no autoplay; proveedor identificado |
| Editorial | editorial.js, article.html | Tarjeta y artículo con shell compartido |
| Radar, filtros, mapa, popup | radar.js/css, event-card.js | Lista alternativa al mapa; seleccionados, filtros y vacío; acciones etiquetadas |
| Evento, localidades, QR informativo | event-page.js/css, event-identity.js | Identidad única, COP, hora de Colombia; QR del evento distinto de boleta |
| Checkout y boleta demo | checkout.js/css, checkout-model.js | Validación de cantidades, resumen, estados de pago; sin cobro ni admisión real |
| Comunidad, salas, Match, foro | community.js, community-ui.js | Demo local explícita, entrada, vacío, búsqueda y formularios |
| Diálogos, menús, avisos, formularios | Módulos anteriores + catálogo | Foco visible, nombre, error comprensible, cierre y retorno al origen |

## Estados mínimos por componente

Accionables: reposo, hover, foco, pulsado/seleccionado e inactivo. Colecciones: contenido, vacío, sin resultados y carga/error cuando existe red. Formularios: etiqueta, ayuda, requerido, inválido y confirmación. Medios: poster, disponibilidad y fallo del proveedor. Los estados pendientes no deben simular servicios reales.

No anidar botones en enlaces. No solucionar un desborde reduciendo texto por debajo de 12 px. No colocar objetivos interactivos sobre otros objetivos, salvo overlays intencionales con apertura/cierre y foco controlados. Las acciones de una tarjeta deben ocupar regiones independientes.

## Editor y alcance de personalización

Vista previa, Guardar cambios, Cancelar, restablecer, importar JSON validado y exportar JSON/CSS. Escape o cerrar descarta el borrador. Cancelar restaura la configuración previa. Los siete pares de contraste están visibles: neutral/secondary (3,40:1) no sirve para texto pequeño; fondo/primary (3,03:1) tampoco. Usar los pares de texto aprobados.

El editor, el reproductor y el checkout consumen theme.js: seis colores editables, superficies derivadas, foregrounds de acciones, familia tipográfica y radios semánticos. Guardar sincroniza otras pestañas mediante storage; Cancelar solo revierte el borrador de la pestaña actual. JSON corrupto o almacenamiento bloqueado recupera valores seguros. La exportación CSS incluye exactamente las variables del runtime. Portadas, campos y paneles usan radios derivados; pills y círculos conservan su geometría funcional.

## Criterio de aceptación

Revisar 320, 390, 525, 768, 1024 y 1440 px, con biblioteca abierta/cerrada y textos largos. Verificar ausencia de scroll horizontal global, nombres accesibles, foco, teclado, controles sin intersección, estabilidad de portadas, dock y navegación. Ejecutar tests y comparar tokens/inventario. Para certificación pixel perfect hacen falta diseños aprobados, capturas base reproducibles y comparación por navegador; esta auditoría no reemplaza ese proceso.

### Ajustes de Comunidad y navegación · 24 noviembre 2026

- `LibraryNavigationItem`: componente compartido en las nueve entradas, altura de 48 px, icono de 20 px y un solo estado activo derivado de la vista visible; rail plegado de 44 px. El estado se conserva al abrir y cerrar paneles y al acceder a una sección que solicita perfil de demo.
- `CommunityEntryCard`: tres columnas con arte de campaña coherente para Salas de chat, Nodo Match y Foro. En móvil se apilan y la selección abre la sección correspondiente tras entrar a la demo.
- `TrackRow` variante `compact`: canción y artista en dos líneas, acciones compartidas de guardar y añadir a playlist de 44 px. La cola lateral omite portada, duración, género y botón de play independiente; el título y Enter/Espacio siguen reproduciendo.

### Directorio y navegación · 26 noviembre 2026

Artistas abre el catálogo completo sin perfil demo y reutiliza ArtistCard y el selector de vista existente. El sidebar expandido usa objetivos de 56 px, padding horizontal de 16 px y separación de 8 px mediante tokens semánticos; el rail plegado mantiene sus botones de 44 px. La comparación con el commit anterior no mostró cambios de geometría: esta ampliación responde al ajuste visual solicitado.

Ajuste posterior del sidebar: anclado al borde izquierdo sin el desplazamiento exterior de 20/14 px, conservando la posición del contenido central. Botones de 48 px con padding vertical de 4 px y texto Body (16 px) con interlínea Label (20 px). El rail plegado permanece en 44 px.

UI 86 compacta el sidebar a botones de 44 px, padding vertical de 2 px y gap de 4 px, conservando texto de 16 px. Elimina asimismo los desplazamientos de izquierda en las reglas base de escritorio y tablet.

- **UI 87:** texto del menú aumentado exactamente 2 pt mediante token semántico (16 px + 2 pt); sidebar expandido 50 px más ancho en escritorio y reproductor lateral de 272 a 372 px desde 1101 px. Se conservan las dimensiones compactas de tablet, móvil y barras plegadas.

- **UI 88:** Artistas incluye Bandas recomendadas mediante el mismo montaje de tarjetas adaptables que Inicio, con Ver todas al final. ArtistCard muestra reproducción como botón circular de icono de 44 px y conserva su nombre accesible específico por artista. Sin revisión visual nueva; comprobaciones automatizadas y sintaxis del sitio.
