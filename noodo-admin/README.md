# NOODO · Dashboard de socios

Portal administrativo local en React, TypeScript y Vite. Incluye proyectos, tareas/subtareas, socios, contactos, reuniones, documentos versionados, presupuestos, cuentas manuales, contabilidad, comentarios, menciones y LOG. Comparte el sistema de diseño del sitio musical.

## Instalación

Requiere Node.js 24 y npm. Desde `noodo-admin/` dentro del repositorio completo:

```sh
npm ci
npm run dev
```

Abrir [dashboard](http://127.0.0.1:5173/inicio) o [presupuestos](http://127.0.0.1:5173/presupuestos). Vite escucha solo en `127.0.0.1`, puerto fijo 5173. Si está ocupado, detener el servidor anterior antes de iniciarlo; cambiar puerto/hostname abre otra base local.

Para Comunidad y enlaces al catálogo, iniciar en otra terminal, desde la raíz del repositorio:

```sh
python3 -m http.server 4174 --bind 127.0.0.1 --directory dist
```

`npm run dev` y `npm run build` verifican la versión/huella del DS y regeneran el catálogo. `scripts/design-system-path.mjs` admite el clon con `../dist/` y la distribución original con `../noodo-design-system/dist/`. Vite importa los tokens compartidos a través de `@noodo/tokens`; no se necesita copiar archivos ni cambiar rutas al instalar en otro computador.

## Navegación y comportamiento

| Ruta | Contenido |
| --- | --- |
| `/inicio` | Resumen y próximos compromisos. |
| `/proyectos` | Lista jerárquica, filtros, prioridades, responsables y papelera/restauración. |
| `/proyectos/:id/:tab?` | Expediente, alcance enriquecido, tareas, eventos, documentos, presupuestos/cotizaciones, contactos, contabilidad y actividad. |
| `/contactos`, `/calendario` | Directorio y calendario globales, con los mismos registros de los proyectos. |
| `/presupuestos/:id?` | Grupos/categorías, asignaciones, gastos reales/proyectados, cuentas manuales, soportes y vistas. |
| `/reuniones/:id`, `/registros/:collection/:id` | Expedientes y detalle central de registros. |
| `/visor/:kind/:id`, `/documentos/:id` | Actas, archivos y revisión de documentos. |
| `/documentos/:id/firmar` | Recorrido pendiente de integración; no crea firmas. |
| `/buscar?q=…`, `/catalogo/:id` | Búsqueda local y fichas del catálogo generado. |
| `/log` | Historial acumulativo con autor local y versiones anterior/posterior. |
| `/configuracion#socios` | Socios, fotos, roles, perfil activo y exportación. |
| `/comunidad`, `/componentes` | Administración de Comunidad en iframe y catálogo de componentes. |

Las rutas `/tareas`, `/cotizaciones`, `/contabilidad`, `/actas` y `/legal` llevan a selección de proyecto. No crean registros independientes. La pestaña Cotizaciones de un proyecto muestra presupuestos vinculados y conserva las cotizaciones anteriores en un bloque secundario.

Tareas con un nivel de subtareas; progreso manual en hojas y promedio en padres. Cada tarea/proyecto mantiene conversación propia. Las menciones `@` generan notificaciones locales al socio seleccionado, sin correo ni push. Desactivar socios conserva asignaciones e historial.

Duplicar proyectos/presupuestos genera nuevos IDs y reinicia ejecución. Las proyecciones presupuestales no descuentan cuentas; pasar a gasto real sí. No se duplican esos gastos en Contabilidad. Archivos y soportes conservan sus versiones; papelera/restauración no purga registros.

## Datos y límites

- Registros: `localStorage['noodo.admin.v1']`. Adjuntos: IndexedDB `noodo-admin-files`, store `files`.
- El origen habitual es `http://127.0.0.1:5173`. `localhost` es un origen diferente y se reserva para QA con ejemplos.
- Exportar JSON desde Configuración incluye registros, historial y borradores; **no incluye archivos adjuntos**. Descargar los archivos por separado. No existe un flujo completo de importar/restaurar backups desde la interfaz.
- Un clon o push guarda el proyecto de código, no los datos guardados en tu navegador. No hay sincronización entre equipos o socios.
- Socio activo es una preferencia local, no autenticación ni permisos. Cuentas son saldos manuales, no conexiones bancarias. La firma real está deshabilitada.
- No hay borrado de reuniones/LOG, vaciado global ni purga automática. Las migraciones conservan IDs y relaciones; errores de lectura/cuota no deben borrar datos.
- La moneda es COP y las fechas se presentan para Colombia. Los datos iniciales son ejemplos.

## Desarrollo y verificación

```sh
npm run design:check
npm test
npm run build
```

`noodo-admin/dist/` es un build descartable e ignorado; el `dist/` de la raíz contiene el sitio y se conserva. `npm run preview` sirve el build para revisión, pero su puerto predeterminado es otro origen de datos.

Leer [AGENTS.md](AGENTS.md) y las instrucciones generales en la raíz. [Contratos](docs/component-contracts.md) documenta componentes y evolución; sus últimas decisiones prevalecen sobre secciones antiguas. [Presupuestos](docs/presupuestos-monymi.md) detalla cálculos y adaptación de Monymi. [Historial](docs/HISTORIAL_PORTAL.md) conserva notas anteriores; no es el estado vigente.

El código del dashboard está incluido en el repositorio. El workflow de GitHub Pages solo publica el sitio musical; el portal no está desplegado. Backend, cuentas, permisos, archivos remotos, colaboración y proveedor de firma siguen pendientes.
