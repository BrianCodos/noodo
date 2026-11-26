# Contratos compartidos del portal

Revisión: 24 de noviembre de 2026. Fuente: sistema de diseño v0.3 vigente, tokens importados directamente. Estas extensiones administrativas se componen con sus contratos; no crean otra paleta.

- `PageHeader`: título y descripción opcional, sin antetítulos. `SectionToolbar` reúne las acciones y controles de cada sección debajo del encabezado, dentro de la columna central.
- `Dialog`: única superficie de edición en los módulos React, con foco contenido, Escape, cierre, restauración de foco y aviso de cambios sin guardar. `Field`, `Select`, `Textarea`, `Alert` y `FormActions` son comunes a todos los formularios.
- `AppShell` mantiene tres zonas: navegación izquierda, trabajo central y `ContextSummary` permanente a la derecha. `Workspace` + `DetailPanel` llenan ese único espacio de apoyo por medio de `ContextTarget`; las pantallas no crean columnas derechas propias. Al navegar se recupera el contexto de la sección o proyecto. En móvil se apilan las zonas y se ofrecen enlaces para ir al apoyo y volver al contenido. `revealContext` acerca el resumen al seleccionar una reunión.
- `DetailSection`: secciones del expediente con encabezado y acción coherentes.
- `TaskEditor`: un solo formulario para el tablero general, proyectos y compromisos de reunión. `TaskList` comparte el cambio de estado con el tablero.
- `MinutesEditor`: un solo formulario para Actas y el expediente de la reunión.
- `RecordAttachments`: misma carga, apertura en el visor y descarga en reuniones y recibos contables; archivos de hasta 10 MB, entradas nuevas sin sobrescritura.
- `FollowUps`: notas cronológicas acumulativas para reuniones y tareas.
- `DataTable`: tabla semántica con filtros externos, orden, paginación y adaptación móvil; usada también en Contabilidad y LOG.

Comunidad sigue siendo la vista externa existente del prototipo en el puerto 4174. Sus formularios y almacenamiento no pertenecen al árbol React ni al LOG del portal; su integración requerirá sustituir el iframe o acordar un puente entre ambas aplicaciones.

## Conservación

La carga normaliza las nuevas colecciones sin reemplazar registros antiguos. Cada guardado añade al LOG módulo, acción, fecha, autor local y versiones anterior/posterior; no se recorta a las últimas 200 entradas. Los registros anteriores sin esas versiones se identifican como históricos.

No existe control de borrado de reuniones ni del LOG. Cancelar reuniones y anular movimientos conserva relaciones e historial. Se retiró el vaciado global desde Configuración. La garantía se limita a la interfaz local: una auditoría inalterable y compartida requiere servidor y cuentas individuales.

## Proyectos y ejecución · propuesta implementable

- `ProjectScope`: las rutas de tareas, cotizaciones, actas, documentos y contabilidad seleccionan un proyecto y abren su sección. El proyecto conserva su ID en toda edición. Calendario y Contactos tienen vistas globales de los mismos registros, además de sus vistas dentro de cada proyecto.
- `ProjectTaskTable`: tabla semántica jerárquica, una tarea con un nivel de subtareas, filas desplegables, responsable, estado, inicio, límite, progreso, entregables y comentarios. Edición con el mismo `TaskEditor` en diálogo; selección abre `DetailPanel`. Las columnas se adaptan al ancho del contenedor sin desplazamiento horizontal; el detalle mantiene toda la información.
- `TaskProgress`: porcentaje manual de 0 a 100 en hojas; promedio simple de subtareas en padres. Completar una tarea con subtareas exige completar cada subtarea. Reabrir una hoja completada devuelve el avance a cero.
- `TaskDeliverables`: definición, criterios de aceptación, fecha y estado (Pendiente / En revisión / Entregado), con enlace HTTPS opcional y archivos acumulativos por entregable. Los comentarios reutilizan `FollowUps` por ID de tarea/subtarea.
- Migración: registros sin proyecto se asignan a Gestión interna NOODO; referencias a proyectos ausentes recuperan un expediente con el mismo ID. Se conservan IDs, adjuntos e historial. Contactos compartidos permanecen vinculados a uno o varios proyectos.

