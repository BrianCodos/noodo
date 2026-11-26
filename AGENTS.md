# NOODO — instrucciones, estado y memoria del proyecto

Actualizado: 26 de noviembre de 2026. Este archivo es la entrada para continuar el proyecto en otro equipo. Describe lo comprobado en el código y distingue el producto previsto de las integraciones pendientes. Las instrucciones actuales del usuario prevalecen sobre esta memoria.

## 1. Propósito y alcance

NOODO es un proyecto cultural de Cali para descubrir música, artistas, historias, eventos y oportunidades de colaboración. Su dirección de producto combina escucha gratuita, comunidad, eventos, publicidad y servicios/representación artística. La monetización, aprobación de artistas y moderación por denuncias son objetivos de producto, no servicios implementados. El CTA acordado para eventos es **Comprar entrada**; no volver al modelo de reservas. Las localidades son configurables como concepto y no tienen sillas numeradas en esta etapa.

El proyecto tiene tres partes:

1. **Sitio musical:** prototipo HTML/CSS/JavaScript publicado en GitHub Pages.
2. **Sistema de diseño:** tokens, catálogo, contratos, editor de tema y materiales de Figma que gobiernan ambas interfaces.
3. **Dashboard de socios:** aplicación React/TypeScript/Vite para gestionar proyectos, trabajo, documentos y presupuestos, con persistencia en el navegador.

Ninguna parte incorpora aún un backend de producción. No presentar perfiles de demostración como cuentas autenticadas, reproducción simulada como streaming real, boletas de ejemplo como entradas válidas ni selección de socio como autorización.

## 2. Repositorio y estructura

Repositorio: `https://github.com/BrianCodos/noodo`, rama `main`.

| Ruta desde la raíz del repositorio | Contenido y regla |
| --- | --- |
| `dist/` | Fuente estática del sitio y design system; está versionada y se publica. **No borrarla como si fuera un build desechable.** |
| `dist/assets/` | Portadas, retratos, flyers, campañas e ilustraciones utilizadas por el sitio. |
| `styles/workspace/` | Módulos CSS ordenados por `manifest.json`; fuente de `dist/workspace.css`. |
| `scripts/` | Generación/verificación del CSS y exportaciones del sistema de diseño. |
| `tests/` | Pruebas del prototipo con `node:test`. |
| `noodo-admin/` | Dashboard completo: aplicación, scripts, lockfile, pruebas, planificación y documentación. |
| `noodo-admin/src/components/ui/` | Primitivas y contratos de interacción accesibles. |
| `noodo-admin/src/components/layout/` | Shell, rutas de navegación, socio activo, notificaciones y apoyo contextual. |
| `noodo-admin/src/components/domain/` | Componentes compartidos de proyectos, tareas, documentos, equipos y comentarios. |
| `noodo-admin/src/features/` | Pantallas y editores de cada módulo. |
| `noodo-admin/src/data/` | Tipos, repositorio local, migraciones, presupuesto, catálogo generado y ejemplos. |
| `noodo-admin/src/lib/` | Búsqueda, fechas, importes, progreso, breadcrumbs, menciones y texto enriquecido. |
| `noodo-admin/docs/`, `planning/` | Contratos, verificaciones históricas, mapas y capturas. |
| `design/figma/` | Scripts, estado y evidencia de la biblioteca en Figma; no se sincroniza sola con la web. |
| `documentos/` | Acuerdos y plan operativo en DOCX, conservados como borradores versionados. |
| `generated_images/` | Originales gráficos de la carpeta de trabajo; algunos coinciden con assets publicados. |
| `docs/` | Historial web, inventario de incorporación y verificación de esta actualización. |
| `.github/workflows/pages.yml` | Publica únicamente `dist/`; no publica el dashboard ni los DOCX. |

La carpeta Git original en este equipo es `Musicaly/noodo-design-system/`; el dashboard de trabajo existía fuera de Git, en `Musicaly/noodo-admin/`. Esta actualización lo incorpora como `noodo-admin/` dentro del repositorio sin mover ni borrar la carpeta de trabajo original. Los archivos de `integrations/noodo-admin/` eran una copia parcial antigua: se sustituyen por la aplicación completa, con una nota de migración en `integrations/README.md`.

