# Revisión de UI NOODO

Guía para el agente revisor de UI. Revisar los cambios contra los tokens y contratos del sistema de diseño y reportar hallazgos con selector, causa y corrección. No afirmar validación visual si no se abrió el navegador.

- Calcular contraste de texto normal (mínimo 4,5:1) y de controles e indicadores (3:1). Revisar estilos heredados de spans y SVG, estados hover, foco y selección.
- Usar colores semánticos del sistema. El CTA lavanda usa #C397F4 de fondo y #110B1B de texto: contraste 8,32:1.
- Verificar lista y cuadrícula en 320, 390, 525 px y escritorio, sin desbordamiento; mantener objetivos táctiles de 44 px y etiquetas accesibles.
- ArtistCard en lista: sin borde inferior; fotografía cuadrada izquierda y acciones junto a ella. Permitir ajuste interno sin ocultar funciones.
- Comprobar teclado, foco visible, guardar/desguardar y reproducción; mantener contratos en content.js y JSON sincronizados.

## Revisión del 21 de noviembre de 2026

El agente independiente confirmó el selector genérico `.genre-artist-card span` como causa del contraste 1,18:1, el borde inferior explícito y la regla móvil que desplazaba todas las acciones debajo de la fotografía. Se corrigieron esas reglas. Validación visual en navegador pendiente.

- Cards: rechazar fondos degradados decorativos. Usar superficie plana o transparente; la tarjeta editorial es transparente. Revisar también hover, selección y exportación CSS.

## Auditoría de escritorio — 23 de noviembre de 2026

- Hallazgo: navegación principal con `justify-content:space-between`, distinta de los accesos secundarios. Corregido con alineación izquierda común, icono 20 px, separación 12 px y padding 10/12 px.
- Unificados objetivos mínimos de 44 px, tipografía label, texto muted, activo accent/secondary, hover surface y foco visible. Se conserva el sidebar plegado con iconos.
- Géneros del inicio: una fila de cinco tarjetas y acceso al directorio; tres tarjetas más acceso en centros estrechos. El directorio conserva todos los géneros.
- Sesión e historia editorial: dos columnas de escritorio, apiladas en móvil.
- Novedades: cuatro portadas existentes del prototipo vinculadas a canciones del catálogo y al reproductor compartido; sin inventar fechas de lanzamiento.
- Verificaciones realizadas: sintaxis JavaScript, diff, disponibilidad de archivos de portada, canciones, orden de secciones y HTTP 200 local. Revisión visual y medición de píxeles en navegador pendientes; no se certifica pixel perfect sin esa comprobación.
