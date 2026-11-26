# noodo · Portal administrativo local

Primera versión en React, TypeScript y Vite. La aplicación vive separada del sistema de diseño y consume directamente sus tokens. No requiere servicios externos para explorar los módulos.

## Desarrollo

Desde `noodo-admin/`:

```sh
npm install
npm run dev
```

Abrir `http://127.0.0.1:5173`. El servidor escucha únicamente en la interfaz local.

```sh
npm run design:check
npm test
npm run build
```

`design:check` comprueba la versión más reciente de `../noodo-design-system/dist/` y sus huellas contra `design-system.lock.json`. Ante un cambio, revisar la especificación y los tokens antes de actualizar el registro. La fecha de exportación no afecta la huella de la especificación. Nunca sustituir la importación compartida por una copia de colores.

## Mapa de navegación

- `/inicio`: indicadores, proyectos, agenda y compromisos.
- `/proyectos`: creación, edición, filtros y vista de tarjetas o lista.
- `/proyectos/:id`: expediente con resumen, contactos, cotizaciones, reuniones, actas, compromisos, documentos y actividad.
- `/contactos`: directorio unificado.
- `/cotizaciones`: servicios, cantidades, impuestos, seguimiento e impresión.
- `/calendario`: creación por fecha y expediente de reunión con actas, compromisos, archivos y seguimiento.
- `/tareas`: tablero Pendiente / En curso / Completada con responsable, prioridad, fecha y seguimiento.
- `/contabilidad`: ingresos, egresos, balance filtrado y recibos adjuntos.
- `/log`: historial de guardados, filtros, versiones y exportación.
- `/actas`: temas, decisiones y relación con proyecto/reunión.
- `/legal`: documentos corporativos y de proyectos.
- `/documentos/:id`: revisión y descarga del documento.
- `/documentos/:id/firmar`: recorrido de firma pendiente de integración.
- `/configuracion`: información del entorno, exportación y conservación de datos.
- `/componentes`: catálogo visual de componentes reutilizables.

## Componentes y datos

- `src/components/ui`: botones, campos, badges, tarjetas, tablas, estados, formularios y diálogos accesibles. Los editores protegen cambios sin guardar; `changeKey` permite detectar además cambios programáticos de una colección.
- `src/components/layout`: estructura de tres zonas, navegación, buscador y apoyo contextual permanente.
- `src/components/domain`: tarjetas de proyecto, compromisos y selector de proyecto.
- `src/features`: módulos compuestos a partir de componentes comunes.
- `src/data`: modelos, datos ilustrativos, repositorio y estado compartido.
- `src/lib`: formato de fechas/importes, búsqueda y cálculo de cotizaciones.

Los registros se guardan bajo `noodo.admin.v1` en localStorage. Los PDF se guardan en IndexedDB (`noodo-admin-files`). La exportación JSON incluye registros, **no los archivos adjuntos**; descargar esos documentos y recibos individualmente. Los datos pertenecen a este navegador y origen: cambiar el puerto, host o navegador crea otro espacio local. Borrar los datos del navegador puede eliminarlos. No hay sincronización entre dispositivos.

La moneda es COP y las fechas se presentan para Colombia. Los datos iniciales son ejemplos. Las acciones de seguimiento no envían correos, invitaciones ni cotizaciones.

## Firma y siguiente etapa

La interfaz permite revisar un documento y avanzar al paso de identidad. La acción de firmar está deshabilitada hasta integrar autenticación, autorización individual de cada socio, proveedor de firma y servidor. Esta versión no crea firmas, certificados ni evidencias legales.

La siguiente etapa requiere persistencia de servidor, cuentas y permisos, almacenamiento de documentos, integración de firma dentro del portal, verificación de eventos del proveedor y conservación de las versiones y evidencias. Un documento parcialmente firmado debe mantenerse separado de uno firmado por ambos. El despliegue queda para una instrucción posterior.

## Verificación de esta versión

- Compilación TypeScript y build de producción.
- Pruebas unitarias (incluyen migración, conservación del LOG, estados de tareas y contabilidad), además de las iniciales: actualización sin perder relaciones, conservación de almacenamiento corrupto, error de cuota, recarga de datos, redondeo de cotizaciones y búsqueda sin tildes.
- Revisión manual en navegador: persistencia de un proyecto, navegación, protección de formularios, revisión del flujo de firma y adaptación móvil a 390 × 844.
- No se han probado servicios de identidad/firma ni envíos externos; no están conectados.

Los contratos reutilizables y los límites de la integración de Comunidad se documentan en `docs/component-contracts.md`.

## Consulta y búsqueda unificadas

La navegación ocupa la izquierda; los expedientes se abren en el centro y el panel derecho conserva resúmenes y accesos de la sección o proyecto. `PageHeader` y `SectionToolbar` unifican encabezados y acciones. En móvil el apoyo se apila y conserva accesos directos.

- `/reuniones/:id`: expediente completo, documentos, compromisos y seguimiento.
- `/visor/acta/:id` y `/visor/archivo/:id`: visor compartido con los documentos legales. PDF, imágenes y TXT se abren dentro del portal; Office se descarga.
- `/registros/:collection/:id`: detalles centrales de tareas, movimientos, contactos, cotizaciones y LOG.
- `/buscar?q=…`: resultados agrupables por tipo, sin depender de tildes ni mayúsculas.
- `/catalogo/:id`: fichas del catálogo local de artistas, música, sesiones, artículos y eventos.

`npm run catalog:sync` se ejecuta antes de desarrollo y compilación. Actualiza el catálogo generado desde los archivos de noodo sin modificar esas fuentes. La búsqueda cubre textos registrados, actas y borradores; los archivos adjuntos se encuentran por nombre y metadatos. No indexa Internet ni los datos propios del iframe externo de Comunidad.

## Expedientes por proyecto · 24 de noviembre de 2026

Proyectos concentra tareas, cotizaciones, reuniones, actas, documentos, contactos, contabilidad y actividad. Las rutas anteriores de los módulos permiten seleccionar un proyecto y abrir su sección; ya no crean registros independientes. Los documentos corporativos anteriores se conservan en «Gestión interna NOODO». Los IDs de proyectos ausentes se recuperan sin cambiar las referencias existentes.

En `/proyectos/:id/tareas`, la tabla despliega un nivel de subtareas con responsable, estado, inicio, fecha límite, avance, entregables y comentarios. Las celdas editables abren el formulario común; el botón + crea una subtarea. La selección muestra contexto y el acceso al detalle completo. Este detalle permite definir entregables con criterios de aceptación, fechas, estados, enlaces y archivos, y conservar comentarios propios por tarea/subtarea.

El avance de una hoja es manual (0–100); el padre usa el promedio simple de sus subtareas y el proyecto el promedio de sus tareas principales. Añadir una subtarea pendiente reabre el padre si estaba completado. Los entregables tienen un estado independiente de ese porcentaje. La tabla se desplaza horizontalmente dentro de su contenedor en móvil.

Verificación: pruebas de proyecto obligatorio, recuperación de registros, relaciones del mismo proyecto, jerarquía, avance, historial y persistencia. Recorrido manual en navegador: subtarea asignada a Socio 2 con avance de 40%, actualización de su padre, entregable en revisión, edición nativa de fecha, comentario independiente y recarga. Vista móvil de 390 × 844 verificada sin desbordamiento de página. Pruebas manuales en el origen localhost, separadas de los datos del usuario en 127.0.0.1. Los adjuntos reutilizan el almacenamiento local existente; no hay colaboración multiusuario ni sincronización de archivos con servidor.
