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