En un clon nuevo, editar **solo `noodo-admin/` dentro del repositorio**. En el equipo original, comprobar cuál sirve el proceso Vite antes de editar; si todavía sirve la carpeta hermana, trasladar sus cambios a la copia versionada antes de subir. No alternar dos copias sin compararlas. `scripts/design-system-path.mjs` del admin resuelve ambas distribuciones y evita rutas absolutas del equipo.

## 3. Instalación y ejecución

Requisitos: Git, Python 3 para servir el sitio y Node.js 24 con npm para el dashboard. Entorno comprobado durante la incorporación: Node 24.14.1 y npm 11.11.0. Usar `package-lock.json`; no actualizar dependencias por iniciativa propia al retomar una tarea.

```sh
git clone https://github.com/BrianCodos/noodo.git
cd noodo
```

Terminal A, desde la raíz:

```sh
python3 -m http.server 4174 --bind 127.0.0.1 --directory dist
```

Terminal B, desde la raíz:

```sh
cd noodo-admin
npm ci
npm run dev
```

| Dirección | Uso |
| --- | --- |
| `http://127.0.0.1:4174/listen.html` | Sitio musical local. |
| `http://127.0.0.1:4174/` | Catálogo/editor del sistema de diseño. |
| `http://127.0.0.1:4174/listen.html?section=radar` | Radar y mapa. |
| `http://127.0.0.1:4174/community-admin.html` | Administración de Comunidad demo. |
| `http://127.0.0.1:5173/inicio` | Dashboard de socios. |
| `http://127.0.0.1:5173/presupuestos` | Presupuestos. |
| `http://127.0.0.1:5173/configuracion#socios` | Directorio y selección local de socio. |

El servidor estático no requiere npm ni build. El admin ejecuta `design:check` y `catalog:sync` antes de desarrollo/compilación. `vite.config.ts` resuelve `@noodo/tokens` al CSS indicado por `design-system.lock.json`. No copiar la paleta a otro archivo. El puerto 5173 es estricto para evitar abrir inadvertidamente otra base local si está ocupado. El iframe de Comunidad necesita el servidor del puerto 4174 en el mismo hostname.

No abrir los HTML mediante `file://`: la navegación carga fragmentos con `fetch`. Si un entorno devuelve `listen EPERM`, el servidor no inició; no afirmar que está abierto ni cambiar configuraciones de seguridad. Mantener los datos existentes al diagnosticar errores.

## 4. Estado del sitio musical

- Catálogo de ejemplo: canciones, artistas, géneros, álbumes, Sessions, historias y eventos. La reproducción de audio es simulada; vídeos/enlaces dependen del material disponible.
- Shell común, sidebar plegable con iconos, información contextual y navegación inferior móvil. Un único reproductor global se traslada al lateral en Comunidad/Radar y vuelve al dock al salir; en móvil esas secciones lo presentan en el flujo.
- Búsqueda unificada por canciones, artistas, Sessions, géneros, playlists, eventos y Comunidad. Filtros contextuales en cabecera; Radar conserva mapa y tarjetas sincronizados.
- **Me gusta** abre la biblioteca guardada directamente, en escritorio y móvil, incluso sin perfil demo. No redirigir a Comunidad ni mostrar todo el catálogo. Guardar/cambiar favoritos conserva sus controles de perfil demo existentes.
- Playlists personales locales y tres playlists editoriales por género; el género secundario participa. Géneros sin contenido muestran Próximamente. No mezclar listas editoriales con listas personales.
- Transición de sección de 320 ms y skeleton de perfiles con mínimo de 160 ms, sin demora adicional si la carga ya lo supera. Cancelación al navegar, respeto de movimiento reducido y restauración de scroll al volver.
- Radar usa Mapbox bajo demanda. `dist/mapbox-config.js` solo puede contener token **público `pk.`**. El workflow de Pages lo configura desde `MAPBOX_PUBLIC_TOKEN`. Sin token/red/WebGL se mantiene la lista de eventos y un estado de indisponibilidad/reintento. No registrar tokens `sk.`.
- Antes de salir a Google Maps se presenta confirmación accesible; cancelar/Escape restaura el foco.
- Comunidad: salas, foro, Match por disciplina, avatar personalizable, emojis y presencia entre pestañas del mismo origen. No son usuarios ni mensajes remotos.
- Checkout: localidades, cantidades, datos, medios de pago ilustrativos, resultados y boletas marcadas DEMO. No cobra, reserva aforo, envía correos ni valida ingreso. El QR público del evento es distinto del QR de boleta. Ver `CHECKOUT.md`.