## Consulta central, búsqueda y documentos

- El panel derecho muestra resúmenes breves y accesos. `Ver reunión` lleva a `/reuniones/:id`, con información, actas, compromisos, adjuntos y seguimiento en el centro. No contiene todo el expediente en pestañas laterales. `Documentos` reúne actas y archivos de la reunión.
- `/registros/:collection/:id` centraliza detalles de tareas, movimientos, contactos, cotizaciones y entradas del LOG. Los editores siguen reutilizando `Dialog`.
- `DocumentViewer` es común a documentos legales y `/visor/:kind/:id`. Muestra borradores y actas como texto, PDF con el visor del navegador, PNG/JPEG/WebP e imágenes compatibles, y TXT como texto escapado. Los archivos de Office se descargan para abrirlos en su aplicación. No se envían documentos a visores externos. Los enlaces temporales se liberan al cambiar de archivo.
- El buscador superior lleva a `/buscar?q=…`: consulta registros estructurados, contenido de actas y borradores, relaciones y catálogo local. Los adjuntos se buscan por nombre y metadatos; no por su contenido binario. El almacenamiento externo del iframe de Comunidad aún no se indexa. No es un motor de búsqueda de Internet.
- `catalog:sync` genera el índice desde las fuentes existentes de noodo en desarrollo y compilación, sin modificarlas; `/catalogo/:id` abre su ficha central.
- `upcomingMeetings` / `upcomingEvents` filtran con fecha y hora de Bogotá, omiten reuniones canceladas y realizadas y ordenan próximos encuentros incluso entre meses. Dentro de un proyecto solo se muestran sus reuniones.

## Cabecera compacta, filtros y socios · 24 de noviembre

- `AppBackLink`: único punto de regreso, al inicio del contenido central; destino determinado por la jerarquía del registro. No depende de historial externo ni duplica botones en las barras de acciones.
- `ProjectHeader`: título/cliente, asignación a socios, estado, copiar enlace y editar en una barra adaptable; `project-tabs` inmediatamente debajo. Asignaciones se editan en `Dialog`. Compartir copia el enlace local, sin publicar ni enviar mensajes.
- `TaskToolbar`: título, progreso del proyecto, contadores, búsqueda y creación en una barra. `ColumnFilter` usa un selector accesible en las columnas Responsable, Estado y Avance, con foco visible y opción Todos. Las condiciones se combinan; los padres de subtareas coincidentes se conservan como contexto.
- `PartnerManager` en Configuración: añadir, editar y desactivar socios sin borrado. Brian Cobaleda y Keyla Ortiza son los socios iniciales. Asignación por IDs estables; nombres visibles actualizados sin reescribir snapshots históricos. No crea cuentas de acceso ni invitaciones.

## Calendario y contactos globales · 24 de noviembre

- El menú compartido de escritorio y móvil incluye Contactos y Calendario. `/calendario` reutiliza `Meetings` sin filtro de proyecto y conserva su calendario mensual. `/contactos` reutiliza `Contacts` como directorio completo.
- Las vistas globales y las de proyecto consultan las mismas colecciones, sin duplicar registros. Crear desde la vista global exige elegir proyecto mediante `ProjectSelect`; desde un proyecto, la relación se conserva automáticamente. Los contactos muestran enlaces a todos sus proyectos.

## Paneles, documentos y copias de proyecto

