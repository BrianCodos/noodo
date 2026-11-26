# Validación del portal · 24 de noviembre de 2026

- `npm run build`: correcto, TypeScript y Vite.
- `npm test`: 13 pruebas correctas. Migración de colecciones sin sustituir datos, historial sin recorte y versiones, conservación de relaciones al cancelar reuniones, notas acumulativas, estados coherentes de tareas, importes válidos y exclusión de movimientos anulados del balance.
- Navegador: clic en fecha abre formulario con fecha precargada; clic en evento abre el panel derecho. En un origen de prueba separado (`localhost:5173`) se guardaron una reunión, su acta, tarea, nota y archivo TXT. Se verificó el cambio de tarea a En curso, registro contable y versiones en LOG. La recarga conserva los registros.
- Móvil: 390 px, calendario y tareas sin desbordamiento de página; detalle dentro del diálogo compartido, 358 px de ancho; navegación móvil con los módulos nuevos.
- Datos habituales del usuario: origen `127.0.0.1:5173`; las creaciones de QA no se guardaron allí.
- Durante el desarrollo, una actualización en caliente del contexto React requirió recargar las pestañas; la carga normal funciona y conserva los datos.

Comunidad sigue como iframe externo y no comparte aún el LOG ni los editores React. Las cuentas, firma real, auditoría de servidor y despliegue continúan fuera de esta versión local.