Publicación existente: `https://briancodos.github.io/noodo/listen.html`. Los cambios de `dist/**` en `main` activan Pages. Preservar los enlaces y la distribución estática actuales.

## 5. Estado del dashboard de socios

| Área / ruta | Comportamiento implementado |
| --- | --- |
| `/inicio` | Resumen de proyectos, trabajo y agenda local. |
| `/proyectos` | Lista jerárquica de proyectos → tareas → subtareas; filtros, prioridades, responsables, edición y papelera/restauración. |
| `/proyectos/:id/:tab?` | Expediente por proyecto: resumen, tareas, eventos, documentos, presupuestos vinculados/cotizaciones, contactos, contabilidad y actividad. |
| Proyectos | Nombre editable en línea, alcance enriquecido con marcas permitidas, expandir/plegar, equipo por IDs, prioridad y duplicación configurable con IDs nuevos. |
| Tareas/subtareas | Un nivel de subtareas, fechas, prioridad, estado, progreso, responsables, alcance, requerimientos, entregables y archivos. Detalle por ID y comentarios propios. |
| `/contactos` | Directorio global de los mismos contactos usados por proyectos; panel contextual y filtro de relaciones. |
| `/calendario`, `/reuniones/:id` | Calendario global/proyecto, agenda del día, próximos encuentros, actas, archivos, tareas y seguimiento. Cancelación conservadora. |
| Documentos y `/visor/:kind/:id` | Tabla unificada de actas/adjuntos/documentos, versiones acumulativas, visor central, descarga, papelera y restauración. PDF, imágenes y TXT dentro del portal; Office se descarga. |
| `/presupuestos/:id?` | Presupuesto global, grupos/categorías, asignaciones, gastos reales/proyectados, cuentas manuales, soportes, vistas, copiar/duplicar, fijar, predeterminar, archivar y papelera/restaurar. |
| Cotizaciones de proyecto | Presupuestos vinculados por `projectId`, con métricas vivas; cotizaciones anteriores conservadas en bloque secundario. Desvincular no borra el presupuesto. |
| Contabilidad de proyecto | Ingresos/egresos, balance y soportes; movimientos anulados conservados y excluidos del balance. No duplicar aquí los gastos de Presupuestos. |
| `/log`, `/registros/:collection/:id` | Historial acumulativo, autor local y snapshots anterior/posterior; detalles centrales. |
| `/buscar`, `/catalogo/:id` | Búsqueda estructurada, textos de actas/borradores, metadatos de archivos y catálogo del sitio generado. No busca dentro de binarios ni en Internet. |
| `/configuracion` | Socios, selección del socio activo, foto/rol, exportación JSON y estado del entorno. |
| Menciones/notificaciones | `@` sugiere socios activos del proyecto y sus tareas; comentarios guardan menciones por ID. Bandeja local con lectura por socio, sin auto-menciones y enlace al comentario. |
| `/comunidad` | Iframe del prototipo en puerto 4174; almacenamiento y LOG independientes. |
| `/componentes` | Catálogo de primitivas compartidas. |

Las rutas globales anteriores `/tareas`, `/cotizaciones`, `/contabilidad`, `/actas` y `/legal` seleccionan proyecto, no crean datos huérfanos. Documentos corporativos anteriores se conservan en Gestión interna NOODO. La selección del socio inicial Brian Cobaleda / Keyla Ortiza es un directorio de trabajo editable, no una sesión segura.