- `AppShell`: panel izquierdo plegable a iconos y panel de apoyo plegable a un control de reapertura. Preferencias locales, transición suave y respeto a movimiento reducido. El detalle seleccionado puede reabrir el apoyo. En móvil se conserva el menú modal y el apoyo apilado.
- `ProjectTaskTable`: columnas según ancho del contenedor, sin scroll horizontal. Nombre, estado y controles esenciales permanecen; los datos ocultos se consultan en el detalle. Los filtros siguen accesibles en anchos pequeños. Añadir subtarea junto al nombre de la principal abre el editor y expande sus hijas al guardar.
- `ProjectHeader`: equipo con avatares (foto opcional en Socios, iniciales como respaldo), sin subtítulo de cliente. Duplicación configurable de estructura, tareas/subtareas y cotizaciones en borrador, con IDs nuevos y reinicio del avance; sin copiar ejecuciones, archivos, historial ni movimientos contables.
- `ProjectDocuments`: tabla única para actas, documentos y adjuntos de todo el proyecto; crear acta, subir archivo, abrir, resubir versión, ver historial y enviar a papelera/restaurar. Las versiones y los blobs anteriores se conservan. Actas se integra en Documentos; Eventos reutiliza el calendario de reuniones. Las rutas anteriores redirigen a sus equivalentes.

## Lista jerárquica de proyectos y acciones de sección

- `SectionActions` coloca acciones de la pantalla en el espacio superior de `AppBackLink`, junto a Volver. El componente comparte el destino de montaje de `SectionActionsProvider` y elimina sus acciones al salir de la pantalla; no mantiene copias de handlers ni estado del formulario. Proyectos usa este espacio para Nuevo proyecto.
- `ProjectList` es la única vista de Proyectos. Cada fila despliega sus tareas principales y cada tarea despliega sus subtareas, conservando columnas de estado, responsable y fecha. Los botones tienen nombre accesible y `aria-expanded`. Los nombres siguen siendo enlaces al expediente.
- `DataTable.renderAfterRow` inserta filas relacionadas después de su fila principal. La ordenación y paginación cuentan proyectos; las tareas y subtareas permanecen con su proyecto y no consumen páginas adicionales. Buscar y filtrar no altera los datos ni mezcla tareas de proyectos distintos.

## Navegación contextual y perfil del socio
- `AppBreadcrumbs` resuelve cada ruta desde los registros actuales, conserva enlaces a sus antecesores y marca el destino actual con `aria-current`. Las subtareas incluyen su tarea principal y los adjuntos su expediente de origen.
- La barra superior contiene regreso determinista, ruta y acciones de sección. El título de registros se presenta en esta barra sin repetir el encabezado en el contenido.
- `ActivePartnerProvider` conserva la selección local del socio; no representa autenticación ni cambia permisos. Si se desactiva el seleccionado, usa un socio activo. El perfil comparte `Avatar` y muestra el rol registrado o «Socio»; editar foto/rol en Configuración actualiza la barra lateral.

## Acciones de la lista de proyectos
- Las filas principales incluyen Ver, Editar y Borrar, con nombres accesibles que identifican el proyecto. Editar reutiliza ProjectForm. Borrar requiere confirmación dentro de la app y marca `deletedAt`; Papelera permite restaurar el mismo expediente.
- El borrado de un proyecto conserva tareas, reuniones, documentos, contactos y todo el LOG. El expediente permanece consultable y su estado de papelera se informa en el detalle.
- Los títulos de registros se muestran en el contenido principal; la barra superior conserva ruta, regreso y acciones.

## Acceso a tareas desde la tabla
- El nombre de tarea o subtarea es un enlace a su página de detalle. El botón + de las tareas principales aparece antes del nombre y abre TaskEditor asociado a esa tarea; no se duplica en el panel derecho.
- El ancho expandido del panel contextual aumenta un 10 % (308–440 px, 26.4 vw); el estado plegado conserva 64 px y móvil ocupa el ancho disponible.

- La ruta superior usa tipografía body en escritorio y label en móvil; el destino actual lleva peso 600, fondo secondary y borde sutil, además de aria-current.

## Expediente y conversación de una tarea
- TaskRecordPage reúne información, responsables, fechas, avance, alcance, requerimientos, entregables y archivos propios en el centro. Cada tarea/subtarea conserva su URL por ID y ofrece Copiar enlace con alternativa manual.
- El panel derecho muestra involucrados y FollowUps en modo conversación con editor directo. Cada entrada conserva autor e ID del socio activo, fecha y vínculo a una sola tarea; las entradas anteriores sin autor se identifican como Sesión local. No se atribuyen retrospectivamente.
- Los comentarios siguen siendo locales; no simulan sincronización entre socios ni autenticación. Al cambiar de tarea se reinicia el formulario y se conserva el historial guardado.
- Las superficies panel recortan sus fondos y filas a su radio. Los controles mantienen el foco visible dentro del contorno.

