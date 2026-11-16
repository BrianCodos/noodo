# NOODO · revisión de perfil 17

Implementado localmente el 16 de noviembre de 2026.

- Superficies transparentes: cabecera, mini reproductor y contacto/booking. Tokens compartidos con el catálogo y exportaciones JSON/CSS.
- Nombre y tipo de perfil en una fila; se retiró Integrantes del menú conservando los enlaces de sus integrantes.
- Biblioteca fija en escritorio; inset de 24 px compartido con las columnas central y derecha.
- Mini reproductor independiente: conserva su propio índice, tiempo y volumen; pausa el global sin modificar su pista o cola. Al abandonar el perfil mientras reproduce, reanuda el global. El global pausa al mini cuando se activa.
- Galería con visor integrado, controles anterior/siguiente y vuelta a cuadrícula, flechas/Escape y restauración de foco.
- Cuatro portadas generadas mediante image_gen integrado. Originales preservados. Prompts, originales y destinos en album-covers-v17.json. Imágenes inspeccionadas visualmente.

## Comprobaciones

- Sintaxis de artist.js, listen.js, player-rules.js, player-lab.js y app.js correcta.
- Navegador a 1771 × 1314: mini inicia Arder despacio mientras Entre luces queda pausada exactamente en 131 segundos. Cambiar canción y volumen del mini no modifica el global (70 frente a 69).
- Activar global pausa mini; salir del perfil con mini activo reanuda Entre luces desde su posición conservada.
- Biblioteca fija a 80 px del borde superior durante el desplazamiento; contenido de tres columnas comienza con inset de 24 px.
- Galería cambia a foto 2/12 sin abrir el detalle central; regresar restaura foco a la primera miniatura. Galería y mini tienen igual alto.
- Booking: contenedor y artículos con fondo transparente, ningún degradado y tres iconos en etiquetas.
- Cuatro portadas 280 × 280 px, todas cargadas. Vista a 390 × 844 sin desbordamiento horizontal, mini apilado con divisor superior.
- Catálogo visual carga los nuevos componentes sin errores de consola.

La reproducción sigue siendo una simulación del prototipo local; esta revisión separa los estados y controles, sin introducir archivos de audio.
