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

## Resumen ampliado y agenda compacta · 26 de noviembre de 2026

- `ProjectBudgets` ofrece Nuevo presupuesto junto a Asignar presupuesto. Reutiliza `BudgetEditor` con el proyecto fijado por contexto; conserva creación desde cero o copia de estructura y abre el presupuesto guardado. Desde el módulo global, la selección de proyecto sigue siendo editable. Verificado por creación real en el origen QA, apertura con Enter y vista móvil de 390 px; 66 pruebas y compilación correctas.

- `ProjectOverview`: descripción amplia en la columna izquierda; Próximos pasos, Documentos y Presupuestos en una pila derecha dentro del contenido central. Comentarios conserva el panel de apoyo. En móvil se apilan las secciones; ampliar o editar la descripción mantiene su columna.
- Documentos reutiliza `projectDocumentRows` con la tabla del proyecto: documentos, actas y versión vigente de adjuntos, excluyendo papelera. Presenta hasta cinco registros por fecha, tipo, versión y enlace al visor; Ver todos abre la colección completa.
- Presupuestos lista hasta cinco registros vinculados por `projectId`, excluye papelera e identifica archivados. Importes calculados con `budgetMetrics`, sin copiar ni alterar datos; el estado vacío enlaza a la asignación.
- Agenda del calendario: filas compactas con fecha/hora, estado o etiqueta de ejemplo y título. Seleccionar por clic o Enter conserva el detalle con lugar, participantes y acceso al expediente. Texto de al menos 12 px y objetivo interactivo de al menos 44 px.
- Verificación: 66 pruebas aprobadas, build correcto y huellas del DS intactas. En navegador se revisaron escritorio y móvil de 390 px, apertura de documento, presupuesto vinculado con importes, editar/cancelar descripción y selección de evento con Enter. Sin desbordamiento global en los anchos móviles comprobados; el calendario también se comprobó a 320 px. Datos de prueba creados únicamente en `localhost:5173`, separados del origen habitual `127.0.0.1:5173`.

## Detalle compacto, conversación y aprobación de presupuestos · 26 de noviembre de 2026

- `PageHeader.titleMeta` permite contexto junto al título, con ajuste de líneas; la descripción normal sigue debajo para otras pantallas. En presupuesto, Copiar enlace usa `IconButton` con nombre accesible y tooltip.
- Totales: cuatro métricas en una fila de escritorio, dos columnas cuando el contenido tiene 480 px o menos. Detalle del cálculo despliega asignación, saldo sin asignar y compromiso; las alertas de excesos quedan visibles sin desplegarlo.
- El panel de apoyo contiene exclusivamente el hilo del presupuesto con `FollowUps`. Las acciones de edición, preferencias, duplicación, archivo y papelera se conservan en Más acciones, mediante `Dialog`.
- Los filtros dependen de los registros disponibles en la vista, nunca del resultado filtrado. Sin categorías/grupos o sin movimientos se ocultan; una búsqueda sin coincidencias conserva controles para corregirla.
- Comentarios de tipo `budget` pertenecen al ID del presupuesto. Un presupuesto general conserva `projectId` vacío y no genera un proyecto artificial; vincular o desvincular conserva los comentarios y su procedencia. Menciones disponibles: socios activos del proyecto vinculado o todos los activos en presupuestos generales. Búsqueda y notificaciones abren el comentario exacto.
- Aprobación local: registro explícito del socio activo, nombre histórico, fecha y copia del plan aprobado. El historial no se sobrescribe ni se hereda al duplicar. Cambios de nombre, proyecto, monto, categorías o grupos muestran Requiere nueva revisión; ejecución de gastos, orden, colores y preferencias no cambian el plan. Coincidir con un plan ya revisado recupera esa aprobación y su fecha original. No representa firma electrónica ni identidad autenticada.
- Verificación actual: 70 pruebas automatizadas, compilación y huellas del diseño correctas. QA interactivo en `localhost:5173`: presupuesto general, comentario y aprobación persistentes después de recargar, cambio de estructura con aprobación anterior conservada, filtros vacíos y sin coincidencias; móvil 390 × 844 sin desbordamiento global; Escape devuelve el foco a Ver aprobación. La vista habitual se inspeccionó sin registrar comentarios ni aprobaciones. Captura local: `.local/presupuesto-compacto.jpg`.

## Paridad funcional de Presupuestos con Monymi · 26 de noviembre de 2026