## Presupuestos locales · adaptación de Monymi

- Nueva sección global `/presupuestos`, conserva LOG. Un presupuesto tiene nombre, techo opcional, grupos, categorías con asignación, gastos reales/proyectados y cuentas de pago. Puede vincularse opcionalmente a un proyecto.
- Listado, categorías jerárquicas desplegables, tabla, distribución y movimientos reutilizan PageHeader, Workspace, DetailPanel, DataTable y Dialog. Orden por botones accesibles; colores semánticos del DS y símbolos de grupos.
- Crear desde cero o copiar estructura; duplicar regenera IDs de categorías y grupos, reinicia ejecución y no copia gastos, archivos ni enlaces. Fijar (máximo cinco), predeterminar, archivar, papelera y restaurar.
- Gastos con fecha, fuente y versiones de soportes en IndexedDB. Proyectados reservan presupuesto pero no descuentan saldo de una cuenta hasta marcarse reales. Cambios de cuenta, importe y anulación actualizan saldos atómicamente en el mismo guardado; no duplican movimientos en Contabilidad.
- Categorías con movimientos deben vaciarse mediante traslado o anulación antes de retirarse. Se conservan categorías retiradas, gastos anulados, soportes e historial. Sin purga automática ni compartición pública.
- Migración aditiva en la base existente; cálculos monetarios a centavos, relaciones validadas y LOG anterior/posterior. Un enlace local no da acceso desde otro equipo.

## Resumen y comentarios del proyecto
- Las tarjetas del resumen usan fondo transparente y conservan el borde, radio y espaciado existentes. El cambio se limita al resumen del proyecto.
- El panel derecho del resumen muestra `FollowUps` en modo conversación con `entityType=project`, autor, fecha, hilo cronológico y formulario en línea. Reutiliza `Workspace` y `DetailPanel`.
- Cada proyecto conserva un hilo independiente, acumulativo y local; no mezcla comentarios de tareas o reuniones. Cambiar de proyecto reinicia el borrador del formulario.

## Edición enriquecida del alcance
- `RichTextEditor` permite negrita, resaltado, listas numeradas/con viñetas y alineación izquierda, centro, derecha o justificada. Barra con nombres accesibles y selección conservada al aplicar formato.
- `ProjectDescription` añade Editar / Guardar cambios / Cancelar dentro de Sobre el proyecto. El formulario general reutiliza el editor para conservar formatos.
- Se conserva `description` como texto compatible y `descriptionRich` como árbol estructurado de texto, bloques y marcas permitidas; no se ejecuta ni renderiza HTML arbitrario. Pegado como texto sin formato.
- En proyectos sin comentarios se omiten el nombre repetido y el hilo vacío, manteniendo el formulario accesible inmediatamente bajo el título.

## Contactos, calendario y cambio de proyecto
- Contactos: nombre/foto como botón accesible que revela `DetailPanel` con todos sus datos y proyectos vinculados. Filtro de relaciones por casillas, combinación OR, disponible desde Relación y la barra de filtros incluso sin resultados.
- Calendario: el día selecciona su agenda en el panel derecho; el botón + conserva la creación. Sin día/evento seleccionado, el panel lista los próximos eventos, incluyendo catálogo en la vista global. Las tarjetas inferiores se retiran sin borrar datos. Cambiar de mes limpia la selección; se ofrece volver a próximos eventos.
- Flecha de la ruta del proyecto: selector con búsqueda y todos los proyectos disponibles, conserva la sección actual (eventos, tareas, documentos, etc.). Reutiliza Dialog para teclado, foco y tamaños pequeños.