Progreso: hojas manuales 0–100; padres promedian subtareas; proyecto promedia tareas principales. Añadir una subtarea pendiente reabre el padre. Estado de entregable y progreso son conceptos independientes. Duplicar un proyecto genera IDs nuevos y reinicia ejecución; no copia archivos, movimientos ni LOG.

Presupuestos adapta estructuras del código de Monymi, sin importar su información financiera personal ni Firebase/Telegram. Solo gastos reales descuentan cuenta; convertir una proyección a real aplica el débito una vez. Cambiar cuenta/importe/anular ajusta los saldos con el registro. Duplicar copia estructura/asignaciones y empieza sin gastos. No ocultar sobreasignaciones ni completar categorías automáticamente. Ver `noodo-admin/docs/presupuestos-monymi.md`.

## 6. Persistencia, conservación y uso responsable

| Almacenamiento | Contenido |
| --- | --- |
| `localStorage['noodo.admin.v1']` | Base de registros, socios, presupuestos, cuentas, borradores, comentarios y LOG. |
| IndexedDB `noodo-admin-files`, store `files` | Blobs de archivos, documentos y soportes. |
| `noodo.active-partner` | Preferencia del socio local, sin cambio de permisos. |
| `noodo.notification-reads.v1` | Lectura de menciones por socio. |
| `noodo-community-v2` | Estado demo de Comunidad; identidad en sessionStorage. |
| `sessionStorage['noodo-purchase-demo-v1']` | Compra/boletas de demostración de esa sesión. |

- El origen incluye protocolo, hostname y puerto: `localhost` y `127.0.0.1` tienen datos separados. Mantener `127.0.0.1:5173` para el espacio habitual. QA interactivo usa un origen separado y no crea datos en el del usuario.
- El repositorio guarda código y documentación, **no** la base ni archivos cargados en el navegador. Exportar registros en Configuración; descargar los adjuntos por separado. El JSON no incluye blobs y no existe importación/restauración completa desde la UI. Nunca afirmar que un push respalda datos del navegador.
- Migraciones aditivas: conservar IDs, referencias, archivos y valores previos. Recuperar expedientes para referencias a proyectos ausentes. Datos corruptos o errores de cuota deben dar error visible, nunca reinicializar silenciosamente.
- No borrar reuniones ni LOG. Cancelar/anular/archivar/enviar a papelera según el dominio; restaurar con el mismo ID. No purga automática, recorte del historial ni botón de vaciado global.
- Adjuntos y soportes son acumulativos/versionados; no sobrescribir un blob o documento firmado. Fotos de socios: PNG/JPEG/WebP hasta 1 MB; adjuntos comunes: hasta 10 MB según el editor.
- LOG conserva autor local, origen de cálculos/migraciones y snapshots. No atribuir retrospectivamente comentarios o entradas históricas a un socio.
- Seleccionar un socio, mostrar menciones o copiar un enlace no crea cuentas, envía invitaciones, comparte datos entre equipos ni ofrece auditoría inalterable.

## 7. Sistema de diseño y reglas de interfaz

Antes de cambiar UI, identificar la versión más reciente de `dist/noodo-design-system-v*.json` y `dist/noodo-tokens-v*.css`; leer `DESIGN_SYSTEM.md` y los contratos relevantes. La versión comprobada al consolidar es v0.3, pero no fijarla como autoridad permanente. En el admin ejecutar `npm run design:check`. Si cambió la guía, revisar diferencias antes de actualizar la huella/importación. `exportedAt` no participa en la huella.

