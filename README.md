# NOODO

Design system y prototipo web de NOODO: descubrimiento musical, reproductor persistente, perfiles de artistas, álbumes, sesiones, conciertos y galería.

## Ejecutar en local

No requiere instalar dependencias ni compilar. Desde la raíz del repositorio:

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

- Design system: http://127.0.0.1:4173/index.html
- Reproductor: http://127.0.0.1:4173/listen.html
- Perfil de artista: http://127.0.0.1:4173/artist.html?artist=1

Usar un servidor HTTP; la navegación carga fragmentos HTML mediante `fetch`.

## Estructura

- `dist/`: código fuente estático HTML, CSS y JavaScript, listo para servir.
- `dist/assets/`: imágenes, fotografías y portadas utilizadas por la interfaz.
- `dist/player-rules.js`: reglas compartidas del reproductor y los perfiles.
- `dist/typography.js` y `dist/typography.css`: sistema tipográfico semántico.
- `dist/noodo-design-system-v0.3.json`: exportación del design system.
- `dist/noodo-tokens-v0.3.css`: tokens de diseño exportados.
- `REVIEW-V18.md`: última revisión de estructura y verificaciones.
- `image-prompts-v16.json` y `album-covers-v17.json`: documentación de creación de recursos visuales.
- `preview-*.png`: capturas de las iteraciones de diseño.

## Estado del proyecto

Prototipo de diseño interactivo con contenido de demostración. Los controles de escucha simulan reproducción; no hay un catálogo de audio conectado. Favoritos y playlists se conservan en el navegador. La compra de entradas, el booking y los enlaces de plataformas necesitan sus integraciones antes de utilizarse en producción.

El reproductor del artista mantiene estado independiente del global. La cabecera del perfil organiza foto, información y canciones en tres columnas; después aparecen álbumes y una fila con conciertos y galería. La interfaz se adapta a tablet y móvil.

## Validación básica

```sh
for file in dist/*.js; do node --check "$file" || exit 1; done
```

La revisión visual y funcional más reciente se realizó a 1771×1314, 1093×827 y 390×844. Los detalles están en `REVIEW-V18.md`.

## Web publicada

- Reproductor: https://briancodos.github.io/noodo/listen.html
- Design system: https://briancodos.github.io/noodo/

GitHub Actions publica la carpeta `dist/` en GitHub Pages cuando hay cambios en ella en `main`. El workflow también puede ejecutarse manualmente desde Actions.

## Actualización del reproductor · UI 82

- Cabecera flexible con buscador ampliado y un ancho máximo de 1440 px para búsqueda y herramientas. Los filtros de Radar, vista de artistas, tipo de resultado y Comunidad se muestran a la derecha según la sección activa. En móvil y tablet se agrupan en un botón accesible, conservando sus controles y estado originales.
- Buscador único en la barra superior: canciones, artistas, Sessions, playlists, géneros, eventos y Comunidad. Admite tildes, varias palabras y códigos de evento. Presenta sugerencias y una vista completa con filtros por tipo; en Radar filtra las tarjetas y los marcadores sin salir del mapa. El foro utiliza el mismo campo. La búsqueda local no envía consultas a terceros.
- Radar sin título ni buscador duplicados; conserva el encabezado accesible y coloca el filtro de fechas junto a los controles de vista.
- Confirmación accesible antes de abrir Google Maps: «Aceptar» abre el destino en otra pestaña; «Quedarse en la página» o Escape conserva el evento y restaura el foco.
- Biblioteca «Me gusta» con playlists, tarjetas para crear y ver todas, y controles de reproducción debajo de las portadas.
- Navegación «Sessions» y acceso a playlists junto al buscador. Los artistas por género abren en cuadrícula por defecto y conservan la opción de lista.
- Tres playlists editoriales de NOODO por género, con portadas, página de canciones y reproducción normal o aleatoria. `dist/genre-playlists.js` selecciona únicamente canciones del género, incluidos géneros secundarios. Las colecciones sin catálogo muestran «Próximamente»; no se añaden a las playlists personales.
- Apertura de secciones desde arriba con transición sutil de 320 ms; skeleton durante la carga asíncrona de perfiles con un mínimo de 160 ms para evitar parpadeos, sin espera adicional cuando la carga ya supera ese tiempo. Respeta la preferencia de movimiento reducido y cancela cualquier espera al cambiar de destino. Volver conserva la posición anterior.
- Acciones Apoyar, like y añadir alineadas en las filas compactas del artista, y controles publicitarios comunes en todas las rutas del reproductor.
- Documentación, scripts y evidencia de la biblioteca de componentes de Figma en `design/figma/`. Su punto de partida es UI 70; los ajustes web posteriores no implican sincronización automática del archivo de Figma.

Los estilos de `dist/workspace.css` se generan a partir de `styles/workspace/`:

```sh
node scripts/build-workspace.cjs
node scripts/build-workspace.cjs --check
node --test tests/*.test.cjs
```

Validación de esta actualización: 33 pruebas automatizadas. Revisión visual y funcional en escritorio y móvil de búsqueda, navegación y confirmación de Google Maps, además de las comprobaciones previas de biblioteca y playlists editoriales. El contenido musical continúa siendo una demostración sin catálogo de audio conectado.