- Alcance: solo Presupuestos. El usuario confirmó conservar los cálculos y automatismos actuales de NOODO. La matriz de comparación y los límites de integración están en `presupuestos-monymi.md`.
- `BudgetFilterControl`: diálogo con selección múltiple por grupo, categoría y cuenta, fechas e importes inclusivos y estado de gasto. Aplicar conserva el borrador hasta confirmarlo; Cancelar lo descarta. Restablecer limpia el borrador y Limpiar filtros actúa sobre la vista. Los filtros de movimientos se conservan al cambiar de vista pero solo afectan Movimientos; grupos y búsqueda se aplican en todas las vistas.
- `BudgetDistribution`: asignación por grupo, serie diaria de 30 días y tabla de importes accesible. Componentes nativos y SVG con tokens compartidos; sin nuevas bibliotecas. Las categorías filtradas determinan la distribución y la tendencia; los totales de cabecera siempre pertenecen al presupuesto completo.
- `BudgetAmount`: acción de lápiz con objetivo de 44 px abre un diálogo enfocado en el monto total o la asignación. Reutiliza Field, FormActions, Alert y conservación de cambios. Los registros bloqueados conservan la lectura.
- Tabla: expansor de categoría independiente de editar; detalle de movimientos usa las mismas acciones de gastos y soportes. En móvil las filas de detalle ocupan el ancho disponible y conservan sus nombres accesibles.
- Guardar y registrar otro confirma un gasto y abre otro formulario limpio en la misma categoría. Desactivado durante el guardado; no duplica el gasto recién confirmado. El orden de grupos/categorías mantiene las posiciones de registros ocultos y retirados.
- Verificación: 75 pruebas, build y design:check correctos; QA interactivo de filtros, CSV, cálculos, soportes, edición rápida, copia, archivo/restauración y móvil de 390 px. Captura con datos de prueba en `.local/presupuestos-paridad-monymi.jpg`.

## Lista de presupuestos con acciones directas · 26 de noviembre de 2026

- La tabla ocupa el ancho disponible y distribuye nombre, importes y acciones con columnas proporcionales. En móvil conserva la presentación de registros apilados; las acciones se ajustan en varias líneas con objetivos de 44 px.
- Cada presupuesto muestra Creado por a partir del primer registro de Creación del LOG. No se infiere del socio activo ni de ediciones posteriores; registros sin autor conocido muestran Autor no registrado. Las duplicaciones conservan su propio autor de creación.
- Por petición explícita del usuario, la lista presenta todas sus acciones como botones de icono accesibles, sin diálogo intermedio: ver, editar, duplicar estructura, fijar, predeterminar, archivar/reabrir, papelera/restaurar y subir/bajar. Las opciones dependen del estado del registro. El detalle mantiene su diálogo de acciones; los formularios siguen usando Dialog.
- Verificación: 77 pruebas aprobadas, design:check y build correctos. QA en localhost:5173 para fijar/desfijar y archivar/reabrir, apertura por Enter y Escape con retorno al botón, escritorio y móvil de 390 × 844 sin desbordamiento global. El origen habitual se inspeccionó sin cambiar presupuestos. Captura: `.local/lista-presupuestos.jpg`.

## Perfil personal y Acuerdos · 26 de noviembre de 2026

- El lateral omite el rótulo Tu espacio de trabajo. El enlace de avatar abre Mi perfil (`/perfil`), también desde el menú móvil. PartnerEditor se comparte con Configuración: nombre, rol, teléfono, correo y foto; la edición personal no presenta el selector de activación. La selección de socio sigue siendo local y no cambia permisos.
- Las fotos admiten JPG, PNG y WebP hasta 1 MB. Guardar espera a que termine la lectura; Quitar foto modifica el borrador sin enviar el formulario. Los datos se guardan con el mismo ID y LOG, preservando asignaciones.
- Acuerdos tiene lista y expediente central. Reutiliza `documents` con marca opcional `kind: agreement`; no reclasifica automáticamente los documentos existentes. Vincular documento conserva ID, proyecto, archivo e historial. Los acuerdos también aparecen en Documentos de su proyecto y sus enlaces anteriores siguen funcionando.
- El editor permite texto o PDF, proyecto obligatorio y firmantes previstos por ID del directorio de socios. Gestión interna NOODO es la ubicación inicial cuando existe. Las versiones conservan contenido, archivo y selección de firmantes; el guardado de modificaciones vuelve a Borrador. Pasar a En revisión exige al menos un firmante conocido. Papelera/restauración conserva versiones y estado.
- Flujo pendiente: revisión → identidad → firma. El usuario decidió configurar el proveedor después. La etapa de identidad informa la integración pendiente, Firmar está deshabilitado y no se registra ningún estado Firmado. No se envían invitaciones ni documentos. El registro local no representa autorización o identidad verificada.
- Verificación: 81 pruebas, design:check y build correctos. Pruebas de conservación/versiones, validación de firmantes/estados y persistencia del perfil. QA en localhost:5173: guardar/recargar teléfono, correo y PNG de prueba, retirar foto, crear acuerdo, pasar a revisión, visitar firma pendiente, editar y consultar el texto original, vincular documento existente, Escape/restauración del foco y móvil de 390 × 844 sin desbordamiento en lista, expediente y perfil. La carga PDF reutiliza la validación de cabecera/tamaño y el visor local; no se probó una firma remota. Captura: `.local/acuerdos-perfil.jpg`.