- Una sola identidad: tokens semánticos, tipografía y contratos compartidos; sin paletas paralelas ni ajustes al DS como efecto lateral del admin.
- Tipografía actual del sistema operativo. PP Neue Montreal está pendiente de archivos/licencia. Texto mínimo 12 px, foco visible, objetivos de controles 44 × 44 px, superficies planas y contraste legible.
- CSS del workspace: editar `styles/workspace/*` y regenerar el bundle, nunca editar solo `dist/workspace.css`.
- Admin: `AppShell` tiene navegación, contenido central y un único panel de apoyo. `Workspace`/`DetailPanel` llenan el panel; el expediente y visor completos van en el centro. Paneles plegables y preferencias locales; adaptación móvil sin desbordamiento global.
- `PageHeader`: título y acciones principales alineados, descripción opcional debajo, sin antetítulo. La barra global conserva navegación/breadcrumbs; no poner allí acciones de sección. Entradas históricas en contratos describen fases anteriores; prevalece este estado y el código actual.
- Filas: `IconButton` o enlaces de icono, nombre accesible y tooltip; muchas acciones se agrupan en Más acciones con `Dialog`. Avatar y botón + del equipo comparten diámetro de 44 px.
- `Dialog`: edición modal con foco contenido/restaurado, Escape y protección ante cambios sin guardar. Reutilizar `Field`, `Select`, `Textarea`, `FormActions`, `Alert`, `TaskEditor`, `MinutesEditor`, `RecordAttachments` y `FollowUps`.
- Excepciones implementadas: nombre y alcance del proyecto editables en línea, prioridad en celda y conversación en el panel. Reutilizar sus componentes, validación, guardar/cancelar y manejo de errores.
- Tabla jerárquica adaptable: ocultar columnas secundarias y ofrecer datos en detalle, sin reducir texto ni introducir scroll horizontal global. Expansores independientes de enlaces, `aria-expanded`, control de filtros y teclado.
- Texto enriquecido usa árbol estructurado con bloques/marcas permitidos; no renderizar HTML arbitrario. Pegar como texto seguro.
- Respetar movimiento reducido, orden de foco, estados vacíos/errores/carga y nombres accesibles. No usar estados de éxito para integraciones que no existen.

## 8. Firma, pagos y despliegue

Revisión → identidad → firma ocurre dentro de NOODO como dirección de producto. La acción de firma real está deshabilitada. Requiere identidad autenticada, permisos por firmante, proveedor, servidor, verificación de resultados y conservación del original/evidencias. Una firma parcial no es firma de todos. No guardar secretos en frontend ni fabricar certificados, firmas o evidencias legales.

Los DOCX de `documentos/` son versiones de trabajo, no prueba de firma/aprobación. v4 es la versión local más reciente del acuerdo; no interpretar automáticamente cláusulas propuestas como propiedad consolidada. Conservar anteriores y no reescribir contenido jurídico durante una tarea de UI o sincronización. Datos identificativos pendientes siguen en blanco.

Esta sesión autorizó incorporar y subir **todo el proyecto, incluido el dashboard**, al repositorio existente. Ese permiso permite el push solicitado y la publicación automática del sitio que ya existe. El dashboard se versiona como fuente; no añadirlo a Pages ni habilitar acceso de producción sin una petición de despliegue. La presencia de código en un repositorio público no convierte la demo en un portal privado.

La configuración Mapbox con token queda solo en el archivo de trabajo local: GitHub bloqueó su inclusión por detección de credencial. No intentar eludir esa protección. El repositorio conserva el valor vacío y Actions usa `MAPBOX_PUBLIC_TOKEN`. Puede quedar un único cambio local deliberado en `dist/mapbox-config.js`.

No versionar `.env`, credenciales, claves privadas, `node_modules`, cachés, logs, `*.tsbuildinfo`, exportaciones privadas ni el build `noodo-admin/dist/`. **Esta exclusión no aplica al `dist/` de la raíz.** Mantener licencia de `dist/vendor/qrcode.js` y atribuciones de Mapbox. No cambiar visibilidad del repositorio ni sobrescribir historial remoto con force-push.

## 9. Verificación y entrega

Sitio, desde raíz:

```sh
node scripts/build-workspace.cjs --check
node --test tests/*.test.cjs
for file in dist/*.js; do node --check "$file" || exit 1; done
```

Dashboard:

```sh
cd noodo-admin
npm run design:check
npm test
npm run build
```