## Categorías de presupuesto y responsables en proyectos
- Categoría: título desplegable arriba a la izquierda, acciones directas horizontales a la derecha con nombres accesibles (añadir gasto, editar, completar/reabrir, retirar y ordenar). Se retira el contador de gastos del título; el estado completado sigue visible.
- Asignado, real, proyectado y disponible se presentan como métricas independientes, alineadas; real y proyectado permanecen lado a lado también en móvil. Los controles se adaptan sin desbordar la tarjeta.
- Lista jerárquica: expansores con `aria-expanded` y estilo activo persistente. Responsables con Avatar de cada socio, foto guardada o iniciales de respaldo, nombre accesible y tooltip; sin nombres de texto en la celda.
- Columna Prioridad para proyectos, tareas y subtareas. La prioridad opcional del proyecto se edita en su formulario y se guarda localmente; registros anteriores sin prioridad muestran Sin definir. Las tareas conservan su prioridad y valor predeterminado Media.

## Cabeceras, acciones de fila y autoría local
- PageHeader presenta el título y las acciones en una misma fila, con la descripción debajo. Se elimina el destino de acciones en la topbar. Proyectos y detalles de registros usan el mismo contrato.
- Acciones de fila con iconos, `aria-label`, `title` y objetivo mínimo de 44 px. Las opciones extensas se abren desde Más acciones en Dialog; las opciones del diálogo incluyen icono y texto.
- LOG muestra Realizado por junto a Cambio. Cada guardado captura ID y nombre del socio activo en ese momento, incluso al duplicar y en actualizaciones derivadas. Las derivadas conservan su origen Cálculo local. Historial anterior intacto; selección local no equivale a identidad autenticada.

## Apertura, prioridad y alcance expandido del proyecto
- El título y metadatos de cada proyecto forman un enlace amplio a su detalle; el expansor de tareas permanece independiente.
- PrioritySelect permite guardar desde la celda Low, Medium o High (valores internos Baja/Media/Alta para conservar los datos). Sin definir solo identifica registros antiguos; los errores de guardado permanecen visibles.
- ProjectDescription presenta un extracto de descripciones largas, con Ver más/Ver menos. Expandir o editar ocupa las dos columnas del resumen y desplaza Próximos pasos debajo. Guardar o cancelar devuelve el panel a su tamaño compacto, conservando el contenido enriquecido completo.
- ProjectHeader alinea equipo, estado y acciones en una fila común bajo el título, con ajuste de líneas en móvil. Los iconos siguen dentro de Button, Avatar y StatusBadge; ProjectTeam encapsula los participantes.

## Presupuestos vinculados y edición directa de cabecera
- La pestaña Cotizaciones del proyecto presenta presupuestos existentes vinculados mediante Budget.projectId, con métricas vivas; no copia importes ni gastos. Asignar ofrece presupuestos activos sin proyecto, excluye los asignados a otros; desvincular conserva todo el presupuesto y registra el cambio en LOG. Las cotizaciones anteriores permanecen consultables en un bloque secundario.
- EditableProjectName muestra borde punteado en hover/foco y edición en línea con Field, guardar/cancelar por iconos, Enter/Escape y validación de nombre no vacío. Guardar actualiza el mismo ID, rutas y LOG.
- ProjectTeam ofrece + con borde punteado y abre ProjectTeamEditor con selección múltiple de socios existentes; conserva miembros inactivos ya asignados y las asignaciones de tareas. No crea cuentas ni invita personas.

## Menciones y notificaciones locales
- MentionTextarea sugiere socios activos del proyecto (responsables directos y de sus tareas) al escribir @. Filtra por nombre, admite flechas/Enter/Escape y conserva el cursor al insertar el nombre completo.
- El guardado deriva menciones válidas del texto y el alcance actual; las guarda por ID y nombre en el comentario inmutable. No atribuye menciones a comentarios históricos ni a personas fuera del proyecto.
- NotificationInbox muestra las menciones recibidas por el socio activo, excluye automenciones, conserva lectura por socio en almacenamiento local y enlaza al comentario exacto. La entrega es local al navegador; no simula correo, push ni sincronización remota.
- EditableProjectName mide el texto a la tipografía de título, suma 10 % y el padding del campo, limitado al ancho móvil. Avatar y + del equipo usan el mismo diámetro de 44 px.
