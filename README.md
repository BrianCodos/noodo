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