Comprobar compilación desde un clon/distribución autocontenida, no solo desde las carpetas históricas. Para cambios de interfaz probar los flujos afectados y móvil/escritorio, incluyendo teclado y ausencia de desbordamiento. Separar resultados automáticos de observación real en navegador; no reutilizar capturas históricas como validación nueva. Los números históricos de pruebas en documentos no sustituyen el resultado de ejecución actual; consultar `docs/VERIFICACION_2026-11-26.md`.

Antes de subir: revisar status/diff, incluir archivos nuevos del dashboard, confirmar origen/rama y comparar con el remoto, ejecutar checks pertinentes y revisar que no entren secretos/datos personales. Conservar cambios del usuario. Si el entorno restringe Git o red, usar el conector GitHub disponible; nunca informar un push como hecho sin verificar el commit remoto. Registrar cualquier limitación de sincronización del checkout.

## 10. Memoria y pendientes para continuar

- **26 noviembre, revisión para sincronización con GitHub:** el usuario solicitó subir todos los avances de NOODO. Se verificaron en el clon Windows autocontenido los cambios de perfil/Acuerdos, presupuestos, resumen de proyectos y arranque local: 36 pruebas del sitio y 81 del admin aprobadas, CSS generado y sintaxis de JavaScript correctos, `design:check` y build aprobados. Vite conserva un aviso de bundle mayor de 500 kB (553,52 kB JS). En esta revisión no se repitió QA visual; las comprobaciones de navegador anteriores mantienen sus fechas y alcance. Se conserva la publicación exclusiva de `dist/`, sin desplegar el dashboard. Credenciales, herramientas, capturas, dependencias y build del admin quedan fuera de Git; los registros y blobs del navegador no forman parte de esta sincronización.

- **26 noviembre, perfil y Acuerdos:** eliminado el rótulo Tu espacio de trabajo del lateral; el avatar abre `/perfil`, con edición compartida de nombre, rol, teléfono, correo y foto (JPG/PNG/WebP hasta 1 MB). Acuerdos en navegación y `/acuerdos/:id`: creación de texto/PDF, proyecto, socios firmantes previstos, revisión, versiones consultables/descargables, búsqueda, papelera/restauración y vinculación explícita de documentos existentes sin duplicarlos. Usa `documents.kind=agreement` y conserva las rutas de documentos/proyectos. Cambiar contenido o firmantes conserva una versión y vuelve a Borrador. El usuario confirmó implementar el funcionamiento local y configurar el proveedor después: no hay identidad verificada, envío ni firma real; el flujo se detiene con Firmar deshabilitado. 81 pruebas y build aprobados; QA separado en localhost confirmó foto/datos persistentes, nueva versión, revisión, vínculo de documento, teclado y móvil de 390 px. No se modificaron perfiles ni acuerdos en el origen habitual. Captura: `.local/acuerdos-perfil.jpg`.

- **26 noviembre, lista de presupuestos:** columnas distribuidas por todo el ancho y autor de creación visible, obtenido del primer registro de Creación del LOG; sin evidencia de autor muestra Autor no registrado, nunca el editor o socio actual. A petición del usuario, todas las acciones de la lista son botones de icono visibles (incluyendo duplicar, fijar, predeterminar, archivar, papelera y ordenar), sin diálogo de Más acciones. El detalle conserva su organización previa. 77 pruebas y build aprobados; QA de fijar/desfijar, archivar/reabrir, Enter/Escape con foco restaurado y móvil de 390 px sin desbordamiento. Datos QA únicamente en localhost. Captura: `.local/lista-presupuestos.jpg`.

- **26 noviembre, contraste funcional con Monymi:** revisión acotada por el usuario a Presupuestos. Referencia remota confirmada `17dbd482a7d1d1df3874a0f43a46fcaf8aee3fb3`. El usuario eligió expresamente mantener las reglas NOODO (proyecciones sin débito, completar manualmente) y equiparar funciones. Se añadieron filtros múltiples de grupos/categorías/cuentas, fechas e importes, búsqueda por metadatos, ordenación de movimientos, totales por grupo, gráficos de grupos y tendencia de 30 días, edición rápida de montos, gastos desplegables en Tabla y Guardar y registrar otro. Se corrigió el orden de categorías/grupos para conservar posiciones de otros grupos y registros ocultos/retirados. 75 pruebas y build aprobados; QA local separado cubre filtros, CSV, soporte TXT, edición, duplicación, archivo, restauración y móvil. No se modificó el módulo de Cuentas ni se incorporaron servicios/datos personales de Monymi. Comparación y límites en `noodo-admin/docs/presupuestos-monymi.md`.