## Radar · Mapbox

Radar usa Mapbox GL JS 3.35.0, cargado desde el CDN oficial únicamente al abrir la sección. Conserva una sola instancia al cambiar de sección, y sincroniza el buscador y las tarjetas con los marcadores. Los eventos y sus coordenadas son ejemplos, no una agenda real.

Para activar el mapa, configurar `accessToken` en `dist/mapbox-config.js` con un token **público** (`pk.`) de la cuenta de Mapbox. Restringir sus URLs autorizadas a los orígenes de desarrollo y producción. No usar tokens secretos (`sk.`). El campo `style` admite una URL de estilo de Mapbox Studio.

Sin token, el buscador y las tarjetas siguen funcionando y el mapa presenta un estado de indisponibilidad. Los errores de red, autorización o WebGL presentan una opción de reintento. Mapbox mantiene visibles sus controles y atribuciones. Validar con un token real: abrir Radar, buscar un artista, seleccionar tarjeta y marcador, cambiar de sección y volver, y comprobar móvil y escritorio.

## Comunidad · vista previa local

- `listen.html?section=community`: salas, Match por disciplina y foro unificado.
- `community-admin.html`: crear, editar y cerrar salas oficiales; retirar entradas del foro.
- En `../noodo-admin/`, la ruta `/comunidad` incrusta esta administración desde el servidor público local del puerto 4174. Ambos usan el mismo origen del iframe y por ello comparten la configuración de ejemplo. El servidor público debe estar encendido.
- `community.js` y `community.css` reutilizan los tokens vigentes. Los perfiles de Match enlazan al catálogo de artistas existente; sus disciplinas e interés previo son datos de ejemplo.
- La identidad de demostración vive en sessionStorage. Mensajes, intereses, salas y entradas viven en `noodo-community-v2` en localStorage. No hay usuarios reales, envío de mensajes, autenticación, permisos de servidor ni sincronización entre dispositivos. La administración es únicamente una demo local.
- El flujo de invitado solicita un perfil demo antes de Comunidad, favoritos, seguimiento y playlists. Escuchar canciones y ver sesiones permanece abierto. Este control de interfaz no es una barrera de seguridad.
- Producción pendiente: identidad autenticada, roles de equipo, vinculación usuario/artista, autorización de lectura y escritura en servidor, almacenamiento por usuario, chat en tiempo real y match mutuo calculado por servidor.
- La versión anterior del feed permanece intacta en `noodo-community-v1`; no se borra ni migra automáticamente.

Revisión 2026-11-23: navegación de invitado, entrada demo, filtro Arreglista, match de ejemplo, formulario de publicación y visibilidad del post en administración comprobados en Chrome. Validación de sintaxis JS correcta; build de administración y sus seis pruebas existentes correctos. Vista móvil pendiente de revisión visual.

### Componentes de Comunidad · 23 de noviembre

`community-ui.js` expone `noodoPageTitle.render(title)` y `noodoAvatar.render(configuration, accessibleLabel)`. PageTitle es un único h1 sin antetítulo ni descripción, usado por Comunidad, Radar y administración de Comunidad. La ilustración paramétrica de Avatar conserva los rasgos de `assets/character-reference.png` y admite cinco colores de audífonos, cuatro expresiones y cuatro accesorios. Las opciones se validan contra listas cerradas; los textos se escapan.

El selector de emoticones tiene categorías Caras, Gestos, Música y Símbolos, etiquetas accesibles e inserción en la posición del cursor. Los borradores se mantienen al cambiar de sala. El diálogo de personalización admite cancelar y Escape, conserva el foco y guarda solo al confirmar. La apariencia se conserva localmente por el nombre del perfil de demostración; los nuevos mensajes guardan una copia del avatar.

La columna de participantes presenta presencia real **solo dentro de esta demo local**: una entrada por perfil entre pestañas del mismo origen, heartbeat de 10 segundos y expiración de 30 segundos. Cambiar de sala, salir o cerrar la pestaña retira la presencia anterior. No representa usuarios de otros dispositivos ni una sesión autenticada. Para producción se necesita presencia autorizada en servidor y un ID de usuario estable.

Validación de esta iteración: Chrome mostró el título simplificado; selección y guardado de color Menta, expresión Feliz y accesorio Nota; inserción y envío de un emoji; entrada de una segunda pestaña (2 participantes) y salida al cerrarla (1 participante). Sintaxis de los archivos JS modificados revisada. No se realizó una revisión móvil nueva.

### Distribución de Comunidad y Radar

`section-player.js` traslada el único reproductor existente a la columna derecha en Comunidad y Radar; al salir de estas secciones vuelve a su posición inferior. Se conservan controles, IDs y estado de reproducción. En móvil se presenta en el flujo de la página, encima del contenido, sin superponer una barra inferior. `section-player.css` define ambas distribuciones. Las salas de chat aprovechan la altura de la ventana, mantienen el historial desplazable y añaden el directorio «Todas las salas» debajo, con acceso directo a cada sala abierta por administración.

Comprobado en Chrome: chat ampliado, directorio renderizado, reproductor lateral en Comunidad y Radar, y retorno al reproductor inferior fijo en Inicio; una sola instancia de reproductor en todos los casos.