- **26 noviembre, detalle de presupuesto:** contexto junto al título, Copiar enlace por icono, totales en una fila de escritorio (dos columnas en móvil) y filtros ocultos cuando la vista no tiene registros; una búsqueda sin coincidencias conserva sus filtros. Panel derecho dedicado a comentarios propios del presupuesto, conservados al vincular/desvincular proyectos, con menciones y enlaces desde búsqueda/notificaciones. Acciones anteriores en Más acciones y métricas complementarias en Detalle del cálculo. Aprobación local con socio, fecha e historial acumulativo del plan revisado; cambios de nombre, proyecto, monto o estructura requieren revisión, mientras gastos y preferencias no la invalidan. No equivale a identidad autenticada ni firma. QA en `localhost:5173`: comentario y aprobación persistentes tras recarga, cambio de estructura, filtros, móvil de 390 px y Escape/restauración de foco. 70 pruebas y build aprobados. El presupuesto del usuario no fue aprobado ni modificado durante QA.

- **26 noviembre, creación desde proyecto:** Nuevo presupuesto junto a Asignar presupuesto en Cotizaciones abre el editor compartido con el proyecto fijado y lo conserva al guardar; después abre el presupuesto. El editor global conserva su selector libre. Creación verificada en el origen QA, 66 pruebas y build aprobados.

- **26 noviembre, resumen y calendario:** descripción ampliada en la izquierda del resumen, documentos vigentes y presupuestos vinculados debajo de Próximos pasos en la derecha del contenido central; se apilan en móvil. Listas de hasta cinco registros con Ver todos y estados vacíos. La edición/expansión del alcance conserva su columna. Agenda lateral compacta con fecha/hora, estado y título; participantes y lugar permanecen en el detalle. 66 pruebas del admin y build aprobados; navegación y móvil verificados con datos QA separados en `localhost:5173`. Contrato actualizado en `noodo-admin/docs/component-contracts.md`.

- **26 noviembre, clon Windows:** copia local en `C:\Users\brian\Documents\ChatGPT\Noodo`, con Node 24.14.1/npm 11.11.0 y Python 3.14.10 portables en `.tools/` (ignorada). Arranque conjunto: `./iniciar-local.ps1`; activar herramientas en PowerShell: `. ./entorno-local.ps1`. `core.autocrlf=false` en este clon conserva las huellas de diseño y el CSS generado; no actualizar huellas para compensar CRLF. Verificación nueva: 36 pruebas del sitio, 66 del admin, build correcto y HTTP 200 en ambos servidores. Detalles y límites en `docs/LOCAL_WINDOWS.md`. No se hizo commit/push; la credencial encontrada de `gh` requiere reautenticación para usar esa CLI.

- **13–14 noviembre:** borradores del acuerdo de fundadores, versiones 2–4 y plan operativo, conservados en `documentos/`.
- **16–24 noviembre:** evolución de perfiles, álbumes, reproductor, mobile, géneros, Comunidad, Radar, tema compartido, checkout demo y biblioteca Figma. Detalle histórico en `docs/HISTORIAL_WEB.md`, `DESIGN_SYSTEM.md`, `CHECKOUT.md` y revisiones de UI.
- **24 noviembre en adelante:** dashboard amplía expedientes, tareas/subtareas, conservación de LOG, socios, documentos versionados, comentarios, presupuestos, enlaces contextuales, edición en línea, prioridades y menciones. Los contratos detallan la evolución; algunos párrafos anteriores fueron reemplazados por decisiones posteriores.
- **26 noviembre:** Me gusta abre favoritos directamente (base `4f90494`); se consolida la aplicación administrativa completa, documentos, recursos y estas instrucciones en un mismo repositorio. Rutas del DS portables y puerto de datos fijo.
- **Pendientes reales:** autenticación/roles, backend y DB compartida, almacenamiento remoto y backups con blobs, streaming/transcodificación/licencias, catálogo y carga de artistas, moderación real, Comunidad/presencia remotas, pagos/aforo/validación de boletas, firma, notificaciones externas y despliegue protegido del portal.
- Mantener el prototipo útil mientras se integran servicios; no improvisar un proveedor, stack de servidor o permisos a partir de nombres de componentes. Decidir arquitectura con los requisitos vigentes y una tarea explícita.

Al cerrar trabajo relevante, actualizar aquí decisiones vigentes, límites y pendientes, y documentar comprobaciones con fecha. La memoria incluye solo información de NOODO; nunca copiar conversaciones personales o datos de otros proyectos.

- **26 noviembre, corrección de Artistas:** el acceso público abre `artist-directory` con todos los perfiles únicos del catálogo mediante `noodoArtistCollection`; no solicita perfil demo para consultar artistas. Guardar/seguir conserva el control existente. Sidebar expandido: 56 px de altura, padding de 16 px y gap de 8 px; rail plegado de 44 px. El commit anterior tenía los mismos estilos: se amplía el componente por la solicitud visual, no se revierte el resto de la app.
  Validación: 38 pruebas del sitio aprobadas, CSS generado sincronizado y sintaxis JS correcta. Sin nueva revisión visual: el control del navegador no está disponible en esta sesión. Cambios locales, pendientes de publicación.

- **26 noviembre, refinamiento del sidebar (UI 85):** sustituye las medidas UI 84 por botones de 48 px, padding vertical de 4 px y texto Body de 16 px con interlínea Label. Sidebar expandido anclado a la izquierda; se absorbe el antiguo desplazamiento en su ancho para mantener alineado el contenido central. Rail plegado conservado.

- **26 noviembre, mapa online:** el despliegue de Pages configura Mapbox con `scripts/configure-mapbox.cjs`, exige el secret público `MAPBOX_PUBLIC_TOKEN` y recorta espacios de su valor. Versiona la URL de configuración en los cuatro HTML con el ID y el intento de Actions para no reutilizar una configuración vacía en caché después de configurar el secret. El token se inyecta solo en el artefacto publicado; no se incorpora al historial Git. Diagnóstico: SDK y estilo de Mapbox respondieron HTTP 200 con el token publicado; la vista abierta aún usaba la configuración previa. Pruebas de publicación cubren todas las entradas, nuevos runs/reintentos y rechazo de tokens ausentes o no públicos.

- **UI 86, ajuste posterior:** sidebar sin desplazamiento izquierdo también en la regla base de escritorio/tablet. Botones expandidos de 44 px, padding vertical de 2 px y separación de 4 px; texto de 16 px conservado. Requiere recargar la página abierta para aplicar el CSS actualizado. Sin revisión visual nueva en navegador.

- **UI 87:** texto del menú aumentado exactamente 2 pt mediante token semántico (16 px + 2 pt); sidebar expandido 50 px más ancho en escritorio y reproductor lateral de 272 a 372 px desde 1101 px. Se conservan las dimensiones compactas de tablet, móvil y barras plegadas.

- **UI 88:** Artistas incluye Bandas recomendadas mediante el mismo montaje de tarjetas adaptables que Inicio, con Ver todas al final. ArtistCard muestra reproducción como botón circular de icono de 44 px y conserva su nombre accesible específico por artista. Sin revisión visual nueva; comprobaciones automatizadas y sintaxis del sitio.

- **Publicación UI 88:** se preparan juntos los ajustes UI 84–88 de directorio de artistas, recomendaciones, iconos de reproducción y dimensiones del sidebar/reproductor. Validación: 41 pruebas aprobadas, sintaxis JS y CSS generado correctos. Se conserva la configuración local Mapbox fuera del commit. No se repitió QA visual de navegador.
